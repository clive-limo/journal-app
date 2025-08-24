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

export interface ReflectionResponse {
  content: string;
  suggestions: string[];
}

export interface InitialChatResponse {
  message: string;
  suggestions: string[];
}

export interface DrawingContext {
  prompt: string;
  suggestions: string[];
  elements: Array<{
    type: string;
    description: string;
  }>;
}

export interface ImageAnalysis {
  shapes: Array<{
    type: string;
    count: number;
    description: string;
  }>;
  colors: Array<{
    name: string;
    dominance: number;
    emotion: string;
  }>;
  patterns: string[];
  contextAlignment: {
    score: number;
    observations: string[];
  };
  insights: string[];
}

export interface AudioTranscription {
  text: string;
  confidence: number;
  language: string;
}

export type TextPart = { type: 'text'; text: string };
export type ImageUrlPart = { type: 'image_url'; image_url: { url: string } };
export type InputAudioPart = {
  type: 'input_audio';
  audio: { data: string; format: string };
};
