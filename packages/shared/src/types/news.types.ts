import { GameSummary } from './game.types';

export type NewsCategory =
  | 'RELEASE'
  | 'ANNOUNCEMENT'
  | 'REVIEW'
  | 'UPDATE_PATCH'
  | 'DEAL'
  | 'EVENT'
  | 'OPINION';

export interface NewsArticle {
  id: string;
  title: string;
  summary: string | null;
  url: string;
  imageUrl: string | null;
  sourceName: string;
  sourceUrl: string | null;
  category: NewsCategory | null;
  publishedAt: string;
  games?: GameSummary[];
}

export interface NewsFilterDto {
  category?: NewsCategory;
  gameId?: string;
  limit?: number;
  page?: number;
}
