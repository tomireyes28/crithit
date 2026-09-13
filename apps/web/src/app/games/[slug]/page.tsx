'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { GameHero } from '@/components/games/detail/GameHero';
import { GameActionDock } from '@/components/games/detail/GameActionDock';
import { GameReviewsList } from '@/components/games/detail/GameReviewsList';

interface GameDetailData {
  id: string;
  slug: string;
  name: string;
  summary: string | null;
  storyline: string | null;
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
  developers?: Array<{ id: string; name: string; slug: string }>;
  publishers?: Array<{ id: string; name: string; slug: string }>;
  reviews: Array<{
    id: string;
    score: number;
    title: string | null;
    content: string | null;
    hasSpoilers: boolean;
    playedHours: number | null;
    likeCount: number;
    createdAt: string;
    user: {
      id: string;
      username: string;
      displayName: string;
      avatarUrl: string | null;
      role: string;
      criticTier: string | null;
      criticBadge: string | null;
    };
  }>;
  _count?: {
    reviews: number;
    playLogs: number;
    favoritedBy: number;
  };
}

export default function GameDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [game, setGame] = useState<GameDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);

  useEffect(() => {
    if (!slug) return;

    let isMounted = true;
    const fetchGame = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await apiClient<GameDetailData>(`/games/${slug}`);
        if (isMounted) {
          setGame(data);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(
            err.statusCode === 404
              ? 'No pudimos encontrar el juego solicitado'
              : 'Error al cargar la información del juego'
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchGame();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  // Estado de Carga: Skeleton Completo
  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-bg pb-20 animate-pulse">
        {/* Hero Skeleton */}
        <div className="h-[420px] bg-brand-surface/40 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 flex gap-8">
            <div className="w-48 sm:w-56 aspect-[3/4] rounded-2xl bg-brand-surface border border-brand-border/60" />
            <div className="flex-1 space-y-4 pt-4">
              <div className="w-32 h-6 rounded-md bg-brand-surface" />
              <div className="w-3/4 h-12 rounded-xl bg-brand-surface" />
              <div className="w-48 h-4 rounded-md bg-brand-surface" />
              <div className="w-full max-w-md h-16 rounded-2xl bg-brand-surface" />
            </div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-4">
            <div className="w-40 h-6 rounded-md bg-brand-surface" />
            <div className="w-full h-32 rounded-xl bg-brand-surface" />
            <div className="w-full h-48 rounded-xl bg-brand-surface" />
          </div>
          <div className="space-y-4">
            <div className="w-full h-64 rounded-2xl bg-brand-surface" />
          </div>
        </div>
      </div>
    );
  }

  // Estado de Error / 404
  if (error || !game) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 bg-brand-bg">
        <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-4xl mb-6">
          👾
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-brand-text mb-2">
          {error || 'Juego no encontrado'}
        </h1>
        <p className="text-brand-muted text-sm max-w-md mb-8">
          El juego con identificador <span className="font-mono text-brand-accent">"{slug}"</span> no existe en el catálogo o aún no ha sido sincronizado.
        </p>
        <Link
          href="/games"
          className="px-6 py-3 rounded-xl font-bold text-sm bg-brand-accent text-brand-bg hover:brightness-110 transition-all shadow-lg shadow-brand-accent/20"
        >
          ← Volver a Explorar Juegos
        </Link>
      </div>
    );
  }

  const summaryText = game.summary || 'Sinopsis no disponible para este título.';
  const isLongSummary = summaryText.length > 450;
  const displayedSummary =
    isLongSummary && !isSummaryExpanded
      ? `${summaryText.slice(0, 450)}...`
      : summaryText;

  const formattedReleaseDate = game.firstReleaseDate
    ? new Intl.DateTimeFormat('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date(game.firstReleaseDate))
    : 'No especificada';

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text pb-24">
      {/* 1. Hero Cinematográfico con Backdrop y Scoreboard */}
      <GameHero game={game} />

      {/* 2. Barra de Acciones Rápida (Letterboxd Style) */}
      <GameActionDock game={game} />

      {/* 3. Contenido Principal: 2 Columnas */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Columna Izquierda: Sinopsis y Feed de Reseñas */}
          <div className="lg:col-span-2 space-y-10">
            {/* Sinopsis */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-brand-text flex items-center gap-2">
                <span>📖</span>
                <span>Sinopsis</span>
              </h2>
              <div className="p-6 rounded-2xl bg-brand-surface/30 border border-brand-border/60">
                <p className="text-sm sm:text-base text-brand-text/90 leading-relaxed whitespace-pre-line">
                  {displayedSummary}
                </p>
                {isLongSummary && (
                  <button
                    onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
                    className="mt-3 text-xs font-bold text-brand-accent hover:underline inline-flex items-center gap-1"
                  >
                    <span>{isSummaryExpanded ? 'Ver menos' : 'Leer sinopsis completa'}</span>
                    <span>{isSummaryExpanded ? '↑' : '↓'}</span>
                  </button>
                )}
              </div>
            </section>

            {/* Feed de Reseñas de la Comunidad */}
            <section>
              <GameReviewsList
                gameName={game.name}
                reviews={game.reviews}
                onOpenReviewModal={() => {
                  alert('El modal de reseña y calificación completa se activará en el Paso 10.');
                }}
              />
            </section>
          </div>

          {/* Columna Derecha: Ficha Técnica & Estadísticas */}
          <div className="space-y-6">
            {/* Tarjeta de Ficha Técnica */}
            <div className="p-6 rounded-2xl bg-brand-surface/40 border border-brand-border/60 space-y-5">
              <h3 className="text-sm font-bold text-brand-text uppercase tracking-wider border-b border-brand-border/60 pb-3">
                Ficha Técnica
              </h3>

              {/* Fecha de Lanzamiento */}
              <div>
                <span className="text-xs font-medium text-brand-muted block mb-1">
                  Fecha de estreno
                </span>
                <span className="text-sm font-semibold text-brand-text">
                  {formattedReleaseDate}
                </span>
              </div>

              {/* Plataformas disponibles */}
              <div>
                <span className="text-xs font-medium text-brand-muted block mb-2">
                  Plataformas disponibles
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {game.platforms && game.platforms.length > 0 ? (
                    game.platforms.map((plat) => (
                      <Link
                        key={plat.id}
                        href={`/games?platform=${plat.slug}`}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-brand-bg hover:bg-brand-surface border border-brand-border hover:border-brand-accent/50 text-brand-text transition-colors"
                      >
                        {plat.abbreviation || plat.name}
                      </Link>
                    ))
                  ) : (
                    <span className="text-xs text-brand-muted">No especificadas</span>
                  )}
                </div>
              </div>

              {/* Géneros */}
              <div>
                <span className="text-xs font-medium text-brand-muted block mb-2">
                  Géneros
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {game.genres && game.genres.length > 0 ? (
                    game.genres.map((g) => (
                      <Link
                        key={g.id}
                        href={`/games?genre=${g.slug}`}
                        className="px-2.5 py-1 text-xs font-medium rounded-lg bg-brand-surface border border-brand-border/60 hover:border-brand-accent/40 text-brand-muted hover:text-brand-text transition-colors"
                      >
                        {g.name}
                      </Link>
                    ))
                  ) : (
                    <span className="text-xs text-brand-muted">No especificados</span>
                  )}
                </div>
              </div>

              {/* Estadísticas de la Comunidad */}
              <div className="pt-3 border-t border-brand-border/40">
                <span className="text-xs font-medium text-brand-muted block mb-3">
                  Actividad en CritHit
                </span>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-2.5 rounded-xl bg-brand-bg/60 border border-brand-border/40">
                    <span className="block font-mono font-bold text-base text-brand-accent">
                      {(game._count?.reviews ?? 0) + (game.communityCount > 0 ? game.communityCount : 0)}
                    </span>
                    <span className="text-[11px] text-brand-muted">Calificaciones</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-brand-bg/60 border border-brand-border/40">
                    <span className="block font-mono font-bold text-base text-cyan-400">
                      {game._count?.playLogs ?? 0}
                    </span>
                    <span className="text-[11px] text-brand-muted">En Diarios</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Atribución y Enlaces Externos */}
            <div className="p-4 rounded-xl bg-brand-surface/20 border border-brand-border/40 text-center text-xs text-brand-muted">
              Datos e imágenes sincronizados vía{' '}
              <a
                href="https://rawg.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-accent hover:underline"
              >
                RAWG Video Games Database
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
