'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ScoreBadge } from '@/components/ui/ScoreBadge';
import { MotionLikeButton } from '@/components/ui/MotionLikeButton';
import { ActivityItemSkeleton } from '@/components/activity/ActivityItemSkeleton';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/MotionWrapper';
import {
  MessageSquare,
  Search,
  Sparkles,
  Award,
  Clock,
  ThumbsUp,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Flame,
  ArrowUpDown,
  Gamepad2,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function ReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sort, setSort] = useState<'popular' | 'recent' | 'highest' | 'lowest'>('popular');
  const [criticOnly, setCriticOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Spoilers revealed per review ID
  const [revealedSpoilers, setRevealedSpoilers] = useState<Record<string, boolean>>({});

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        sort,
      });

      if (criticOnly) params.append('criticOnly', 'true');
      if (debouncedSearch) params.append('search', debouncedSearch);

      const headers: Record<string, string> = {};
      const token = typeof window !== 'undefined' ? localStorage.getItem('crithit_token') : null;
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/reviews?${params.toString()}`, { headers });
      if (!res.ok) throw new Error('Error al cargar las reseñas');

      const data = await res.json();
      setReviews(data.items || []);
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.total || 0);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  }, [page, sort, criticOnly, debouncedSearch]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleLikeToggle = async (reviewId: string) => {
    if (!user) {
      alert('Debes iniciar sesión para dar me gusta a una reseña');
      return;
    }

    // Optimistic UI update
    setReviews((prev) =>
      prev.map((rev) => {
        if (rev.id === reviewId) {
          const liked = !rev.isLiked;
          return {
            ...rev,
            isLiked: liked,
            likeCount: liked ? rev.likeCount + 1 : Math.max(0, rev.likeCount - 1),
          };
        }
        return rev;
      }),
    );

    try {
      const token = localStorage.getItem('crithit_token');
      await fetch(`${API_URL}/reviews/${reviewId}/like`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      console.error(err);
      fetchReviews(); // Revert on failure
    }
  };

  const toggleSpoiler = (id: string) => {
    setRevealedSpoilers((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header Banner */}
      <FadeIn className="relative rounded-3xl overflow-hidden glass-panel p-6 sm:p-10 border border-brand-border/60">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-surface border border-brand-border/80 text-xs font-semibold text-brand-secondary shadow-glow-secondary">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Feed Comunitario de Reseñas</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Opiniones y Críticas de{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-secondary via-brand-primary to-brand-tertiary">
              CritHit
            </span>
          </h1>

          <p className="text-brand-muted text-sm sm:text-base max-w-2xl leading-relaxed">
            Descubre qué opina la comunidad y los críticos certificados sobre los títulos del catálogo.
            Filtradas con el rigor del sistema de puntuación 0 a 100.
          </p>
        </div>
      </FadeIn>

      {/* Control Bar: Search & Filters */}
      <div className="glass-panel p-4 rounded-2xl border border-brand-border/60 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por juego, título o autor..."
            className="w-full bg-brand-card/80 border border-brand-border rounded-xl pl-10 pr-4 py-2 text-sm text-brand-text placeholder-brand-muted focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
          />
          <Search className="w-4 h-4 text-brand-muted absolute left-3.5 top-3" />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-2.5 text-xs text-brand-muted hover:text-white px-1.5 py-0.5 rounded bg-brand-surface"
            >
              ✕
            </button>
          )}
        </div>

        {/* Sort & Critic Toggle */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex items-center bg-brand-card/80 border border-brand-border rounded-xl p-1 text-xs">
            <button
              onClick={() => {
                setSort('popular');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                sort === 'popular'
                  ? 'bg-brand-primary text-white shadow-glow-primary'
                  : 'text-brand-muted hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              Populares
            </button>
            <button
              onClick={() => {
                setSort('recent');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                sort === 'recent'
                  ? 'bg-brand-primary text-white shadow-glow-primary'
                  : 'text-brand-muted hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Recientes
            </button>
            <button
              onClick={() => {
                setSort('highest');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                sort === 'highest'
                  ? 'bg-brand-primary text-white shadow-glow-primary'
                  : 'text-brand-muted hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Más Altas
            </button>
          </div>

          <button
            onClick={() => {
              setCriticOnly(!criticOnly);
              setPage(1);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
              criticOnly
                ? 'bg-brand-secondary/15 border-brand-secondary text-brand-secondary shadow-glow-secondary'
                : 'bg-brand-card/80 border-brand-border text-brand-muted hover:text-white hover:border-brand-border/80'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            Solo Críticos
          </button>
        </div>
      </div>

      {/* Review Count Info */}
      <div className="flex items-center justify-between text-xs text-brand-muted px-1">
        <span>
          Mostrando <strong className="text-white">{reviews.length}</strong> de{' '}
          <strong className="text-white">{totalCount}</strong> reseñas
        </span>
        {totalPages > 1 && (
          <span>
            Página {page} de {totalPages}
          </span>
        )}
      </div>

      {/* Reviews Feed */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <ActivityItemSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="glass-panel p-8 rounded-2xl border border-rose-500/30 text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto" />
          <p className="text-sm text-rose-300">{error}</p>
          <button
            onClick={fetchReviews}
            className="px-4 py-2 rounded-xl bg-brand-surface text-xs font-bold text-white hover:bg-brand-card border border-brand-border"
          >
            Reintentar
          </button>
        </div>
      ) : reviews.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border border-brand-border/60 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-surface border border-brand-border flex items-center justify-center mx-auto text-brand-muted">
            <MessageSquare className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">No se encontraron reseñas</h3>
            <p className="text-xs text-brand-muted max-w-sm mx-auto">
              {search || criticOnly
                ? 'Prueba ajustando los filtros de búsqueda o eliminando la restricción de críticos.'
                : 'Aún no hay reseñas publicadas. ¡Sé el primero en calificar un juego del catálogo!'}
            </p>
          </div>
          <Link
            href="/games"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-primary hover:bg-brand-primary-hover shadow-glow-primary transition-all"
          >
            <Gamepad2 className="w-4 h-4" />
            Explorar Catálogo de Videojuegos
          </Link>
        </div>
      ) : (
        <StaggerContainer className="space-y-4">
          {reviews.map((rev) => {
            const isSpoilerHidden = rev.containsSpoilers && !revealedSpoilers[rev.id];

            return (
              <StaggerItem key={rev.id}>
                <div className="glass-panel p-5 rounded-2xl border border-brand-border/60 hover:border-brand-border transition-all duration-200 space-y-4">
                  {/* Top bar: Author + Game Info + Score */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-brand-border/40">
                    {/* User Info */}
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/profile/${rev.user?.username}`}
                        className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-white font-bold text-sm uppercase overflow-hidden shadow-sm flex-shrink-0"
                      >
                        {rev.user?.avatarUrl ? (
                          <img
                            src={rev.user.avatarUrl}
                            alt={rev.user.displayName || rev.user.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          (rev.user?.displayName || rev.user?.username || 'U')[0]
                        )}
                      </Link>

                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Link
                            href={`/profile/${rev.user?.username}`}
                            className="text-sm font-bold text-white hover:text-brand-secondary transition-colors"
                          >
                            {rev.user?.displayName || rev.user?.username}
                          </Link>

                          {rev.isCriticReview && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-brand-secondary/15 text-brand-secondary border border-brand-secondary/30 text-[10px] font-bold">
                              <Award className="w-3 h-3" />
                              {rev.criticTier ? `${rev.criticTier} Critic` : 'Crítico'}
                            </span>
                          )}
                        </div>

                        <span className="text-[11px] text-brand-muted">
                          @{rev.user?.username} •{' '}
                          {new Date(rev.createdAt).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Game Link + Score */}
                    {rev.game && (
                      <div className="flex items-center justify-between sm:justify-end gap-3 self-end sm:self-center w-full sm:w-auto">
                        <Link
                          href={`/games/${rev.game.slug}`}
                          className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl bg-brand-surface/60 hover:bg-brand-surface border border-brand-border/50 transition-all group max-w-[240px]"
                        >
                          {rev.game.coverUrl ? (
                            <img
                              src={rev.game.coverUrl}
                              alt={rev.game.name}
                              className="w-8 h-10 rounded-lg object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-10 rounded-lg bg-brand-card flex items-center justify-center text-brand-muted">
                              <Gamepad2 className="w-4 h-4" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="block text-xs font-bold text-white group-hover:text-brand-secondary truncate">
                              {rev.game.name}
                            </span>
                            {rev.game.firstReleaseDate && (
                              <span className="text-[10px] text-brand-muted">
                                {new Date(rev.game.firstReleaseDate).getFullYear()}
                              </span>
                            )}
                          </div>
                        </Link>

                        <ScoreBadge score={rev.score} size="md" showLabel />
                      </div>
                    )}
                  </div>

                  {/* Review Content */}
                  <div className="space-y-2">
                    {rev.title && (
                      <h4 className="text-base font-bold text-white leading-snug">
                        {rev.title}
                      </h4>
                    )}

                    {rev.containsSpoilers && isSpoilerHidden ? (
                      <div
                        onClick={() => toggleSpoiler(rev.id)}
                        className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between cursor-pointer hover:bg-amber-500/15 transition-colors"
                      >
                        <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
                          <AlertTriangle className="w-4 h-4" />
                          <span>Esta reseña contiene spoilers de la trama.</span>
                        </div>
                        <span className="text-xs text-amber-400 font-bold underline">
                          Revelar
                        </span>
                      </div>
                    ) : (
                      rev.body && (
                        <p className="text-sm text-brand-muted leading-relaxed whitespace-pre-line">
                          {rev.body}
                        </p>
                      )
                    )}
                  </div>

                  {/* Footer Meta & Actions */}
                  <div className="pt-3 border-t border-brand-border/30 flex items-center justify-between text-xs text-brand-muted">
                    <div className="flex items-center gap-3 flex-wrap">
                      {rev.playedHours !== null && rev.playedHours !== undefined && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-brand-secondary" />
                          {rev.playedHours}h jugadas
                        </span>
                      )}

                      {rev.platform && (
                        <span className="px-2 py-0.5 rounded bg-brand-surface text-brand-text font-mono text-[10px]">
                          {rev.platform}
                        </span>
                      )}

                      {rev.recommends !== null && rev.recommends !== undefined && (
                        <span
                          className={`flex items-center gap-1 font-semibold ${
                            rev.recommends ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          <ThumbsUp
                            className={`w-3.5 h-3.5 ${
                              !rev.recommends ? 'rotate-180 text-rose-400' : ''
                            }`}
                          />
                          {rev.recommends ? 'Recomendado' : 'No recomendado'}
                        </span>
                      )}
                    </div>

                    <MotionLikeButton
                      liked={rev.isLiked}
                      count={rev.likeCount}
                      onToggle={() => handleLikeToggle(rev.id)}
                      size="sm"
                    />
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-4 py-2 rounded-xl bg-brand-card hover:bg-brand-surface border border-brand-border disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold text-white transition-colors flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </button>

          <span className="text-xs font-medium text-brand-muted">
            Página <strong className="text-white">{page}</strong> de{' '}
            <strong className="text-white">{totalPages}</strong>
          </span>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-4 py-2 rounded-xl bg-brand-card hover:bg-brand-surface border border-brand-border disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold text-white transition-colors flex items-center gap-1"
          >
            Siguiente
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
