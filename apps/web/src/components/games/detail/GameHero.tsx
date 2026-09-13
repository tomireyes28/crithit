'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ScoreBadge } from '@/components/ui/ScoreBadge';

export interface GameHeroProps {
  game: {
    id: string;
    slug: string;
    name: string;
    summary: string | null;
    coverUrl: string | null;
    backdropUrl: string | null;
    firstReleaseDate: string | null;
    communityScore: number | null;
    communityCount: number;
    criticScore: number | null;
    criticCount: number;
    metacriticScore: number | null;
    totalReviews: number;
    hypeCount: number;
    genres: Array<{ id: string; name: string; slug: string }>;
    platforms: Array<{ id: string; name: string; slug: string; abbreviation: string | null }>;
    _count?: {
      reviews: number;
      playLogs: number;
      favoritedBy: number;
    };
  };
}

export const GameHero: React.FC<GameHeroProps> = ({ game }) => {
  const [coverError, setCoverError] = useState(false);
  const [backdropError, setBackdropError] = useState(false);

  const releaseYear = game.firstReleaseDate
    ? new Date(game.firstReleaseDate).getFullYear()
    : null;

  const formattedReleaseDate = game.firstReleaseDate
    ? new Intl.DateTimeFormat('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date(game.firstReleaseDate))
    : 'Fecha por confirmar';

  const backdropSrc = !backdropError && (game.backdropUrl || game.coverUrl);
  const coverSrc = !coverError && (game.coverUrl || game.backdropUrl);

  return (
    <div className="relative w-full overflow-hidden bg-brand-bg">
      {/* Panorámica / Backdrop con degradados cinematográficos */}
      <div className="absolute inset-0 h-[480px] md:h-[560px] w-full overflow-hidden z-0">
        {backdropSrc ? (
          <img
            src={backdropSrc}
            alt={`${game.name} backdrop`}
            className="w-full h-full object-cover object-center filter brightness-[0.4] blur-[1px] transform scale-105"
            onError={() => setBackdropError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-brand-surface via-brand-bg to-brand-bg opacity-80" />
        )}
        {/* Degradados de fusión para integrar la imagen en el fondo de la página */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-brand-bg/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-bg/90 via-transparent to-brand-bg/90" />
      </div>

      {/* Contenido del Hero */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        {/* Breadcrumb de regreso */}
        <div className="mb-6">
          <Link
            href="/games"
            className="inline-flex items-center gap-2 text-xs font-semibold text-brand-muted hover:text-brand-accent transition-colors py-1.5 px-3 rounded-full bg-brand-surface/60 backdrop-blur-md border border-brand-border/40 hover:border-brand-accent/50"
          >
            <span>←</span>
            <span>Volver al catálogo</span>
          </Link>
        </div>

        {/* Ficha Principal: Poster + Información + Scoreboard */}
        <div className="flex flex-col md:flex-row items-start gap-8 lg:gap-12">
          {/* Póster Frontal con proporción 3:4 */}
          <div className="flex-shrink-0 w-44 sm:w-52 md:w-64 aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl shadow-black/80 border border-brand-border/80 bg-brand-surface relative group">
            {coverSrc ? (
              <img
                src={coverSrc}
                alt={game.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={() => setCoverError(true)}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-brand-surface to-brand-bg">
                <span className="text-4xl mb-2">🎮</span>
                <span className="text-xs font-bold text-brand-muted line-clamp-3">
                  {game.name}
                </span>
              </div>
            )}
            <div className="absolute inset-0 rounded-2xl border border-white/10 pointer-events-none group-hover:border-brand-accent/40 transition-colors" />
          </div>

          {/* Información del Juego */}
          <div className="flex-1 flex flex-col justify-between self-stretch">
            <div>
              {/* Metadatos superiores: Año y Géneros */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {releaseYear && (
                  <span className="px-2.5 py-0.5 text-xs font-mono font-semibold rounded-md bg-brand-surface/80 border border-brand-border text-brand-text">
                    {releaseYear}
                  </span>
                )}
                {game.genres?.slice(0, 3).map((genre) => (
                  <Link
                    key={genre.id}
                    href={`/games?genre=${genre.slug}`}
                    className="px-2.5 py-0.5 text-xs font-medium rounded-md bg-brand-surface/50 hover:bg-brand-surface border border-brand-border/60 hover:border-brand-accent/40 text-brand-muted hover:text-brand-text transition-colors"
                  >
                    {genre.name}
                  </Link>
                ))}
              </div>

              {/* Título Principal */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-text tracking-tight mb-3">
                {game.name}
              </h1>

              {/* Fecha de lanzamiento formateada */}
              <p className="text-xs text-brand-muted mb-6">
                Lanzamiento: <span className="text-brand-text font-medium">{formattedReleaseDate}</span>
              </p>
            </div>

            {/* Marcador de Puntuaciones Triple de CritHit */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-brand-surface/60 backdrop-blur-md border border-brand-border/60">
              {/* 1. CritHit Community Score */}
              <div className="flex items-center gap-3">
                <ScoreBadge score={game.communityScore} size="lg" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-brand-text tracking-wide uppercase">
                    Comunidad
                  </span>
                  <span className="text-[11px] text-brand-muted">
                    {game.communityCount > 0
                      ? `${game.communityCount.toLocaleString()} votos`
                      : 'Sin votos aún'}
                  </span>
                </div>
              </div>

              {/* 2. CritHit Critic Score */}
              <div className="flex items-center gap-3 border-l border-brand-border/40 pl-3 sm:pl-4">
                {game.criticScore !== null && game.criticScore !== undefined ? (
                  <>
                    <ScoreBadge score={game.criticScore} size="lg" />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-brand-text tracking-wide uppercase">
                        Crítica
                      </span>
                      <span className="text-[11px] text-brand-muted">
                        {game.criticCount} acreditados
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-brand-text tracking-wide uppercase flex items-center gap-1.5">
                      <span>⚖️</span> Crítica
                    </span>
                    <span className="text-[11px] text-brand-muted mt-0.5">
                      En evaluación
                    </span>
                  </div>
                )}
              </div>

              {/* 3. Metacritic Oficial */}
              <div className="col-span-2 sm:col-span-1 flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-brand-border/40 pt-2 sm:pt-0 sm:pl-4">
                {game.metacriticScore !== null && game.metacriticScore !== undefined ? (
                  <>
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center font-mono font-black text-base ${
                        game.metacriticScore >= 75
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                          : game.metacriticScore >= 50
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/50'
                      }`}
                    >
                      {game.metacriticScore}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-brand-text tracking-wide uppercase">
                        Metascore
                      </span>
                      <span className="text-[11px] text-brand-muted">
                        Crítica global
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-brand-text tracking-wide uppercase">
                      Metascore
                    </span>
                    <span className="text-[11px] text-brand-muted">No disponible</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
