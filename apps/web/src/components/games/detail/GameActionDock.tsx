'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api';
import { PlayStatus, PLAY_STATUS_MAP } from '@crithit/shared';

export interface GameActionDockProps {
  game: {
    id: string;
    slug: string;
    name: string;
    coverUrl?: string | null;
    platforms?: Array<{ id: string; name: string; abbreviation: string | null }>;
    _count?: {
      reviews: number;
      playLogs: number;
      favoritedBy: number;
    };
  };
  userReview?: {
    id: string;
    score: number;
    title: string | null;
    body: string | null;
    platform: string | null;
    playtimeAtReview: number | null;
    containsSpoilers: boolean;
    recommends: boolean | null;
  } | null;
  userPlayStatus?: PlayStatus | null;
  onOpenReviewModal?: () => void;
  onOpenLogModal?: (status?: PlayStatus) => void;
  onStatusChanged?: (newStatus: PlayStatus) => void;
}

export const GameActionDock: React.FC<GameActionDockProps> = ({
  game,
  userReview,
  userPlayStatus = null,
  onOpenReviewModal,
  onOpenLogModal,
  onStatusChanged,
}) => {
  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(game._count?.favoritedBy || 0);
  const [currentStatus, setCurrentStatus] = useState<PlayStatus | null>(userPlayStatus);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);

  useEffect(() => {
    setCurrentStatus(userPlayStatus);
  }, [userPlayStatus]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleFavoriteClick = () => {
    if (!user) {
      showToast('Inicia sesión para guardar este juego en tus favoritos ❤️');
      return;
    }
    const nextState = !isFavorited;
    setIsFavorited(nextState);
    setFavoriteCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));
    showToast(nextState ? '¡Añadido a tus favoritos!' : 'Eliminado de tus favoritos');
  };

  const handleQuickStatusChange = async (newStatus: PlayStatus) => {
    if (!user) {
      showToast('Inicia sesión para registrar el estado de este juego 🎮');
      return;
    }

    if (currentStatus === newStatus) {
      // Abrir modal para editar detalles de la partida existente
      onOpenLogModal?.(newStatus);
      return;
    }

    setIsStatusUpdating(true);
    const label = PLAY_STATUS_MAP[newStatus]?.labelEs || newStatus;

    try {
      await apiClient('/play-logs', {
        method: 'POST',
        body: JSON.stringify({
          gameId: game.id,
          status: newStatus,
        }),
      });

      setCurrentStatus(newStatus);
      onStatusChanged?.(newStatus);
      showToast(`¡Partida registrada como: ${label}! 📖`);
    } catch {
      showToast('Error al actualizar el estado. Inténtalo de nuevo.');
    } finally {
      setIsStatusUpdating(false);
    }
  };

  const handleReviewClick = () => {
    if (!user) {
      showToast('Inicia sesión para calificar y escribir tu reseña ⭐');
      return;
    }
    onOpenReviewModal?.();
  };

  const handleLogClick = () => {
    if (!user) {
      showToast('Inicia sesión para registrar una partida en tu diario 📖');
      return;
    }
    onOpenLogModal?.(currentStatus || 'PLAYING');
  };

  return (
    <div className="w-full bg-brand-surface/80 backdrop-blur-lg border-y border-brand-border/60 py-3 sticky top-16 z-20 shadow-lg shadow-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
        {/* Acciones Principales */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Botón 1: Calificar / Reseñar */}
          <button
            onClick={handleReviewClick}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all transform hover:-translate-y-0.5 active:translate-y-0 ${
              userReview
                ? 'bg-brand-surface border border-brand-accent text-brand-accent shadow-lg shadow-brand-accent/20 hover:bg-brand-accent/10'
                : 'bg-gradient-to-r from-brand-accent to-emerald-500 text-brand-bg hover:brightness-110 shadow-lg shadow-brand-accent/20'
            }`}
          >
            <span>⭐</span>
            <span>
              {userReview
                ? `Tu nota: ${userReview.score} · Editar`
                : 'Calificar / Reseñar'}
            </span>
          </button>

          {/* Botón 2: Añadir al Diario */}
          <button
            onClick={handleLogClick}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-brand-bg hover:bg-brand-surface border border-brand-border hover:border-brand-accent/50 text-brand-text transition-all"
          >
            <span>📖</span>
            <span>Añadir al Diario</span>
          </button>

          {/* Botón 3: Favorito */}
          <button
            onClick={handleFavoriteClick}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all border ${
              isFavorited
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/60 shadow-lg shadow-rose-500/20'
                : 'bg-brand-bg hover:bg-brand-surface border-brand-border hover:border-rose-500/40 text-brand-muted hover:text-rose-400'
            }`}
          >
            <span>{isFavorited ? '❤️' : '🤍'}</span>
            <span className="hidden sm:inline">Favorito</span>
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-brand-surface/90 font-mono text-brand-muted">
              {favoriteCount}
            </span>
          </button>
        </div>

        {/* Estados de Juego rápidos (Letterboxd Style) */}
        <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-1">
          <span className="text-xs font-semibold text-brand-muted mr-1 hidden lg:inline">
            Estado:
          </span>

          <button
            onClick={() => handleQuickStatusChange('PLAYING')}
            disabled={isStatusUpdating}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentStatus === 'PLAYING'
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50 shadow-sm font-bold ring-1 ring-blue-500/30'
                : 'bg-brand-bg/60 hover:bg-brand-bg text-brand-muted border border-brand-border/40 hover:text-brand-text'
            }`}
          >
            🎮 Jugando
          </button>

          <button
            onClick={() => handleQuickStatusChange('COMPLETED')}
            disabled={isStatusUpdating}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentStatus === 'COMPLETED'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 shadow-sm font-bold ring-1 ring-emerald-500/30'
                : 'bg-brand-bg/60 hover:bg-brand-bg text-brand-muted border border-brand-border/40 hover:text-brand-text'
            }`}
          >
            🏆 Completado
          </button>

          <button
            onClick={() => handleQuickStatusChange('MASTERED')}
            disabled={isStatusUpdating}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentStatus === 'MASTERED'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm font-bold ring-1 ring-amber-500/30'
                : 'bg-brand-bg/60 hover:bg-brand-bg text-brand-muted border border-brand-border/40 hover:text-brand-text'
            }`}
          >
            👑 100%
          </button>

          <button
            onClick={() => handleQuickStatusChange('BACKLOG')}
            disabled={isStatusUpdating}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentStatus === 'BACKLOG'
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50 shadow-sm font-bold ring-1 ring-purple-500/30'
                : 'bg-brand-bg/60 hover:bg-brand-bg text-brand-muted border border-brand-border/40 hover:text-brand-text'
            }`}
          >
            ⏳ Backlog
          </button>
        </div>
      </div>

      {/* Toast Notification Bar */}
      {toastMessage && (
        <div className="max-w-md mx-auto px-4 mt-2">
          <div className="p-2.5 rounded-xl bg-brand-surface border border-brand-accent/40 shadow-xl text-center text-xs font-medium text-brand-text flex items-center justify-between gap-3 animate-fade-in">
            <span>{toastMessage}</span>
            {!user && (
              <Link
                href="/login"
                className="text-xs font-bold text-brand-accent hover:underline flex-shrink-0"
              >
                Iniciar sesión
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
