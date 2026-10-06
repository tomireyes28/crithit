'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ScoreBadge } from '@/components/ui/ScoreBadge';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api';
import { MessageSquare, Filter, Award, Sparkles } from 'lucide-react';
import { ReviewCommentsSection } from '@/components/reviews/ReviewCommentsSection';
import { motion, AnimatePresence } from 'framer-motion';
import { BouncyTap, SPRING_SNAPPY, SPRING_GENTLE } from '@/components/ui/MotionWrapper';

export interface GameReviewsListProps {
  gameName: string;
  reviews: Array<{
    id: string;
    score: number;
    title: string | null;
    body?: string | null;
    content?: string | null;
    containsSpoilers?: boolean;
    hasSpoilers?: boolean;
    playedHours?: number | null;
    playtimeAtReview?: number | null;
    likeCount: number;
    commentCount?: number;
    hasLiked?: boolean;
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

type ReviewTab = 'all' | 'critics' | 'text';

export const GameReviewsList: React.FC<GameReviewsListProps> = ({
  gameName,
  reviews,
  onOpenReviewModal,
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ReviewTab>('all');
  const [revealedSpoilers, setRevealedSpoilers] = useState<Record<string, boolean>>({});
  const [likesState, setLikesState] = useState<
    Record<string, { hasLiked: boolean; likeCount: number }>
  >({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sincronizar estado de likes y comentarios cuando cambian las reseñas
  useEffect(() => {
    const initial: Record<string, { hasLiked: boolean; likeCount: number }> = {};
    const initialCounts: Record<string, number> = {};
    reviews.forEach((r) => {
      initial[r.id] = {
        hasLiked: Boolean(r.hasLiked),
        likeCount: r.likeCount || 0,
      };
      initialCounts[r.id] = r.commentCount || 0;
    });
    setLikesState(initial);
    setCommentCounts(initialCounts);
  }, [reviews]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const toggleSpoiler = (reviewId: string) => {
    setRevealedSpoilers((prev) => ({
      ...prev,
      [reviewId]: !prev[reviewId],
    }));
  };

  const handleToggleLike = async (reviewId: string) => {
    if (!user) {
      showToast('Inicia sesión para dar me gusta a esta reseña ❤️');
      return;
    }

    const current = likesState[reviewId] || { hasLiked: false, likeCount: 0 };
    const nextLiked = !current.hasLiked;
    const nextCount = nextLiked ? current.likeCount + 1 : Math.max(0, current.likeCount - 1);

    // Actualización optimista inmediata
    setLikesState((prev) => ({
      ...prev,
      [reviewId]: { hasLiked: nextLiked, likeCount: nextCount },
    }));

    try {
      const res: any = await apiClient(`/reviews/${reviewId}/like`, {
        method: 'POST',
      });
      if (res && typeof res.likeCount === 'number') {
        setLikesState((prev) => ({
          ...prev,
          [reviewId]: { hasLiked: res.liked, likeCount: res.likeCount },
        }));
      }
    } catch {
      // Revertir en caso de error
      setLikesState((prev) => ({
        ...prev,
        [reviewId]: current,
      }));
      showToast('No se pudo registrar el me gusta. Inténtalo de nuevo.');
    }
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

  // Filtrado reactivo de reseñas
  const filteredReviews = reviews.filter((r) => {
    if (activeTab === 'critics') {
      return r.user.role === 'CRITIC' || r.user.criticTier !== null;
    }
    if (activeTab === 'text') {
      const text = r.body || r.content || '';
      return text.trim().length > 0;
    }
    return true;
  });

  const criticReviewsCount = reviews.filter(
    (r) => r.user.role === 'CRITIC' || r.user.criticTier !== null,
  ).length;
  const textReviewsCount = reviews.filter(
    (r) => ((r.body || r.content) || '').trim().length > 0,
  ).length;

  return (
    <div className="space-y-6">
      {/* Toast informativo */}
      {toastMessage && (
        <div className="p-3 rounded-xl bg-brand-surface border border-brand-accent/40 text-xs font-semibold text-brand-text flex items-center justify-between gap-2 shadow-lg animate-fade-in">
          <span>{toastMessage}</span>
          {!user && (
            <Link href="/login" className="text-brand-accent hover:underline flex-shrink-0">
              Iniciar sesión
            </Link>
          )}
        </div>
      )}

      {/* Cabecera y Selector de Pestañas con layoutId animado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>💬</span>
            <span>Reseñas y Análisis</span>
          </h2>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-white/5 border border-white/10 text-brand-muted">
            {reviews.length}
          </span>
        </div>

        {reviews.length > 0 && onOpenReviewModal && (
          <BouncyTap>
            <button
              onClick={onOpenReviewModal}
              className="text-xs font-bold text-brand-accent hover:brightness-110 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-accent/10 border border-brand-accent/30 transition-all self-start sm:self-auto"
            >
              <span>+</span>
              <span>Escribir reseña</span>
            </button>
          </BouncyTap>
        )}
      </div>

      {/* Pestañas de filtrado con indicador deslizante continuo */}
      {reviews.length > 0 && (
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-brand-surface/40 border border-white/[0.06] backdrop-blur-md self-start max-w-fit">
          <button
            onClick={() => setActiveTab('all')}
            className={`relative px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'all' ? 'text-white' : 'text-brand-muted hover:text-white'
            }`}
          >
            {activeTab === 'all' && (
              <motion.div
                layoutId="activeReviewsFilter"
                transition={SPRING_SNAPPY}
                className="absolute inset-0 bg-brand-surface border border-white/10 rounded-lg shadow-sm"
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <span>Todas</span>
              <span className="text-[10px] opacity-75 font-mono">({reviews.length})</span>
            </span>
          </button>

          <button
            onClick={() => setActiveTab('critics')}
            className={`relative px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'critics' ? 'text-cyan-300' : 'text-brand-muted hover:text-white'
            }`}
          >
            {activeTab === 'critics' && (
              <motion.div
                layoutId="activeReviewsFilter"
                transition={SPRING_SNAPPY}
                className="absolute inset-0 bg-cyan-500/15 border border-cyan-500/30 rounded-lg shadow-sm"
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" />
              <span>Críticos</span>
              <span className="text-[10px] opacity-75 font-mono">({criticReviewsCount})</span>
            </span>
          </button>

          <button
            onClick={() => setActiveTab('text')}
            className={`relative px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'text' ? 'text-brand-accent' : 'text-brand-muted hover:text-white'
            }`}
          >
            {activeTab === 'text' && (
              <motion.div
                layoutId="activeReviewsFilter"
                transition={SPRING_SNAPPY}
                className="absolute inset-0 bg-brand-accent/15 border border-brand-accent/30 rounded-lg shadow-sm"
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Con Análisis</span>
              <span className="text-[10px] opacity-75 font-mono">({textReviewsCount})</span>
            </span>
          </button>
        </div>
      )}

      {reviews.length === 0 ? (
        /* Estado vacío interactivo y estimulante */
        <div className="p-8 sm:p-10 rounded-2xl glass-card-v2 border border-white/[0.08] flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-brand-accent/10 border border-brand-accent/30 flex items-center justify-center text-2xl mb-4">
            ✍️
          </div>
          <h3 className="text-lg font-bold text-white mb-2">
            Aún no hay reseñas para {gameName}
          </h3>
          <p className="text-sm text-brand-muted max-w-md mb-6">
            ¿Has jugado a este título? Sé el primero de la comunidad de CritHit en compartir tu experiencia y calificación.
          </p>
          <BouncyTap>
            <button
              onClick={onOpenReviewModal}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-brand-accent text-brand-bg hover:brightness-110 shadow-lg shadow-brand-accent/20 transition-all flex items-center gap-2"
            >
              <span>⭐</span>
              <span>Escribir la primera reseña</span>
            </button>
          </BouncyTap>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="p-8 rounded-2xl glass-card-v2 border border-white/[0.06] text-center space-y-2">
          <p className="text-sm text-brand-muted font-medium">
            No se encontraron reseñas en la categoría seleccionada.
          </p>
          <button
            onClick={() => setActiveTab('all')}
            className="text-xs font-bold text-brand-accent hover:underline"
          >
            Ver todas las reseñas ({reviews.length})
          </button>
        </div>
      ) : (
        /* Feed de Reseñas */
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredReviews.map((rev, index) => {
              const hasSpoilers = Boolean(rev.containsSpoilers || rev.hasSpoilers);
              const isSpoilerHidden = hasSpoilers && !revealedSpoilers[rev.id];
              const isCritic = rev.user.role === 'CRITIC' || rev.user.criticTier !== null;
              const contentText = rev.body || rev.content;
              const hours = rev.playedHours ?? rev.playtimeAtReview;
              const likeInfo = likesState[rev.id] || {
                hasLiked: Boolean(rev.hasLiked),
                likeCount: rev.likeCount || 0,
              };

              return (
                <motion.div
                  key={rev.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ ...SPRING_GENTLE, delay: Math.min(index * 0.05, 0.3) }}
                  className="p-5 rounded-2xl glass-card-v2 border border-white/[0.08] hover:border-white/[0.18] transition-all space-y-3.5 shadow-lg relative group"
                >
                  {/* Cabecera de la Reseña */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <Link
                        href={`/profile/${rev.user.username}`}
                        className="w-10 h-10 rounded-xl overflow-hidden bg-brand-bg border border-brand-border/60 hover:border-brand-accent/50 flex items-center justify-center text-sm font-bold text-brand-muted flex-shrink-0 transition-colors"
                      >
                        {rev.user.avatarUrl ? (
                          <img
                            src={rev.user.avatarUrl}
                            alt={rev.user.displayName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>{rev.user.displayName.charAt(0).toUpperCase()}</span>
                        )}
                      </Link>

                      {/* Nombres y Rol */}
                      <div>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/profile/${rev.user.username}`}
                            className="font-bold text-sm text-brand-text hover:text-brand-accent transition-colors"
                          >
                            {rev.user.displayName}
                          </Link>
                          {isCritic && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
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
                  {hours !== null && hours !== undefined && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-brand-bg/80 text-brand-muted border border-brand-border/40">
                      <span>⏱️</span>
                      <span>{hours} horas registradas</span>
                    </div>
                  )}

                  {/* Título de la reseña */}
                  {rev.title && (
                    <h4 className="text-base font-bold text-white">{rev.title}</h4>
                  )}

                  {/* Contenido con manejo de spoilers */}
                  {contentText && (
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
                        <p className="text-sm text-brand-text/90 leading-relaxed whitespace-pre-line font-normal">
                          {contentText}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Pie de la Reseña: Likes y Debate Comunitario */}
                  <div className="pt-2 flex items-center gap-3 text-xs text-brand-muted border-t border-white/[0.04]">
                    <BouncyTap>
                      <button
                        onClick={() => handleToggleLike(rev.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                          likeInfo.hasLiked
                            ? 'text-rose-400 bg-rose-500/15 border border-rose-500/35 shadow-[0_0_12px_rgba(244,63,94,0.2)]'
                            : 'hover:text-rose-400 hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        <span className="text-sm">{likeInfo.hasLiked ? '❤️' : '🤍'}</span>
                        <span className="font-mono font-bold">{likeInfo.likeCount}</span>
                        <span className="hidden sm:inline">me gusta</span>
                      </button>
                    </BouncyTap>

                    <BouncyTap>
                      <button
                        onClick={() =>
                          setExpandedComments((prev) => ({
                            ...prev,
                            [rev.id]: !prev[rev.id],
                          }))
                        }
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                          expandedComments[rev.id]
                            ? 'text-brand-secondary bg-brand-secondary/15 border border-brand-secondary/35'
                            : 'hover:text-brand-secondary hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span className="font-mono font-bold">
                          {commentCounts[rev.id] ?? rev.commentCount ?? 0}
                        </span>
                        <span className="hidden sm:inline">
                          {expandedComments[rev.id] ? 'ocultar debate' : 'comentarios'}
                        </span>
                      </button>
                    </BouncyTap>
                  </div>

                  {/* Sección interactiva de comentarios desplegable */}
                  <AnimatePresence>
                    {expandedComments[rev.id] && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={SPRING_GENTLE}
                        className="overflow-hidden pt-2"
                      >
                        <ReviewCommentsSection
                          reviewId={rev.id}
                          initialCount={commentCounts[rev.id] ?? rev.commentCount ?? 0}
                          onCountChange={(cnt) =>
                            setCommentCounts((prev) => ({ ...prev, [rev.id]: cnt }))
                          }
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
