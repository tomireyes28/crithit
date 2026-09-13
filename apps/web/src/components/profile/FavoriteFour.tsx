'use client';

import React from 'react';
import Link from 'next/link';
import { ScoreBadge } from '@/components/ui/ScoreBadge';

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
          <h2 className="text-xl font-bold text-brand-text">Favorite Four</h2>
          <span className="text-xs text-brand-muted font-medium hidden sm:inline">
            (Los 4 títulos insignia)
          </span>
        </div>

        {isOwner && onEditFavorites && (
          <button
            onClick={onEditFavorites}
            className="text-xs font-bold text-brand-accent hover:underline flex items-center gap-1.5 py-1 px-3 rounded-lg bg-brand-surface border border-brand-border/60 hover:border-brand-accent/40 transition-colors"
          >
            <span>✏️</span>
            <span>Editar Favoritos</span>
          </button>
        )}
      </div>

      {/* Grid de 4 Pósters Verticales */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {slots.map((pos) => {
          const item = favorites.find((f) => f.position === pos);

          if (item && item.game) {
            const releaseYear = item.game.firstReleaseDate
              ? new Date(item.game.firstReleaseDate).getFullYear()
              : null;

            return (
              <Link
                key={pos}
                href={`/games/${item.game.slug}`}
                className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-brand-surface border border-brand-border/70 hover:border-brand-accent shadow-lg shadow-black/40 transition-all duration-300 transform hover:-translate-y-1"
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

                {/* Indicador de posición (#1, #2, #3, #4) */}
                <div className="absolute top-2.5 left-2.5 z-10 w-6 h-6 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-[10px] font-mono font-bold text-white">
                  #{pos}
                </div>

                {/* Overlay oscuro al hacer hover con título */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                  <span className="text-xs font-bold text-white line-clamp-2 leading-tight">
                    {item.game.name}
                  </span>
                  {releaseYear && (
                    <span className="text-[10px] text-brand-muted font-mono mt-0.5">
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
              className={`aspect-[3/4] rounded-2xl border-2 border-dashed border-brand-border/60 bg-brand-surface/20 flex flex-col items-center justify-center p-4 text-center transition-all ${
                isOwner
                  ? 'cursor-pointer hover:border-brand-accent/60 hover:bg-brand-surface/40 group'
                  : ''
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-brand-surface border border-brand-border/60 flex items-center justify-center text-brand-muted group-hover:text-brand-accent group-hover:border-brand-accent transition-colors mb-2">
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
