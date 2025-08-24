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
