import { CriticTier } from './user.types';

export type ExamType = 'BASIC_CRITIC' | 'EXPERT_CRITIC';

export interface ExamQuestion {
  id: string;
  examType: ExamType;
  question: string;
  options: string[];
  category: string;
  difficulty: number;
}

export interface ExamSubmissionDto {
  examType: ExamType;
  answers: { questionId: string; selectedOption: number }[];
}

export interface ExamResult {
  attemptId: string;
  passed: boolean;
  score: number; // percentage 0-100
  correctAnswers: number;
  totalQuestions: number;
  newTier: CriticTier | null;
  message: string;
}

export interface ExamAttempt {
  id: string;
  userId: string;
  examType: ExamType;
  score: number;
  passed: boolean;
  correctAnswers: number;
  totalQuestions: number;
  attemptedAt: string;
}

export interface CriticTierDetails {
  tier: CriticTier;
  title: string;
  description: string;
  badgeLabel: string;
  colorHex: string;
  bgClass: string;
  requirements: {
    accountAgeDays: number;
    minReviews: number;
    minLikes: number;
    examMinScore: number;
  };
  benefits: string[];
}
