export type GameStage = 'topic-input' | 'stance-selection' | 'debate' | 'result';

export interface Opinion {
  title: string;
  description: string;
  emoji: string;
}

export interface Message {
  role: 'user' | 'ai';
  content: string;
}

export interface ScoreCategory {
  logic: number;
  evidence: number;
  rebuttal: number;
  persuasiveness: number;
  structure: number;
  total: number;
  comments: {
    logic: string;
    evidence: string;
    rebuttal: string;
    persuasiveness: string;
    structure: string;
  };
}

export interface EvaluationResult {
  user_scores: ScoreCategory;
  ai_scores: ScoreCategory;
  winner: 'user' | 'ai';
  overall_comment: string;
}
