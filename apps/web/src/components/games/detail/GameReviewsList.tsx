'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ScoreBadge } from '@/components/ui/ScoreBadge';

export interface GameReviewsListProps {
  gameName: string;
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
  onOpenReviewModal?: () => void;
}

export const GameReviewsList: React.FC<GameReviewsListProps> = ({
  gameName,
  reviews,
  onOpenReviewModal,
}) => {
  const [revealedSpoilers, setRevealedSpoilers] = useState<Record<string, boolean>>({});

  const toggleSpoiler = (reviewId: string) => {
    setRevealedSpoilers((prev) => ({
      ...prev,
      [reviewId]: !prev[reviewId],
    }));
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Intl.DateTimeFormat('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(new Date(dateStr));
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-brand-border/60">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-brand-text">Reseñas de la Comunidad</h2>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-brand-surface border border-brand-border text-brand-muted">
            {reviews.length}
          </span>
        </div>

        {reviews.length > 0 && onOpenReviewModal && (
          <button
            onClick={onOpenReviewModal}
            className="text-xs font-bold text-brand-accent hover:underline flex items-center gap-1"
          >
            <span>+</span>
            <span>Escribir reseña</span>
          </button>
        )}
      </div>

      {reviews.length === 0 ? (
        /* Estado vacío interactivo y estimulante */
        <div className="p-8 sm:p-10 rounded-2xl bg-brand-surface/40 border border-brand-border/60 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-brand-accent/10 border border-brand-accent/30 flex items-center justify-center text-2xl mb-4">
            ✍️
          </div>
          <h3 className="text-lg font-bold text-brand-text mb-2">
            Aún no hay reseñas para {gameName}
          </h3>
          <p className="text-sm text-brand-muted max-w-md mb-6">
            ¿Has jugado a este título? Sé el primero de la comunidad de CritHit en compartir tu experiencia y calificación.
          </p>
          <button
            onClick={onOpenReviewModal}
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-brand-accent/10 hover:bg-brand-accent/20 border border-brand-accent/50 text-brand-accent transition-colors flex items-center gap-2"
          >
            <span>⭐</span>
            <span>Escribir la primera reseña</span>
          </button>
        </div>
      ) : (
        /* Feed de Reseñas */
        <div className="space-y-4">
          {reviews.map((rev) => {
            const isSpoilerHidden = rev.hasSpoilers && !revealedSpoilers[rev.id];
            const isCritic = rev.user.role === 'CRITIC' || rev.user.criticTier !== null;

            return (
              <div
                key={rev.id}
                className="p-5 rounded-2xl bg-brand-surface/50 border border-brand-border/60 hover:border-brand-border transition-colors space-y-3"
              >
                {/* Cabecera de la Reseña */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-brand-bg border border-brand-border flex items-center justify-center text-sm font-bold text-brand-muted flex-shrink-0">
                      {rev.user.avatarUrl ? (
                        <img
                          src={rev.user.avatarUrl}
                          alt={rev.user.displayName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{rev.user.displayName.charAt(0).toUpperCase()}</span>
                      )}
                    </div>

                    {/* Nombres y Rol */}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-brand-text hover:text-brand-accent transition-colors">
                          {rev.user.displayName}
                        </span>
                        {isCritic && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-violet-500/20 border border-violet-500/40 text-violet-300">
                            Crítico Acreditado
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-brand-muted">
                        @{rev.user.username} · {formatDate(rev.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Puntuación */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <ScoreBadge score={rev.score} size="md" />
                  </div>
                </div>

                {/* Horas jugadas si están especificadas */}
                {rev.playedHours && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-brand-bg/80 text-brand-muted border border-brand-border/40">
                    <span>⏱️</span>
                    <span>{rev.playedHours} horas registradas</span>
                  </div>
                )}

                {/* Título de la reseña */}
                {rev.title && (
                  <h4 className="text-base font-bold text-brand-text">{rev.title}</h4>
                )}

                {/* Contenido con manejo de spoilers */}
                {rev.content && (
                  <div className="relative">
                    {isSpoilerHidden ? (
                      <div
                        onClick={() => toggleSpoiler(rev.id)}
                        className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center cursor-pointer hover:bg-amber-500/15 transition-colors"
                      >
                        <p className="text-xs font-bold text-amber-400 mb-1">
                          ⚠️ Esta reseña contiene spoilers de la trama
                        </p>
                        <p className="text-xs text-brand-muted underline">
                          Haz clic para revelar el contenido
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-brand-text/90 leading-relaxed whitespace-pre-line">
                        {rev.content}
                      </p>
                    )}
                  </div>
                )}

                {/* Pie de la Reseña: Likes */}
                <div className="pt-2 flex items-center gap-4 text-xs text-brand-muted">
                  <button className="flex items-center gap-1.5 hover:text-rose-400 transition-colors">
                    <span>🤍</span>
                    <span>{rev.likeCount} me gusta</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
