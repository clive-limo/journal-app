import { number } from 'zod';

export enum UploadKind {
  IMAGE = 'IMAGE',
  AUDIO = 'AUDIO',
}

export enum EntryKind {
  WRITE = 'WRITE',
  TALK = 'TALK',
  DRAW = 'DRAW',
}

export interface Journal {
  id: string;
  title?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Entry {
  id: string;
  journalId: string;
  kind: EntryKind;
  title?: string;
  body?: string;
  rating?: number;
  moodLabel?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Media {
  id: string;
  url: string;
  kind: UploadKind;
  createdAt: string;
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

export interface ImageAnalysisResult {
  shapes: {
    type: string;
    count: number;
    description: string;
  }[];
  colors: {
    name: string;
    dominance: number;
    emotion: string;
  }[];
  patterns: string[];
  contextAlignment: {
    score: number;
    observations: string[];
  };
  insights: string[];
}
