export type UserRole = 'USER' | 'CRITIC' | 'ADMIN' | 'MODERATOR';

export type CriticTier = 'VERIFIED' | 'EXPERT' | 'MASTER';

export interface UserSummary {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  role: UserRole;
  criticTier: CriticTier | null;
  criticBadge: string | null;
}

export interface UserProfile extends UserSummary {
  bannerUrl: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  isPublic: boolean;
  criticVerifiedAt: string | null;
  favoriteGames: FavoriteGame[];
  stats: UserStats;
  followerCount: number;
  followingCount: number;
  createdAt: string;
}

export interface FavoriteGame {
  id: string;
  position: number;
  gameId: string;
  gameName: string;
  gameSlug: string;
  coverImageId: string | null;
}

export interface UserStats {
  totalPlayed: number;
  totalPlaying: number;
  totalBacklog: number;
  totalCompleted: number;
  totalMastered: number;
  totalDropped: number;
  totalReviews: number;
  totalLists: number;
  averageScore: number | null;
  estimatedHours: number;
}
