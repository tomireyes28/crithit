import { UserSummary } from './user.types.js';
import { GameSummary } from './game.types.js';

export interface GameListEntry {
  id: string;
  listId: string;
  gameId: string;
  game: GameSummary;
  position: number;
  note: string | null;
}

export interface GameList {
  id: string;
  userId: string;
  user: UserSummary;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  isRanked: boolean;
  isPublic: boolean;
  tags: string[];
  entryCount: number;
  likeCount: number;
  hasLiked?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GameListWithEntries extends GameList {
  entries: GameListEntry[];
}

export interface CreateListDto {
  title: string;
  description?: string;
  coverImageUrl?: string;
  isRanked?: boolean;
  isPublic?: boolean;
  tags?: string[];
  initialGames?: { gameId: string; note?: string }[];
}

export interface UpdateListDto {
  title?: string;
  description?: string;
  coverImageUrl?: string;
  isRanked?: boolean;
  isPublic?: boolean;
  tags?: string[];
}

export interface AddListEntryDto {
  gameId: string;
  position?: number;
  note?: string;
}
