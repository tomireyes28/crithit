import { PlayStatus, PlayStatusInfo } from '../types/play-log.types.js';

export const PLAY_STATUS_MAP: Record<PlayStatus, PlayStatusInfo> = {
  PLAYING: {
    status: 'PLAYING',
    labelEs: 'Jugando',
    labelEn: 'Playing',
    colorHex: '#3B82F6',
    badgeClass: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    icon: 'gamepad-2',
  },
  BACKLOG: {
    status: 'BACKLOG',
    labelEs: 'Backlog',
    labelEn: 'Backlog',
    colorHex: '#A855F7',
    badgeClass: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    icon: 'clock',
  },
  COMPLETED: {
    status: 'COMPLETED',
    labelEs: 'Completado',
    labelEn: 'Completed',
    colorHex: '#10B981',
    badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    icon: 'check-circle',
  },
  MASTERED: {
    status: 'MASTERED',
    labelEs: '100% / Mastered',
    labelEn: 'Mastered',
    colorHex: '#EAB308',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    icon: 'trophy',
  },
  DROPPED: {
    status: 'DROPPED',
    labelEs: 'Abandonado',
    labelEn: 'Dropped',
    colorHex: '#EF4444',
    badgeClass: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    icon: 'x-circle',
  },
  SHELVED: {
    status: 'SHELVED',
    labelEs: 'Pausado',
    labelEn: 'Shelved',
    colorHex: '#64748B',
    badgeClass: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
    icon: 'pause-circle',
  },
  WISHLIST: {
    status: 'WISHLIST',
    labelEs: 'Lista de Deseos',
    labelEn: 'Wishlist',
    colorHex: '#EC4899',
    badgeClass: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    icon: 'heart',
  },
};

export const ALL_PLAY_STATUSES = Object.values(PLAY_STATUS_MAP);

export function getPlayStatusInfo(status: PlayStatus): PlayStatusInfo {
  return PLAY_STATUS_MAP[status];
}
