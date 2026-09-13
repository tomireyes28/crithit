'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export interface GameActionDockProps {
  game: {
    id: string;
    slug: string;
    name: string;
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
  onOpenReviewModal?: () => void;
}

export const GameActionDock: React.FC<GameActionDockProps> = ({
  game,
  userReview,
  onOpenReviewModal,
}) => {
  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(game._count?.favoritedBy || 0);
  const [currentStatus, setCurrentStatus] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  const handleStatusChange = (status: string, label: string) => {
    if (!user) {
      showToast('Inicia sesión para gestionar el estado de este juego 🎮');
      return;
    }
    if (currentStatus === status) {
      setCurrentStatus(null);
      showToast('Estado restablecido');
    } else {
      setCurrentStatus(status);
      showToast(`Marcado como: ${label}`);
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
    showToast('El registro de sesiones y PlayLog se activará en el Paso 11 ⏱️');
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
            <span className="hidden sm:inline">{isFavorited ? 'Favorito' : 'Favorito'}</span>
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
            onClick={() => handleStatusChange('PLAYING', 'Jugando')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentStatus === 'PLAYING'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-sm'
                : 'bg-brand-bg/60 hover:bg-brand-bg text-brand-muted border border-brand-border/40 hover:text-brand-text'
            }`}
          >
            🎮 Jugando
          </button>

          <button
            onClick={() => handleStatusChange('COMPLETED', 'Completado')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentStatus === 'COMPLETED'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 shadow-sm'
                : 'bg-brand-bg/60 hover:bg-brand-bg text-brand-muted border border-brand-border/40 hover:text-brand-text'
            }`}
          >
            🏆 Completado
          </button>

          <button
            onClick={() => handleStatusChange('BACKLOG', 'En Backlog')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentStatus === 'BACKLOG'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50 shadow-sm'
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
