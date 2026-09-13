import { UserSummary } from './user.types.js';
import { GameSummary } from './game.types.js';
import { Review } from './review.types.js';
import { PlayStatus } from './play-log.types.js';

export type ActivityType =
  | 'RATED_GAME'
  | 'REVIEWED_GAME'
  | 'LOGGED_GAME'
  | 'CREATED_LIST'
  | 'LIKED_REVIEW';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  user: UserSummary;
  game?: GameSummary;
  review?: Review;
  score?: number;
  status?: PlayStatus;
  listTitle?: string;
  listId?: string;
  createdAt: string;
}

export interface FollowInfo {
  isFollowing: boolean;
  isFollowedBy: boolean;
  followerCount: number;
  followingCount: number;
}

export type NotificationType =
  | 'NEW_FOLLOWER'
  | 'REVIEW_LIKE'
  | 'REVIEW_COMMENT'
  | 'LIST_LIKE'
  | 'MENTION'
  | 'CRITIC_STATUS_CHANGE'
  | 'GAME_RELEASE';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  message: string;
  actor: UserSummary | null;
  entityType: string | null;
  entityId: string | null;
  isRead: boolean;
  createdAt: string;
}
