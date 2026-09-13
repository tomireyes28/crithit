import { GameSummary } from './game.types';

export type PlayStatus =
  | 'PLAYING'
  | 'BACKLOG'
  | 'COMPLETED'
  | 'MASTERED'
  | 'DROPPED'
  | 'SHELVED'
  | 'WISHLIST';

export interface PlayStatusInfo {
  status: PlayStatus;
  labelEs: string;
  labelEn: string;
  colorHex: string;
  badgeClass: string;
  icon: string;
}

export interface PlayLog {
  id: string;
  userId: string;
  gameId: string;
  status: PlayStatus;
  startedAt: string | null;
  finishedAt: string | null;
  logDate: string;
  platform: string | null;
  hoursPlayed: number | null;
  isReplay: boolean;
  replayCount: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PlayLogWithGame extends PlayLog {
  game: GameSummary;
}

export interface CreatePlayLogDto {
  gameId: string;
  status: PlayStatus;
  startedAt?: string;
  finishedAt?: string;
  logDate?: string;
  platform?: string;
  hoursPlayed?: number;
  isReplay?: boolean;
  replayCount?: number;
  notes?: string;
}

export interface UpdatePlayLogDto {
  status?: PlayStatus;
  startedAt?: string;
  finishedAt?: string;
  logDate?: string;
  platform?: string;
  hoursPlayed?: number;
  isReplay?: boolean;
  replayCount?: number;
  notes?: string;
}
