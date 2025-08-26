import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { prisma } from '@journal/database';
// import { ReflectionAuthor } from '@prisma/client';
import {
  CreateAnalysisDto,
  CreateReflectionDto,
  GetDrawingContextDto,
  InitializeChatDto,
} from './dto/analysis.dto';
import {
  AIAnalysis,
  ReflectionResponse,
  InitialChatResponse,
  DrawingContext,
  ImageAnalysis,
  AudioTranscription,
  TextPart,
  ImageUrlPart,
  InputAudioPart,
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
    const { entryContent, entryType } = dto;

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

      // await prisma.aiAnalysis.upsert({
      //   where: { entryId },
      //   create: {
      //     entryId,
      //     moodPrimary: analysis.mood.primary,
      //     moodSecondary: analysis.mood.secondary,
      //     moodScore: analysis.mood.score,
      //     color: analysis.mood.color,
      //     themes: analysis.themes,
      //     insights: analysis.insights,
      //     patterns: analysis.patterns,
      //     suggestions: analysis.suggestions,
      //     raw: parsed,
      //   },
      //   update: {
      //     moodPrimary: analysis.mood.primary,
      //     moodSecondary: analysis.mood.secondary,
      //     moodScore: analysis.mood.score,
      //     color: analysis.mood.color,
      //     themes: analysis.themes,
      //     insights: analysis.insights,
      //     patterns: analysis.patterns,
      //     suggestions: analysis.suggestions,
      //     raw: parsed,
      //   },
      // });

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
    const { userMessage, entryContent, conversationContext = [] } = dto;

    // await prisma.reflectionMessage.create({
    //   data: { entryId, author: ReflectionAuthor.USER, content: userMessage },
    // });

    try {
      const contextMessages = [
        {
          role: 'system',
          content: `You are an empathetic AI reflection guide. 
Your role is to help the user explore their journal entry with curiosity, compassion, and variety in language.  

Journal Entry: ${entryContent ? `"${entryContent}"` : 'The user has not provided an entry.'}
 

Guidelines:
- If the entry content is a drawing analysis, go into the insights and find out which one the user ressonates with if any.
- Begin by acknowledging what the user shared, but vary how you phrase it (avoid repeating the same sentence stems like “It sounds like…”).  
- Mix in different styles of reflection:  
  • Observations (e.g., "I noticed you mentioned…")  
  • Curiosity (e.g., "What do you think made that moment stand out?")  
  • Perspective shifting (e.g., "How might you see this experience differently if it happened again?")  
  • Emotional mirroring (e.g., "That seems like it brought you peace—does that feel true?")  
- Ask 1–2 thoughtful, open-ended questions to invite deeper reflection.  
- Keep responses short (2–3 sentences max) and make sure the conversation flows smoothly.  
- End with an encouraging follow-up question *unless* the reflection feels complete, in which case conclude warmly (e.g., affirm their insights and suggest pausing to let it settle).
- Ask a maximum of 4 questions before ending the conversation naturally.  
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

      // await prisma.reflectionMessage.create({
      //   data: { entryId, author: ReflectionAuthor.AI, content: aiText },
      // });

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
    const { entryContent, entryType } = dto;

    try {
      const entryTypeText =
        entryType === 'TALK'
          ? 'voice entry'
          : entryType === 'DRAW'
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

      // await prisma.reflectionMessage.create({
      //   data: { entryId, author: 'AI', content: message },
      // });

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
    messages: Array<{
      role: string;
      content: string | { type: string; text?: string }[];
    }>,
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

      return Array.isArray(content)
        ? content.map((c) => (c.type === 'text' ? c.text : '')).join('')
        : content;
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

  async getDrawingContext(dto: GetDrawingContextDto): Promise<DrawingContext> {
    try {
      const reflectionApproaches = [
        'emotional landscape',
        'daily energy flow',
        'moment capture',
        'feeling visualization',
        "day's rhythm",
        'internal weather',
        'personal symbols',
        'time progression',
        'relationship dynamics',
        'challenge representation',
        'growth visualization',
        'memory mapping',
      ];

      const journalFrameworks = [
        'Draw how your day felt rather than what happened',
        'Illustrate the emotional journey of your day',
        "Create a visual representation of today's energy levels",
        'Show the highlights and low points as a landscape',
        'Draw the story of today using symbols and shapes',
        "Visualize today's experiences as weather patterns",
        "Illustrate how you moved through today's challenges",
        "Create a map of today's emotional territories",
      ];

      const timeVariation = new Date().getHours() % reflectionApproaches.length;
      const selectedApproach = reflectionApproaches[timeVariation];
      const selectedFramework =
        journalFrameworks[Math.floor(Math.random() * journalFrameworks.length)];

      const contextPrompt = `Generate a reflective drawing prompt for today's journal entry focusing on "${selectedApproach}".

    Framework: ${selectedFramework}
    
    User context:
    ${dto.mood ? `Current mood/feeling: ${dto.mood}` : 'Mood: Not specified'}
    ${dto.theme ? `Day's focus/theme: ${dto.theme}` : 'Theme: General daily reflection'}
    
    Create a drawing prompt that:
    - Helps process today's experiences through visual reflection
    - Is achievable in a journal setting (simple materials)
    - Encourages emotional processing rather than artistic perfection
    - Connects to their actual day and feelings
    - Uses accessible symbols, shapes, and concepts
    
    AVOID: Generic nature scenes, perfect illustrations, complex technical drawings, cliché symbols like basic suns/hearts
    
    FOCUS ON: Personal emotional processing, daily experience reflection, meaningful symbolism, accessible drawing concepts
    
    Return ONLY this JSON structure:
{
  "prompt": "specific daily reflection drawing prompt",
  "suggestions": ["practical suggestion 1", "practical suggestion 2", "practical suggestion 3", "practical suggestion 4"],
  "elements": [
    {"type": "element name", "description": "how this helps process today's experience"},
    {"type": "element name", "description": "connection to daily emotional processing"}
  ]
}`;

      const systemPrompt = `You are a journal therapy specialist who creates drawing prompts for daily emotional processing and reflection.

    YOUR GOAL: Help people process their actual day through simple, meaningful drawing exercises.
    
    ESSENTIAL REQUIREMENTS:
    - Focus on TODAY'S experience and feelings, not abstract art
    - Make prompts simple enough for basic journal materials (pen, pencil, simple colors)
    - Encourage emotional reflection and processing through drawing
    - Provide practical, doable suggestions for journal-sized drawings
    - Help users explore their feelings about their actual day
    
    AVOID REPETITION BY:
    - Varying the emotional focus (energy, relationships, challenges, growth, time, space)
    - Using different metaphors (weather, landscapes, journeys, containers, flows, structures)
    - Changing the drawing approach (abstract, symbolic, narrative, spatial, temporal)
    
    Return ONLY valid JSON, no additional text.`;

      const messages = [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: contextPrompt,
        },
      ];

      const response = await this.makeAIRequest(messages);

      let parsedResponse;
      try {
        parsedResponse = JSON.parse(response);
      } catch (parseError) {
        this.logger.error('JSON parsing failed, raw response:', response);
        throw new AIServiceException('Invalid JSON response from AI service');
      }

      if (
        !parsedResponse.prompt ||
        !Array.isArray(parsedResponse.suggestions) ||
        !Array.isArray(parsedResponse.elements)
      ) {
        throw new AIServiceException(
          'Invalid response structure from AI service',
        );
      }

      return parsedResponse;
    } catch (error) {
      this.logger.error('Drawing context generation failed:', error);

      const journalFallbacks = [
        {
          prompt:
            'Draw the rhythm of your day as a line that rises and falls with your energy levels',
          suggestions: [
            'Start from morning on the left',
            'Make the line thicker during intense moments',
            'Add small symbols for key events',
            'Use different colors for different types of energy',
          ],
          elements: [
            {
              type: 'flowing line',
              description: 'helps visualize the ups and downs of your day',
            },
            {
              type: 'symbolic markers',
              description:
                'allows you to mark significant moments for reflection',
            },
          ],
        },
        {
          prompt:
            'Create a weather map of your internal emotional climate throughout today',
          suggestions: [
            'Use different weather symbols for different feelings',
            'Show storm areas for difficult moments',
            'Add sunshine for positive experiences',
            'Include wind patterns for changing emotions',
          ],
          elements: [
            {
              type: 'weather patterns',
              description: 'helps you recognize and name your emotional states',
            },
            {
              type: 'climate zones',
              description:
                'shows how different parts of your day had different emotional tones',
            },
          ],
        },
        {
          prompt:
            'Draw today as a container - what did you carry, collect, or let go of?',
          suggestions: [
            'Draw a bag, box, or vessel shape',
            'Fill it with symbols of experiences',
            "Show things falling out that you're releasing",
            'Add weight lines for heavy emotional loads',
          ],
          elements: [
            {
              type: 'container shape',
              description: 'represents your emotional capacity and boundaries',
            },
            {
              type: 'contents symbols',
              description:
                "helps identify what experiences you're carrying forward",
            },
          ],
        },
      ];

      const randomFallback =
        journalFallbacks[Math.floor(Math.random() * journalFallbacks.length)];
      return randomFallback;
    }
  }

  async processImage(
    imageBuffer: Buffer,
    drawingContext: string,
  ): Promise<ImageAnalysis> {
    try {
      // Convert image to base64 for AI API
      const base64Image = imageBuffer.toString('base64');

      const analysisPrompt = `Analyze this drawing image in relation to the context provided. Provide a critical analysis .
    
    Drawing context: "${drawingContext}"
    
    Please analyze:
    1. Shapes and forms present
    2. Color palette and emotional associations
    3. Patterns and composition
    4. How well it aligns with the provided context
    5. Psychological/emotional insights from the drawing
    
    Please provide the analysis ONLY as valid JSON (no code fences, no explanations, no extra text). Use this exact structure:
    {
      "shapes": [{"type": "shape", "count": number, "description": "meaning"}],
      "colors": [{"name": "color", "dominance": percentage, "emotion": "associated emotion"}],
      "patterns": ["pattern1", "pattern2"],
      "contextAlignment": {"score": 1-10, "observations": ["obs1", "obs2"]},
      "insights": ["insight1", "insight2", "insight3"]
    }`;

      const messages = [
        {
          role: 'system',
          content:
            'You are an AI art analyst specializing in psychological interpretation of drawings. Provide thoughtful analysis of artwork in relation to journal reflection context.',
        },
        {
          role: 'user',
          content: [
            {
              type: 'text' as const,
              text: analysisPrompt,
            },
            {
              type: 'image_url' as const,
              image_url: {
                url: `data:image/png;base64,${base64Image}`,
              },
            },
          ],
        },
      ];

      const response = await this.makeMultimodalRequest(messages);
      return JSON.parse(response);
    } catch (error) {
      this.logger.error('Image processing failed:', error);
      throw new AIServiceException('Failed to process image');
    }
  }

  async convertAudioToText(audioBuffer: Buffer): Promise<AudioTranscription> {
    try {
      const formData = new FormData();

      // Convert Node Buffer -> Uint8Array (valid BlobPart)
      const audioBlob = new Blob([new Uint8Array(audioBuffer)], {
        type: 'audio/wav',
      });

      formData.append('file', audioBlob, 'audio.wav');
      formData.append('model', 'whisper-1');

      const response = await fetch(`${this.baseUrl}/audio/transcriptions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new AIAPIException(
          `Audio transcription failed with status ${response.status}`,
          response.status,
        );
      }

      const data = await response.json();

      return {
        text: data.text || '',
        confidence: data.confidence || 0.9,
        language: data.language || 'en',
      };
    } catch (error) {
      this.logger.error('Audio transcription failed:', error);
      throw new AIServiceException('Failed to convert audio to text');
    }
  }

  private async makeMultimodalRequest(
    messages: {
      role: string;
      content:
        | string
        | {
            type: 'text';
            text: string;
          }[]
        | {
            type: 'image_url';
            image_url: { url: string };
          }[]
        | (
            | { type: 'text'; text: string }
            | { type: 'image_url'; image_url: { url: string } }
          )[];
    }[],
  ) {
    let model = 'gpt-4o-mini-2024-07-18';
    let temperature = 0.7;
    let maxTokens = 800;
    let parseJson = false;

    // Minimal validation to catch malformed parts early
    const normalized = messages.map((m) => {
      if (Array.isArray(m.content)) {
        // ensure each part has a supported type
        const parts = m.content.map((p) => {
          if (p && typeof p === 'object' && 'type' in p) {
            if (p.type === 'text') return p as TextPart;
            if (p.type === 'image_url') return p as ImageUrlPart;
            if (p.type === 'input_audio') return p as InputAudioPart;
          }
          throw new Error(
            `Unsupported content part in message for role "${m.role}".`,
          );
        });
        return { role: m.role, content: parts };
      }
      // string content is fine as-is
      return m;
    });

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: maxTokens,
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(
          `AI multimodal request failed: ${response.status} - ${errorText}`,
        );
        throw new AIAPIException(
          `Request failed with status ${response.status}`,
          response.status,
        );
      }

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content;

      console.log('Full API response:', JSON.stringify(data, null, 2));

      if (!content) {
        throw new AIAPIException('No content in AI response', 500);
      }

      // content can be a string or an array of parts (return text only)
      const text =
        typeof content === 'string'
          ? content
          : Array.isArray(content)
            ? content
                .map((c: any) => (c?.type === 'text' ? c.text : ''))
                .join('')
                .trim()
            : '';

      return text;

      // try {
      //   return JSON.parse(cleaned) as T;
      // } catch (e) {
      //   this.logger.error('Failed to parse AI JSON response:', cleaned);
      //   throw new AIServiceException('AI returned invalid JSON');
      // }
    } catch (error) {
      if (error instanceof AIAPIException) throw error;
      this.logger.error('AI Multimodal API Error:', error);
      throw new AIServiceException(
        'Failed to communicate with AI multimodal service',
      );
    }
  }
}
