'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ScoreBadge } from '@/components/ui/ScoreBadge';
import { Gamepad2, Calendar } from 'lucide-react';
import { GameSummary } from '@crithit/shared';
import { motion } from 'framer-motion';

interface GameCardProps {
  game: GameSummary;
  priority?: boolean;
}

export const GameCard: React.FC<GameCardProps> = ({ game }) => {
  const [imgError, setImgError] = useState(false);

  const releaseYear =
    game.firstReleaseDate && !isNaN(new Date(game.firstReleaseDate).getTime())
      ? new Date(game.firstReleaseDate).getFullYear()
      : null;

  // Mostramos primero el puntaje de la comunidad de CritHit, si no hay mostramos el de críticos o metacritic
  const displayScore =
    game.communityScore !== null && game.communityScore !== undefined
      ? game.communityScore
      : game.criticScore !== null && game.criticScore !== undefined
        ? game.criticScore
        : game.metacriticScore;

  const isMasterpiece = displayScore !== null && displayScore !== undefined && displayScore >= 90;
  const coverSrc = !imgError && game.coverUrl ? game.coverUrl : null;

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: 'spring', stiffness: 380, damping: 24 }}
      className="h-full"
    >
      <Link
        href={`/games/${game.slug}`}
        className={`group relative flex flex-col h-full rounded-2xl bg-brand-card/75 border border-brand-border/60 overflow-hidden transition-all duration-300 ${
          isMasterpiece
            ? 'hover:border-emerald-400/70 hover:shadow-[0_10px_35px_rgba(0,230,118,0.22)]'
            : 'hover:border-brand-secondary/70 hover:shadow-[0_10px_35px_rgba(0,210,255,0.2)]'
        }`}
      >
      {/* Contenedor de Carátula con Proporción Póster */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-brand-surface">
        {coverSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverSrc}
            alt={game.name}
            className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-b from-brand-surface to-brand-card">
            <Gamepad2 className="w-12 h-12 text-brand-muted/40 mb-2 group-hover:text-brand-secondary/60 transition-colors" />
            <span className="text-xs font-medium text-brand-muted/60 line-clamp-2 px-2">
              {game.name}
            </span>
          </div>
        )}

        {/* Gradiente de sombra inferior para legibilidad */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-card via-transparent to-black/30 pointer-events-none opacity-80" />

        {/* Badge de Puntuación (0-100) Flotante */}
        <div className="absolute top-2.5 right-2.5 drop-shadow-md z-10">
          <ScoreBadge score={displayScore} size="sm" />
        </div>

        {/* Año en la esquina superior izquierda */}
        {releaseYear && (
          <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-mono text-zinc-300">
            <Calendar className="w-3 h-3 text-brand-muted" />
            <span>{releaseYear}</span>
          </div>
        )}
      </div>

      {/* Información del Juego */}
      <div className="p-3.5 flex flex-col flex-grow justify-between gap-2.5">
        <div>
          <h3
            className="font-bold text-sm text-white line-clamp-2 group-hover:text-brand-secondary transition-colors duration-200 leading-snug"
            title={game.name}
          >
            {game.name}
          </h3>

          {/* Géneros principales */}
          {game.genres && game.genres.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {game.genres.slice(0, 2).map((genre) => (
                <span
                  key={genre}
                  className="text-[10px] uppercase font-medium tracking-wider px-1.5 py-0.5 rounded bg-brand-surface text-brand-muted border border-brand-border/40"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Chips de plataformas compactas */}
        {game.platforms && game.platforms.length > 0 && (
          <div className="flex items-center gap-1 text-[11px] text-zinc-400 font-mono border-t border-brand-border/40 pt-2">
            <span className="text-brand-muted/70 text-[10px] uppercase">Plat:</span>
            <div className="flex flex-wrap gap-1 truncate">
              {game.platforms.slice(0, 3).map((plat) => (
                <span
                  key={plat}
                  className="px-1 py-0.2 text-[10px] rounded bg-brand-primary/10 text-brand-secondary border border-brand-secondary/20"
                >
                  {plat}
                </span>
              ))}
              {game.platforms.length > 3 && (
                <span className="text-[10px] text-brand-muted">
                  +{game.platforms.length - 3}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </Link>
  </motion.div>
  );
};
