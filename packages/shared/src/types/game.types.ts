export type GameStatus =
  | 'RELEASED'
  | 'ALPHA'
  | 'BETA'
  | 'EARLY_ACCESS'
  | 'OFFLINE'
  | 'CANCELLED'
  | 'RUMORED';

export type GameCategory =
  | 'MAIN_GAME'
  | 'DLC'
  | 'EXPANSION'
  | 'BUNDLE'
  | 'STANDALONE_EXPANSION'
  | 'MOD'
  | 'EPISODE'
  | 'SEASON'
  | 'REMAKE'
  | 'REMASTER'
  | 'PORT';

export interface Genre {
  id: string;
  igdbId: number;
  name: string;
  slug: string;
}

export interface Platform {
  id: string;
  igdbId: number;
  name: string;
  slug: string;
  abbreviation: string | null;
  generation: number | null;
}

export interface Company {
  id: string;
  igdbId: number;
  name: string;
  slug: string;
  logoImageId: string | null;
}

export interface Franchise {
  id: string;
  igdbId: number;
  name: string;
  slug: string;
}

export interface HltbHours {
  mainStory: number | null;
  mainExtras: number | null;
  completionist: number | null;
}

export interface GameSummary {
  id: string;
  igdbId: number;
  slug: string;
  name: string;
  coverImageId: string | null;
  backdropImageId: string | null;
  firstReleaseDate: string | null;
  communityScore: number | null;
  communityCount: number;
  criticScore: number | null;
  criticCount: number;
  genres: string[];
  platforms: string[];
}

export interface Game extends GameSummary {
  summary: string | null;
  storyline: string | null;
  screenshotIds: string[];
  trailerUrls: string[];
  status: GameStatus | null;
  category: GameCategory | null;
  parentGameId: string | null;
  developers: Company[];
  publishers: Company[];
  franchise: Franchise | null;
  esrbRating: string | null;
  pegiRating: string | null;
  hltb: HltbHours;
  recommendPercent: number | null;
  totalReviews: number;
  hypeCount: number;
  createdAt: string;
  updatedAt: string;
}
