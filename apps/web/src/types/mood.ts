export interface MoodPoint {
  day: string;
  score: number;
  color?: string;
  emotion?: string;
}

export interface MoodRangeResponse {
  from: string;
  to: string;
  points: MoodPoint[];
}

export interface WeeklyProfileResponse {
  labels: string[];
  data: number[];
}

export interface UpsertMood {
  score: number;
  emotion?: string;
  color?: string;
  day?: string;
}

export interface QueryRange {
  from?: string;
  to?: string;
}
