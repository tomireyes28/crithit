'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Heart,
  Layers,
  Calendar,
  Award,
  Hash,
  Lock,
  Trash2,
  MessageSquare,
  Share2,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api';
import { ScoreBadge } from '@/components/ui/ScoreBadge';

interface ListEntryItem {
  id: string;
  listId: string;
  gameId: string;
  position: number;
  note: string | null;
  game: {
    id: string;
    slug: string;
    name: string;
    coverUrl: string | null;
    backdropUrl: string | null;
    firstReleaseDate: string | null;
    communityScore: number | null;
    criticScore: number | null;
    metacriticScore: number | null;
    genres: Array<{ id: string; name: string; slug: string }>;
    platforms: Array<{ id: string; name: string; abbreviation: string | null }>;
  };
}

interface ListDetailData {
  id: string;
  userId: string;
  user: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
    role: string;
    criticTier: string | null;
    bio: string | null;
  };
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  isRanked: boolean;
  isPublic: boolean;
  tags: string[];
  entryCount: number;
  likeCount: number;
  hasLiked: boolean;
  entries: ListEntryItem[];
  createdAt: string;
  updatedAt: string;
}

export default function ListDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const listId = params.id as string;

  const [list, setList] = useState<ListDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiking, setIsLiking] = useState(false);
  const [removingGameId, setRemovingGameId] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const fetchListDetail = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data: any = await apiClient(`/lists/${listId}`);
      setList(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar la lista');
    } finally {
      setIsLoading(false);
    }
  }, [listId]);

  useEffect(() => {
    fetchListDetail();
  }, [fetchListDetail]);

  const handleToggleLike = async () => {
    if (!user) {
      router.push(`/login?redirect=/lists/${listId}`);
      return;
    }
    if (!list || isLiking) return;

    setIsLiking(true);
    // Optimistic update
    const previousState = { hasLiked: list.hasLiked, likeCount: list.likeCount };
    setList({
      ...list,
      hasLiked: !list.hasLiked,
      likeCount: list.hasLiked ? Math.max(0, list.likeCount - 1) : list.likeCount + 1,
    });

    try {
      const res: any = await apiClient(`/lists/${listId}/like`, { method: 'POST' });
      setList((prev) => (prev ? { ...prev, hasLiked: res.hasLiked, likeCount: res.likeCount } : null));
    } catch {
      // Revertir optimismo
      setList((prev) => (prev ? { ...prev, ...previousState } : null));
    } finally {
      setIsLiking(false);
    }
  };

  const handleRemoveEntry = async (gameId: string) => {
    if (!confirm('¿Estás seguro de que deseas remover este juego de la lista?')) return;
    setRemovingGameId(gameId);
    try {
      await apiClient(`/lists/${listId}/entries/${gameId}`, { method: 'DELETE' });
      setList((prev) => {
        if (!prev) return null;
        const newEntries = prev.entries.filter((e) => e.gameId !== gameId);
        return {
          ...prev,
          entryCount: Math.max(0, prev.entryCount - 1),
          entries: newEntries,
        };
      });
    } catch (err: any) {
      alert(err.message || 'Error al remover juego');
    } finally {
      setRemovingGameId(null);
    }
  };

  const handleDeleteList = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta lista permanentemente?')) return;
    try {
      await apiClient(`/lists/${listId}`, { method: 'DELETE' });
      router.push('/lists');
    } catch (err: any) {
      alert(err.message || 'Error al eliminar la lista');
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center text-brand-muted">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-brand-accent" />
          <span className="text-sm">Cargando lista...</span>
        </div>
      </div>
    );
  }

  if (error || !list) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-2xl bg-brand-surface border border-brand-border text-center">
          <Layers className="w-12 h-12 text-rose-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-white mb-1">No pudimos cargar la lista</h2>
          <p className="text-xs text-brand-muted mb-6">{error || 'La lista no existe o es privada.'}</p>
          <Link
            href="/lists"
            className="px-4 py-2 rounded-xl bg-brand-accent text-brand-bg font-bold text-xs shadow-md"
          >
            ← Volver a Explorar Listas
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === list.userId;

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text pb-24">
      {/* Header Container */}
      <div className="border-b border-brand-border/60 bg-gradient-to-b from-brand-surface/90 via-brand-bg to-brand-bg pt-8 pb-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-muted mb-6">
            <Link href="/lists" className="hover:text-brand-accent transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Listas</span>
            </Link>
            <span>/</span>
            <span className="text-brand-text truncate">{list.title}</span>
          </div>

          {/* List Title & Badges */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {list.isRanked && (
                <span className="px-2.5 py-0.5 rounded-md bg-amber-500/90 text-brand-bg text-xs font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
                  <Hash className="w-3 h-3 stroke-[3]" /> Ranked
                </span>
              )}
              {!list.isPublic && (
                <span className="px-2.5 py-0.5 rounded-md bg-purple-500/80 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Privada
                </span>
              )}
              <span className="px-2.5 py-0.5 rounded-md bg-brand-surface border border-brand-border text-xs font-mono text-brand-muted">
                {list.entryCount} {list.entryCount === 1 ? 'juego' : 'juegos'}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white font-sans leading-tight">
              {list.title}
            </h1>

            {/* Creador y Acciones */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-3">
                <Link
                  href={`/profile/${list.user.username}`}
                  className="w-10 h-10 rounded-full bg-brand-primary/30 border border-brand-primary/50 overflow-hidden relative flex items-center justify-center text-sm font-bold text-brand-secondary hover:scale-105 transition-transform"
                >
                  {list.user.avatarUrl ? (
                    <Image
                      src={list.user.avatarUrl}
                      alt={list.user.displayName}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    list.user.displayName.charAt(0).toUpperCase()
                  )}
                </Link>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-brand-muted">Curada por</span>
                    <Link
                      href={`/profile/${list.user.username}`}
                      className="text-xs font-bold text-white hover:text-brand-accent transition-colors flex items-center gap-1"
                    >
                      <span>{list.user.displayName}</span>
                      {list.user.criticTier && (
                        <Award className="w-3.5 h-3.5 text-amber-400" />
                      )}
                    </Link>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-brand-muted mt-0.5">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {new Date(list.createdAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Botones de acción: Like, Compartir y Eliminar */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleLike}
                  disabled={isLiking}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                    list.hasLiked
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/60 shadow-lg shadow-rose-500/10'
                      : 'bg-brand-surface hover:bg-brand-bg text-brand-muted hover:text-rose-400 border-brand-border'
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 ${list.hasLiked ? 'fill-rose-500' : ''}`}
                  />
                  <span>{list.likeCount}</span>
                </button>

                <button
                  onClick={handleShare}
                  className="p-2 rounded-xl bg-brand-surface hover:bg-brand-bg border border-brand-border text-brand-muted hover:text-white transition-colors"
                  title="Copiar enlace"
                >
                  <Share2 className="w-4 h-4" />
                </button>

                {isOwner && (
                  <button
                    onClick={handleDeleteList}
                    className="p-2 rounded-xl bg-brand-surface hover:bg-rose-500/10 border border-brand-border hover:border-rose-500/40 text-brand-muted hover:text-rose-400 transition-colors"
                    title="Eliminar lista"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Copied link toast */}
            {copiedLink && (
              <div className="inline-block text-[11px] font-semibold text-brand-accent animate-fade-in">
                ¡Enlace copiado al portapapeles! 📋
              </div>
            )}

            {/* Descripción */}
            {list.description && (
              <div className="pt-2 text-sm text-brand-muted leading-relaxed max-w-3xl whitespace-pre-line border-t border-brand-border/40">
                {list.description}
              </div>
            )}

            {/* Tags */}
            {list.tags && list.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {list.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 rounded-lg bg-brand-surface text-xs font-mono text-brand-muted border border-brand-border/60"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Videojuegos de la Lista */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {list.entries && list.entries.length > 0 ? (
          <div className="space-y-4">
            {list.entries.map((entry, idx) => {
              const releaseYear = entry.game.firstReleaseDate
                ? new Date(entry.game.firstReleaseDate).getFullYear()
                : null;
              const isRemoving = removingGameId === entry.gameId;

              return (
                <div
                  key={entry.id}
                  className="group p-4 sm:p-5 rounded-2xl bg-brand-surface/60 hover:bg-brand-surface border border-brand-border/60 hover:border-brand-accent/30 transition-all duration-200 flex flex-col sm:flex-row items-start gap-4 sm:gap-6 shadow-sm"
                >
                  {/* Número de ranking o índice */}
                  <div className="flex sm:flex-col items-center justify-center gap-2 sm:gap-0 sm:w-10 flex-shrink-0">
                    <span
                      className={`font-mono font-black text-lg sm:text-2xl ${
                        list.isRanked ? 'text-brand-accent' : 'text-brand-muted/40'
                      }`}
                    >
                      {list.isRanked ? `#${entry.position || idx + 1}` : `${idx + 1}`}
                    </span>
                  </div>

                  {/* Carátula / Poster del juego */}
                  <Link
                    href={`/games/${entry.game.slug}`}
                    className="relative w-20 sm:w-24 aspect-[3/4] rounded-xl overflow-hidden bg-brand-bg border border-brand-border/50 shadow-md group-hover:scale-102 transition-transform duration-200 flex-shrink-0"
                  >
                    {entry.game.coverUrl ? (
                      <Image
                        src={entry.game.coverUrl}
                        alt={entry.game.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 80px, 96px"
                      />
                    ) : (
                      <div className="w-full h-full bg-brand-surface flex items-center justify-center text-brand-muted">
                        🎮
                      </div>
                    )}
                  </Link>

                  {/* Contenido e Información del Juego */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch gap-3">
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <Link
                          href={`/games/${entry.game.slug}`}
                          className="font-black text-base sm:text-xl text-white group-hover:text-brand-accent transition-colors truncate"
                        >
                          {entry.game.name}
                        </Link>

                        {/* Scores */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {entry.game.metacriticScore && (
                            <span
                              className="px-2 py-0.5 rounded font-mono font-black text-xs bg-brand-bg text-amber-300 border border-amber-400/30"
                              title="Metacritic Score"
                            >
                              MC {entry.game.metacriticScore}
                            </span>
                          )}
                          <ScoreBadge
                            score={entry.game.communityScore}
                            size="sm"
                          />
                        </div>
                      </div>

                      {/* Metadatos: año, géneros, plataformas */}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-brand-muted mt-1">
                        {releaseYear && <span className="font-mono">{releaseYear}</span>}
                        {entry.game.genres && entry.game.genres.length > 0 && (
                          <>
                            <span>•</span>
                            <span>{entry.game.genres.slice(0, 2).map((g) => g.name).join(', ')}</span>
                          </>
                        )}
                        {entry.game.platforms && entry.game.platforms.length > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-[11px] text-brand-muted/80">
                              {entry.game.platforms.slice(0, 3).map((p) => p.abbreviation || p.name).join(', ')}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Nota personalizada del autor */}
                    {entry.note ? (
                      <div className="p-3 rounded-xl bg-brand-bg/70 border border-brand-border/40 text-xs text-brand-text/90 italic flex items-start gap-2.5">
                        <MessageSquare className="w-4 h-4 text-brand-accent flex-shrink-0 mt-0.5 not-italic" />
                        <span className="leading-relaxed whitespace-pre-line not-italic text-brand-text">
                          {entry.note}
                        </span>
                      </div>
                    ) : (
                      isOwner && (
                        <div className="text-[11px] text-brand-muted/50 italic">
                          Sin nota añadida
                        </div>
                      )
                    )}

                    {/* Acciones de propietario (eliminar entrada) */}
                    {isOwner && (
                      <div className="self-end pt-1">
                        <button
                          disabled={isRemoving}
                          onClick={() => handleRemoveEntry(entry.gameId)}
                          className="text-[11px] text-brand-muted hover:text-rose-400 transition-colors flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Remover de la lista</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 px-4 bg-brand-surface/30 rounded-2xl border border-dashed border-brand-border/60">
            <Layers className="w-12 h-12 text-brand-muted/40 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">
              Esta lista aún no tiene videojuegos
            </h3>
            <p className="text-xs text-brand-muted max-w-sm mx-auto mb-5">
              Explora el catálogo de juegos y guárdalos en esta lista usando el botón de acciones en cada ficha.
            </p>
            <Link
              href="/games"
              className="px-4 py-2 rounded-xl bg-brand-accent text-brand-bg font-bold text-xs shadow-md inline-block"
            >
              Explorar Catálogo de Juegos
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
