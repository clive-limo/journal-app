// stores/aiReflection.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/lib/axios';
import type { ImageAnalysisResult } from '@/utils/types';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

export interface AIAnalysis {
  mood: {
    primary: string;
    secondary: string;
    score: number;
    color: string;
  };
  themes: Array<{
    name: string;
    strength: number;
  }>;
  insights: string[];
  patterns: {
    writingTime: string;
    wordCount: number;
    sentiment: string;
    frequency: string;
  };
  suggestions: string[];
}

export const useAIReflectionStore = defineStore('aiReflection', () => {
  // State
  const isTyping = ref(false);
  const chatMessages = ref<ChatMessage[]>([]);
  const currentSuggestions = ref<string[]>([]);
  const analysisData = ref<AIAnalysis | null>(null);
  const isAnalyzing = ref(false);
  const isInitializing = ref(false);
  const error = ref<string | null>(null);

  // Configuration - backend URL
  const backendUrl = ref<string>(
    import.meta.env.VITE_BASE_URL || 'http://localhost:3000',
  );

  // Computed
  const hasMessages = computed(() => chatMessages.value.length > 0);

  // Error handling helper
  const handleError = (error: any, defaultMessage: string) => {
    console.error(error);
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.message) {
      return error.message;
    }
    return defaultMessage;
  };

  // Backend API Methods
  const generateEntryAnalysis = async (
    entryContent: string,
    entryType: string,
  ): Promise<AIAnalysis> => {
    isAnalyzing.value = true;
    error.value = null;

    try {
      const response = await api.post<AIAnalysis>('/ai-reflection/analyze', {
        entryContent,
        entryType,
      });

      if (!response.data) {
        throw new Error('Failed to analyze entry');
      }

      analysisData.value = response.data;
      return response.data;
    } catch (err) {
      const errorMessage = handleError(err, 'Failed to analyze entry');
      error.value = errorMessage;
      throw new Error(errorMessage);
    } finally {
      isAnalyzing.value = false;
    }
  };

  const generateReflectionResponse = async (
    userMessage: string,
    entryContent?: string,
    conversationContext?: ChatMessage[],
  ): Promise<{ content: string; suggestions: string[] }> => {
    isTyping.value = true;
    error.value = null;

    try {
      // Convert conversation context to the format expected by backend
      const contextMessages =
        conversationContext?.slice(-4).map((msg) => ({
          role: msg.role,
          content: msg.content,
        })) || [];

      const response = await api.post<{
        content: string;
        suggestions: string[];
      }>(`/ai-reflection/reflect`, {
        userMessage,
        entryContent,
        conversationContext: contextMessages,
      });

      if (!response.data) {
        throw new Error('Failed to generate reflection response');
      }

      return response.data;
    } catch (err) {
      const errorMessage = handleError(
        err,
        'Failed to generate reflection response',
      );
      error.value = errorMessage;
      throw new Error(errorMessage);
    } finally {
      isTyping.value = false;
    }
  };

  const initializeChat = async (
    entryContent: string,
    entryType: string,
  ): Promise<void> => {
    if (hasMessages.value) return;

    isInitializing.value = true;
    error.value = null;

    try {
      const response = await api.post<{
        message: string;
        suggestions: string[];
      }>(`/ai-reflection/initialize`, {
        entryContent,
        entryType,
      });

      if (!response.data) {
        throw new Error('Failed to initialize chat');
      }

      // Add AI greeting message
      addMessage({
        role: 'assistant',
        content: response.data.message,
        suggestions: response.data.suggestions,
      });

      // Update current suggestions
      currentSuggestions.value = response.data.suggestions || [];
    } catch (err) {
      const errorMessage = handleError(err, 'Failed to initialize chat');
      error.value = errorMessage;

      // Add fallback error message
      addMessage({
        role: 'assistant',
        content:
          "I'm having trouble connecting right now. Please try refreshing the page or contact support if the issue persists.",
        suggestions: [],
      });
    } finally {
      isInitializing.value = false;
    }
  };

  // Chat Management Methods
  const addMessage = (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: generateId(),
      timestamp: new Date(),
    };
    chatMessages.value.push(newMessage);
    return newMessage;
  };

  const sendUserMessage = async (content: string, entryContent?: string) => {
    // Clear any previous errors
    error.value = null;

    // Add user message
    addMessage({
      role: 'user',
      content: content.trim(),
    });

    try {
      // Generate AI response using backend
      const aiResponse = await generateReflectionResponse(
        content,
        entryContent,
        chatMessages.value,
      );

      // Add AI message
      addMessage({
        role: 'assistant',
        content: aiResponse.content,
        suggestions: aiResponse.suggestions,
      });

      // Update current suggestions
      currentSuggestions.value = aiResponse.suggestions;
    } catch (err) {
      // Add error message to chat
      addMessage({
        role: 'assistant',
        content:
          "I'm having trouble processing your message right now. Could you try rephrasing your question or check your connection?",
        suggestions: [],
      });

      // Set error state but don't throw to prevent UI crashes
      error.value =
        err instanceof Error ? err.message : 'Unknown error occurred';
    }
  };

  const clearChat = () => {
    chatMessages.value = [];
    currentSuggestions.value = [];
    isTyping.value = false;
    error.value = null;
  };

  const clearError = () => {
    error.value = null;
  };

  const retry = async (action: string, ...args: any[]) => {
    clearError();

    switch (action) {
      case 'analyze':
        return generateEntryAnalysis(args[0], args[1]);
      case 'initialize':
        return initializeChat(args[0], args[1]);
      case 'reflect':
        return sendUserMessage(args[0], args[1]);
      default:
        throw new Error('Unknown retry action');
    }
  };

  // Get drawing context
  const getDrawingContext = async (mood?: string, theme?: string) => {
    try {
      const params = new URLSearchParams();
      if (mood) params.append('mood', mood);
      if (theme) params.append('theme', theme);

      const response = await api.get<{
        prompt: string;
        suggestions: string[];
      }>(`/ai-reflection/drawing-context?${params}`);

      if (!response.data) {
        throw new Error('Failed to get drawing context');
      }

      return response.data;
    } catch (err) {
      throw new Error(handleError(err, 'Failed to get drawing context'));
    }
  };

  // Process image
  const processDrawing = async (imageBlob: Blob, drawingContext: string) => {
    try {
      const formData = new FormData();
      formData.append('image', imageBlob, 'drawing.png');
      formData.append('drawingContext', drawingContext);

      const response = await api.post<ImageAnalysisResult>(
        `/ai-reflection/process-image`,
        formData,
      );

      if (!response.data) {
        throw new Error('Failed to process image');
      }

      return response.data;
    } catch (err) {
      throw new Error(handleError(err, 'Failed to process drawing'));
    }
  };

  // Convert audio
  const convertAudio = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.wav');

      const response = await api.post<{
        url: string;
        duration: number;
      }>(`/ai-reflection/convert-audio`, formData);

      if (!response.data) {
        throw new Error('Failed to convert audio');
      }

      return response.data;
    } catch (err) {
      throw new Error(handleError(err, 'Failed to convert audio'));
    }
  };

  // Helper Methods
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Configuration
  const setBackendUrl = (url: string) => {
    backendUrl.value = url;
  };

  return {
    // State
    isTyping,
    chatMessages,
    currentSuggestions,
    analysisData,
    isAnalyzing,
    isInitializing,
    error,

    // Computed
    hasMessages,

    // Methods
    generateEntryAnalysis,
    generateReflectionResponse,
    initializeChat,
    addMessage,
    sendUserMessage,
    clearChat,
    clearError,
    retry,
    setBackendUrl,
    getDrawingContext,
    processDrawing,
    convertAudio,

    // Helper methods
    generateId,
  };
});
