import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { prisma } from '@journal/database';
import { ReflectionAuthor } from '@prisma/client';
import {
  CreateAnalysisDto,
  CreateReflectionDto,
  InitializeChatDto,
} from './dto/analysis.dto';
import {
  AIAnalysis,
  ReflectionResponse,
  InitialChatResponse,
} from './interfaces/ai-analysis.interface';
import {
  AIAPIException,
  AIServiceException,
} from './exceptions/ai-service.exceptions';

@Injectable()
export class AIReflectionService {
  private readonly logger = new Logger(AIReflectionService.name);
  private readonly apiKey: string | undefined;
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('AI_ML_API_KEY');
    this.baseUrl =
      this.configService.get<string>('AI_ML_BASE_URL') ||
      'https://aimlapi.com/api/v1';

    if (!this.apiKey) {
      this.logger.error('AI_ML_API_KEY is not configured');
      throw new AIServiceException('AI service is not properly configured');
    }
  }

  async generateEntryAnalysis(dto: CreateAnalysisDto): Promise<AIAnalysis> {
    const { entryId, entryContent, entryType } = dto;

    try {
      const analysisPrompt = `Analyze this ${entryType} journal entry and provide insights:

"${entryContent}"

Please provide the analysis ONLY as valid JSON (no code fences, no explanations, no extra text). Use this exact structure:

{
  "mood": {
    "primary": "emotion",
    "secondary": "emotion", 
    "score": number,
    "color": "from-color-400 to-color-500"
  },
  "themes": [{"name": "theme", "strength": number}],
  "insights": ["insight1", "insight2", "insight3"],
  "patterns": {
    "writingTime": "time",
    "wordCount": ${entryContent.split(' ').length},
    "sentiment": "sentiment",
    "frequency": "frequency description"
  },
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"]
}`;

      const messages = [
        {
          role: 'system',
          content:
            'You are an empathetic AI journal analysis assistant. Provide thoughtful, supportive insights about journal entries in JSON format. Always return valid JSON only.',
        },
        {
          role: 'user',
          content: analysisPrompt,
        },
      ];

      const response = await this.makeAIRequest(messages);

      let parsed: any;
      try {
        parsed = JSON.parse(response);
      } catch (parseError) {
        this.logger.error('Failed to parse AI analysis response:', parseError);
        throw new AIServiceException('Invalid response from AI service');
      }

      const analysis = this.formatAnalysisResponse(parsed, entryContent);

      await prisma.aiAnalysis.upsert({
        where: { entryId },
        create: {
          entryId,
          moodPrimary: analysis.mood.primary,
          moodSecondary: analysis.mood.secondary,
          moodScore: analysis.mood.score,
          color: analysis.mood.color,
          themes: analysis.themes,
          insights: analysis.insights,
          patterns: analysis.patterns,
          suggestions: analysis.suggestions,
          raw: parsed,
        },
        update: {
          moodPrimary: analysis.mood.primary,
          moodSecondary: analysis.mood.secondary,
          moodScore: analysis.mood.score,
          color: analysis.mood.color,
          themes: analysis.themes,
          insights: analysis.insights,
          patterns: analysis.patterns,
          suggestions: analysis.suggestions,
          raw: parsed,
        },
      });

      return analysis;
    } catch (error) {
      if (error instanceof AIServiceException) throw error;
      if (error instanceof AIAPIException) {
        throw new HttpException(error.message, error.getStatus());
      }
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

  }

  async generateReflectionResponse(
    dto: CreateReflectionDto,
  ): Promise<ReflectionResponse> {
    const {
      entryId,
      userMessage,
      entryContent,
      conversationContext = [],
    } = dto;

    await prisma.reflectionMessage.create({
      data: { entryId, author: ReflectionAuthor.USER, content: userMessage },
    });

    try {
      const contextMessages = [
        {
          role: 'system',
          content: `You are an empathetic AI reflection guide. 
Your role is to help the user explore their journal entry with curiosity, compassion, and variety in language.  

Journal Entry: ${entryContent ? `"${entryContent}"` : 'The user has not provided an entry.'}  

Guidelines:
- Begin by acknowledging what the user shared, but vary how you phrase it (avoid repeating the same sentence stems like “It sounds like…”).  
- Mix in different styles of reflection:  
  • Observations (e.g., "I noticed you mentioned…")  
  • Curiosity (e.g., "What do you think made that moment stand out?")  
  • Perspective shifting (e.g., "How might you see this experience differently if it happened again?")  
  • Emotional mirroring (e.g., "That seems like it brought you peace—does that feel true?")  
- Ask 1–2 thoughtful, open-ended questions to invite deeper reflection.  
- Keep responses short (2–3 sentences max).  
- End with an encouraging follow-up question *unless* the reflection feels complete, in which case conclude warmly (e.g., affirm their insights and suggest pausing to let it settle).  
- Avoid generic advice; focus on curiosity, empathy, and discovery.`,
        },
        ...conversationContext.slice(-4),
        {
          role: 'user',
          content: userMessage,
        },
      ];

      const response = await this.makeAIRequest(contextMessages);

      const aiText = response;

      await prisma.reflectionMessage.create({
        data: { entryId, author: ReflectionAuthor.AI, content: aiText },
      });

      const suggestions = await this.generateFollowUpSuggestions(
        userMessage,
        aiText,
      );

      return {
        content: aiText,
        suggestions,
      };
    } catch (error) {
      this.logger.error('Reflection response generation failed:', error);
      throw new AIServiceException('Failed to generate reflection response');
    }
  }

  async initializeChat(dto: InitializeChatDto): Promise<InitialChatResponse> {
    const { entryId, entryContent, entryType } = dto;

    try {
      const entryTypeText =
        entryType === 'voice'
          ? 'voice entry'
          : entryType === 'drawing'
            ? 'drawing'
            : 'entry';

      const initPrompt = `I've just analyzed someone's ${entryTypeText}:

"${entryContent}"

Generate a warm, empathetic greeting message that:
1. Acknowledges their ${entryTypeText}
2. Shows understanding of their content
3. Invites them to reflect deeper
4. Asks an engaging question to start the conversation

Keep it to 2-3 sentences and make it personal to their specific entry.`;

      const messages = [
        {
          role: 'system',
          content:
            'You are an empathetic AI reflection guide. Generate personalized, warm greeting messages that invite deeper reflection based on the specific journal entry content.',
        },
        {
          role: 'user',
          content: initPrompt,
        },
      ];

      const message = await this.makeAIRequest(messages);

      await prisma.reflectionMessage.create({
        data: { entryId, author: 'AI', content: message },
      });

      const suggestions = await this.generateInitialSuggestions(entryContent);

      return {
        message,
        suggestions,
      };
    } catch (error) {
      this.logger.error('Chat initialization failed:', error);
      throw new AIServiceException('Failed to initialize chat');
    }
  }

  async getReflectionHistory(entryId: string, limit = 50) {
    return prisma.reflectionMessage.findMany({
      where: { entryId },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });
  }

  private async makeAIRequest(
    messages: Array<{ role: string; content: string }>,
  ): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'openai/gpt-5-chat-latest',
          messages,
          max_tokens: 500,
          temperature: 0.7,
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(
          `AI API request failed: ${response.status} - ${errorText}`,
        );
        throw new AIAPIException(
          `Request failed with status ${response.status}`,
          response.status,
        );
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new AIAPIException('No content in AI response', 500);
      }

      return content;
    } catch (error) {
      if (error instanceof AIAPIException) {
        throw error;
      }
      this.logger.error('AI API Error:', error);
      throw new AIServiceException('Failed to communicate with AI service');
    }
  }

  private async generateFollowUpSuggestions(
    userMessage: string,
    aiResponse: string,
  ): Promise<string[]> {
    try {
      const suggestionsPrompt = `Based on this conversation:
User: "${userMessage}"
AI: "${aiResponse}"

Generate 3 short follow-up questions or prompts (max 8 words each) that would help continue the reflection. 

Return ONLY a JSON array of strings like: ["question1", "question2", "question3"]`;

      const response = await this.makeAIRequest([
        {
          role: 'system',
          content:
            'Generate brief, thoughtful follow-up questions for journal reflection. Return only a JSON array of strings.',
        },
        {
          role: 'user',
          content: suggestionsPrompt,
        },
      ]);

      const suggestions = JSON.parse(response);
      return Array.isArray(suggestions) ? suggestions.slice(0, 3) : [];
    } catch (error) {
      this.logger.warn('Failed to generate follow-up suggestions:', error);
      return [];
    }
  }

  private async generateInitialSuggestions(
    entryContent: string,
  ): Promise<string[]> {
    try {
      const suggestionsPrompt = `Based on this journal entry:
"${entryContent}"

Generate 4 short reflection prompts (max 6 words each) that would help them explore their entry deeper.

Return ONLY a JSON array of strings like: ["prompt1", "prompt2", "prompt3", "prompt4"]`;

      const response = await this.makeAIRequest([
        {
          role: 'system',
          content:
            'Generate brief, thoughtful reflection prompts based on journal content. Return only a JSON array of strings.',
        },
        {
          role: 'user',
          content: suggestionsPrompt,
        },
      ]);

      const suggestions = JSON.parse(response);
      return Array.isArray(suggestions) ? suggestions.slice(0, 4) : [];
    } catch (error) {
      this.logger.warn('Failed to generate initial suggestions:', error);
      return [];
    }
  }

  private formatAnalysisResponse(
    rawAnalysis: any,
    entryContent: string,
  ): AIAnalysis {
    const wordCount = entryContent.split(' ').length;
    const currentTime = new Date().toLocaleTimeString();

    return {
      mood: {
        primary: rawAnalysis.mood?.primary || 'Neutral',
        secondary: rawAnalysis.mood?.secondary || 'Contemplative',
        score: rawAnalysis.mood?.score || 5,
        color: rawAnalysis.mood?.color || 'from-blue-400 to-cyan-500',
      },
      themes: rawAnalysis.themes || [],
      insights: rawAnalysis.insights || [],
      patterns: {
        writingTime: rawAnalysis.patterns?.writingTime || currentTime,
        wordCount: rawAnalysis.patterns?.wordCount || wordCount,
        sentiment: rawAnalysis.patterns?.sentiment || 'Neutral',
        frequency: rawAnalysis.patterns?.frequency || 'Regular',
      },
      suggestions: rawAnalysis.suggestions || [],
    };
  }
}
