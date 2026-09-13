import { CriticTier, UserSummary } from './user.types.js';
import { GameSummary } from './game.types.js';

export interface ScoreRatingBand {
  min: number;
  max: number;
  label: string;
  colorHex: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
}

export interface ScoreColorInfo {
  colorHex: string;
  label: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
}

export interface ReviewCommentItem {
  id: string;
  userId: string;
  user: UserSummary;
  reviewId: string;
  body: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  userId: string;
  gameId: string;
  score: number; // 0 to 100
  title: string | null;
  body: string | null;
  platform: string | null;
  playtimeAtReview: number | null; // Hours
  gameVersion: string | null;
  containsSpoilers: boolean;
  recommends: boolean | null;
  isCriticReview: boolean;
  criticTier: CriticTier | null;
  likeCount: number;
  commentCount: number;
  isPublished: boolean;
  isFeatured: boolean;
  hasLiked?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewWithUser extends Review {
  user: UserSummary;
}

export interface ReviewWithGame extends Review {
  game: GameSummary;
}

export interface CreateReviewDto {
  gameId: string;
  score: number;
  title?: string;
  body?: string;
  platform?: string;
  playtimeAtReview?: number;
  gameVersion?: string;
  containsSpoilers?: boolean;
  recommends?: boolean;
}

export interface UpdateReviewDto {
  score?: number;
  title?: string;
  body?: string;
  platform?: string;
  playtimeAtReview?: number;
  gameVersion?: string;
  containsSpoilers?: boolean;
  recommends?: boolean;
}
