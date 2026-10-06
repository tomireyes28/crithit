import React from 'react';
import Link from 'next/link';
import { ScoreBadge } from '@/components/ui/ScoreBadge';
import { BouncyTap } from '@/components/ui/MotionWrapper';

export interface FavoriteGameItem {
  id: string;
  position: number;
  game: {
    id: string;
    name: string;
    slug: string;
    coverUrl: string | null;
    communityScore: number | null;
    firstReleaseDate: string | null;
  };
}

export interface FavoriteFourProps {
  favorites: FavoriteGameItem[];
  isOwner?: boolean;
  onEditFavorites?: () => void;
}

const RANK_BADGES: Record<number, { border: string; bg: string; text: string; glow: string }> = {
  1: {
    border: 'border-amber-400/70',
    bg: 'bg-amber-500/25',
    text: 'text-amber-300',
    glow: 'shadow-[0_0_10px_rgba(251,191,36,0.5)]',
  },
  2: {
    border: 'border-slate-300/60',
    bg: 'bg-slate-400/20',
    text: 'text-slate-200',
    glow: 'shadow-[0_0_8px_rgba(203,213,225,0.4)]',
  },
  3: {
    border: 'border-amber-700/60',
    bg: 'bg-amber-800/25',
    text: 'text-amber-400',
    glow: 'shadow-[0_0_8px_rgba(180,83,9,0.4)]',
  },
  4: {
    border: 'border-cyan-500/50',
    bg: 'bg-cyan-950/40',
    text: 'text-cyan-300',
    glow: 'shadow-[0_0_8px_rgba(6,182,212,0.4)]',
  },
};

export const FavoriteFour: React.FC<FavoriteFourProps> = ({
  favorites,
  isOwner = false,
  onEditFavorites,
}) => {
  const slots = [1, 2, 3, 4];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌟</span>
          <h2 className="text-xl font-bold text-white">Favorite Four</h2>
          <span className="text-xs text-brand-muted font-medium hidden sm:inline">
            (Los 4 títulos insignia)
          </span>
        </div>

        {isOwner && onEditFavorites && (
          <BouncyTap>
            <button
              onClick={onEditFavorites}
              className="text-xs font-bold text-brand-accent hover:brightness-110 flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-brand-surface border border-brand-accent/30 hover:border-brand-accent/60 transition-all shadow-sm"
            >
              <span>✏️</span>
              <span>Editar Favoritos</span>
            </button>
          </BouncyTap>
        )}
      </div>

      {/* Grid de 4 Pósters Verticales */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {slots.map((pos) => {
          const item = favorites.find((f) => f.position === pos);
          const badgeStyle = RANK_BADGES[pos] || RANK_BADGES[4];

          if (item && item.game) {
            const releaseYear = item.game.firstReleaseDate
              ? new Date(item.game.firstReleaseDate).getFullYear()
              : null;

            return (
              <Link
                key={pos}
                href={`/games/${item.game.slug}`}
                className="group relative aspect-[3/4] rounded-2xl overflow-hidden glass-card-v2 border border-white/[0.08] hover:border-amber-400/80 shadow-lg hover:shadow-[0_0_30px_rgba(251,191,36,0.3)] transition-all duration-300 transform hover:-translate-y-1.5"
              >
                {item.game.coverUrl ? (
                  <img
                    src={item.game.coverUrl}
                    alt={item.game.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-brand-surface">
                    <span className="text-3xl mb-1">🎮</span>
                    <span className="text-xs font-bold text-brand-muted line-clamp-2">
                      {item.game.name}
                    </span>
                  </div>
                )}

                {/* ScoreBadge en la esquina superior derecha */}
                <div className="absolute top-2.5 right-2.5 z-10">
                  <ScoreBadge score={item.game.communityScore} size="sm" />
                </div>

                {/* Indicador de posición insignia metálica (#1 oro, #2 plata, #3 bronce, #4 obsidiana) */}
                <div
                  className={`absolute top-2.5 left-2.5 z-10 w-7 h-7 rounded-lg backdrop-blur-md border ${badgeStyle.border} ${badgeStyle.bg} ${badgeStyle.glow} ${badgeStyle.text} flex items-center justify-center text-[11px] font-mono font-black`}
                >
                  #{pos}
                </div>

                {/* Overlay oscuro con blur al hacer hover con título */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3.5 backdrop-blur-[2px]">
                  <span className="text-xs font-bold text-white line-clamp-2 leading-tight">
                    {item.game.name}
                  </span>
                  {releaseYear && (
                    <span className="text-[10px] text-brand-muted font-mono mt-1">
                      {releaseYear}
                    </span>
                  )}
                </div>
              </Link>
            );
          }

          // Ranura vacía
          return (
            <div
              key={pos}
              onClick={isOwner ? onEditFavorites : undefined}
              className={`aspect-[3/4] rounded-2xl border-2 border-dashed border-white/[0.12] bg-brand-surface/20 flex flex-col items-center justify-center p-4 text-center transition-all ${
                isOwner
                  ? 'cursor-pointer hover:border-brand-accent/60 hover:bg-brand-surface/40 hover:shadow-lg group'
                  : ''
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-brand-surface/80 border border-white/10 flex items-center justify-center text-brand-muted group-hover:text-brand-accent group-hover:border-brand-accent/60 transition-all mb-2 shadow-inner">
                <span className="text-xl font-bold">{isOwner ? '+' : `#${pos}`}</span>
              </div>
              <span className="text-xs font-semibold text-brand-muted group-hover:text-brand-text transition-colors">
                {isOwner ? 'Añadir favorito' : `Vacío #${pos}`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
