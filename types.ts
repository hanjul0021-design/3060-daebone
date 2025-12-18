
export interface GenerationSettings {
  ageGroup: string;
  format: string;
  length: string;
  tone: string;
  intensity: string;
}

export type InputMode = 'paste' | 'summary' | 'auto';

export interface StoryInput {
  mode: InputMode;
  content: string;
  keywords: string[];
  characters: string;
  conflict: string;
  twist: string;
}

export interface AnalysisResult {
  topic: string;
  relationship: string;
  conflictType: string;
  emotionCurve: string;
  safetyScore: number;
  risks: string[];
}

export interface GeneratedScript {
  id: string;
  opening: string;
  intro: string;
  body: string;
  climax: string;
  ending: string;
  comment: {
    empathy: string;
    advice: string;
    outro: string;
  };
  captions: string[];
  thumbnails: string[];
  hashtags: string[];
  settings: GenerationSettings;
  timestamp: number;
}

// New types for Title Generator
export type TitleMode = 'shorts' | 'long';

export interface TitleResult {
  title: string;
  score: number;
  tags: string[];
  hookType: string;
  characters: string;
  twist: string;
}

export interface TitleGeneratorInput {
  mode: TitleMode;
  category: string;
  emotion: string;
  relationship: string;
  input: string;
  intensity: string;
}
