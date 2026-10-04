'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Send,
  CornerDownRight,
  Trash2,
  Reply,
  Award,
  Loader2,
  AlertCircle,
  X,
} from 'lucide-react';

export interface CommentUser {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  role: string;
  criticTier: string | null;
  criticBadge: string | null;
}

export interface ReviewCommentItem {
  id: string;
  userId: string;
  reviewId: string;
  body: string;
  parentId?: string | null;
  createdAt: string;
  updatedAt: string;
  user: CommentUser;
  replies?: ReviewCommentItem[];
}

export interface ReviewCommentsSectionProps {
  reviewId: string;
  initialCount?: number;
  onCountChange?: (newCount: number) => void;
}

export const ReviewCommentsSection: React.FC<ReviewCommentsSectionProps> = ({
  reviewId,
  initialCount = 0,
  onCountChange,
}) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<ReviewCommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New comment input
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Active reply target
  const [replyingTo, setReplyingTo] = useState<{
    id: string;
    username: string;
    displayName: string;
  } | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  // Deleting state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res: any = await apiClient(`/reviews/${reviewId}/comments`);
      const items = Array.isArray(res) ? res : res?.data || [];
      setComments(items);

      // Calcular conteo total (padres + hijos)
      let total = 0;
      const countRecursive = (list: ReviewCommentItem[]) => {
        total += list.length;
        list.forEach((c) => {
          if (c.replies && c.replies.length > 0) countRecursive(c.replies);
        });
      };
      countRecursive(items);
      if (onCountChange) onCountChange(total);
    } catch (err: any) {
      console.error(err);
      setError('No se pudieron cargar los comentarios.');
    } finally {
      setLoading(false);
    }
  }, [reviewId, onCountChange]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || submitting) return;

    if (!user) {
      setError('Debes iniciar sesión para publicar un comentario.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const created: ReviewCommentItem = await apiClient(`/reviews/${reviewId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ body: commentText.trim() }),
      });

      setComments((prev) => [...prev, { ...created, replies: [] }]);
      setCommentText('');
      if (onCountChange) onCountChange((comments.length || initialCount) + 1);
    } catch (err: any) {
      setError(err.message || 'Error al enviar el comentario.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!replyText.trim() || submittingReply) return;

    if (!user) {
      setError('Debes iniciar sesión para responder.');
      return;
    }

    try {
      setSubmittingReply(true);
      setError(null);
      const created: ReviewCommentItem = await apiClient(`/reviews/${reviewId}/comments`, {
        method: 'POST',
        body: JSON.stringify({
          body: replyText.trim(),
          parentId,
        }),
      });

      // Insertar recursivamente en el árbol
      setComments((prev) =>
        prev.map((c) => {
          if (c.id === parentId) {
            return {
              ...c,
              replies: [...(c.replies || []), created],
            };
          }
          return c;
        }),
      );

      setReplyText('');
      setReplyingTo(null);
      if (onCountChange) onCountChange((comments.length || initialCount) + 1);
    } catch (err: any) {
      setError(err.message || 'Error al enviar la respuesta.');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      setDeletingId(commentId);
      await apiClient(`/reviews/comments/${commentId}`, {
        method: 'DELETE',
      });

      // Remover recursivamente del árbol
      setComments((prev) =>
        prev
          .filter((c) => c.id !== commentId)
          .map((c) => ({
            ...c,
            replies: (c.replies || []).filter((r) => r.id !== commentId),
          })),
      );
    } catch (err: any) {
      setError('No se pudo eliminar el comentario.');
    } finally {
      setDeletingId(null);
    }
  };

  const formatRelativeTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'hace un momento';
      if (diffMins < 60) return `hace ${diffMins} min`;
      if (diffHours < 24) return `hace ${diffHours} h`;
      if (diffDays < 7) return `hace ${diffDays} d`;

      return new Intl.DateTimeFormat('es-ES', {
        day: 'numeric',
        month: 'short',
      }).format(date);
    } catch {
      return '';
    }
  };

  return (
    <div className="pt-4 mt-4 border-t border-brand-border/40 space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between text-xs font-semibold text-brand-text">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-brand-secondary" />
          <span>Hilo de Debate</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-brand-surface border border-brand-border text-brand-secondary">
            {comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)}
          </span>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="p-1 hover:bg-rose-500/20 rounded transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Formulario para nuevo comentario */}
      {user ? (
        <form onSubmit={handleSubmitComment} className="flex gap-3 items-start">
          <div className="w-8 h-8 rounded-lg overflow-hidden bg-brand-surface border border-brand-border/70 flex items-center justify-center text-xs font-bold text-brand-muted flex-shrink-0">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
            ) : (
              (user.displayName || user.username || 'U')[0].toUpperCase()
            )}
          </div>
          <div className="flex-1 space-y-2">
            <div className="relative">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Escribe tu opinión o plantea una pregunta sobre esta reseña..."
                rows={2}
                maxLength={1000}
                className="w-full px-3.5 py-2.5 rounded-xl bg-brand-surface/70 border border-brand-border/60 text-xs sm:text-sm text-brand-text placeholder-brand-muted/70 focus:outline-none focus:border-brand-secondary/70 focus:ring-1 focus:ring-brand-secondary/40 transition-all resize-none"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-brand-muted">
                {commentText.length}/1000
              </span>
              <button
                type="submit"
                disabled={submitting || !commentText.trim()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-brand-secondary hover:bg-brand-secondary/90 disabled:opacity-50 disabled:pointer-events-none text-brand-bg transition-colors shadow-glow-secondary"
              >
                {submitting ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Send className="w-3 h-3" />
                )}
                <span>Comentar</span>
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="p-3.5 rounded-xl bg-brand-surface/40 border border-brand-border/60 text-xs text-brand-muted flex items-center justify-between gap-3">
          <span>Inicia sesión para unirte al debate de esta reseña.</span>
          <Link
            href="/login"
            className="px-3 py-1.5 rounded-lg bg-brand-surface border border-brand-border hover:border-brand-secondary/50 text-xs font-bold text-brand-text hover:text-brand-secondary transition-colors"
          >
            Iniciar sesión
          </Link>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="py-6 flex flex-col items-center justify-center gap-2 text-brand-muted">
          <Loader2 className="w-5 h-5 animate-spin text-brand-secondary" />
          <span className="text-xs">Cargando comentarios...</span>
        </div>
      ) : comments.length === 0 ? (
        <div className="py-6 text-center rounded-xl bg-brand-surface/30 border border-brand-border/40">
          <MessageSquare className="w-7 h-7 text-brand-muted/40 mx-auto mb-2" />
          <p className="text-xs font-semibold text-brand-text">Aún no hay comentarios</p>
          <p className="text-[11px] text-brand-muted mt-0.5">
            Sé el primero en compartir tu punto de vista.
          </p>
        </div>
      ) : (
        /* Lista de comentarios e hilos */
        <div className="space-y-3 pt-2">
          <AnimatePresence initial={false}>
            {comments.map((comment) => {
              const isCommentAuthor = user?.id === comment.userId;
              const isCritic =
                comment.user?.role === 'CRITIC' || Boolean(comment.user?.criticTier);

              return (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-3.5 rounded-xl bg-brand-bg/60 border border-brand-border/50 space-y-2.5 transition-colors hover:border-brand-border/80"
                >
                  {/* Cabecera del comentario */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <Link
                        href={`/profile/${comment.user?.username}`}
                        className="w-7 h-7 rounded-lg overflow-hidden bg-brand-surface border border-brand-border flex items-center justify-center text-[10px] font-bold text-brand-muted flex-shrink-0"
                      >
                        {comment.user?.avatarUrl ? (
                          <img
                            src={comment.user.avatarUrl}
                            alt={comment.user.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          (comment.user?.displayName || comment.user?.username || 'U')[0].toUpperCase()
                        )}
                      </Link>

                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Link
                            href={`/profile/${comment.user?.username}`}
                            className="text-xs font-bold text-brand-text hover:text-brand-secondary transition-colors"
                          >
                            {comment.user?.displayName || comment.user?.username}
                          </Link>

                          {isCritic && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-violet-500/15 text-violet-300 border border-violet-500/30 text-[9px] font-bold">
                              <Award className="w-2.5 h-2.5" />
                              <span>{comment.user?.criticTier || 'Crítico'}</span>
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-brand-muted">
                          @{comment.user?.username} · {formatRelativeTime(comment.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Acciones autor */}
                    {isCommentAuthor && (
                      <button
                        onClick={() => handleDelete(comment.id)}
                        disabled={deletingId === comment.id}
                        title="Eliminar comentario"
                        className="p-1 rounded text-brand-muted hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      >
                        {deletingId === comment.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Cuerpo */}
                  <p className="text-xs sm:text-sm text-brand-text/90 leading-relaxed pl-9">
                    {comment.body}
                  </p>

                  {/* Botón responder */}
                  <div className="pl-9 flex items-center gap-3 pt-1">
                    <button
                      onClick={() => {
                        if (!user) {
                          setError('Inicia sesión para responder.');
                          return;
                        }
                        setReplyingTo({
                          id: comment.id,
                          username: comment.user?.username,
                          displayName: comment.user?.displayName || comment.user?.username,
                        });
                        setReplyText(`@${comment.user?.username} `);
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-muted hover:text-brand-secondary transition-colors"
                    >
                      <Reply className="w-3 h-3" />
                      <span>Responder</span>
                    </button>
                  </div>

                  {/* Input de respuesta inline */}
                  {replyingTo?.id === comment.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2 pl-9 pt-2 border-t border-brand-border/40"
                    >
                      <div className="flex items-center justify-between text-[11px] text-brand-secondary mb-1">
                        <span>Respondiendo a @{replyingTo.username}</span>
                        <button
                          onClick={() => {
                            setReplyingTo(null);
                            setReplyText('');
                          }}
                          className="hover:underline text-brand-muted"
                        >
                          Cancelar
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder={`Escribe una respuesta a @${replyingTo.username}...`}
                          className="flex-1 px-3 py-1.5 rounded-lg bg-brand-surface border border-brand-border/70 text-xs text-brand-text placeholder-brand-muted/70 focus:outline-none focus:border-brand-secondary"
                        />
                        <button
                          onClick={() => handleSubmitReply(comment.id)}
                          disabled={submittingReply || !replyText.trim()}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-brand-secondary hover:bg-brand-secondary/90 disabled:opacity-50 text-brand-bg transition-colors flex items-center gap-1"
                        >
                          {submittingReply ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Send className="w-3 h-3" />
                          )}
                          <span>Enviar</span>
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Respuestas anidadas (Replies) */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="pl-6 pt-2 border-l-2 border-brand-border/40 ml-4 space-y-2.5">
                      {comment.replies.map((reply) => {
                        const isReplyAuthor = user?.id === reply.userId;
                        const isReplyCritic =
                          reply.user?.role === 'CRITIC' || Boolean(reply.user?.criticTier);

                        return (
                          <div
                            key={reply.id}
                            className="p-3 rounded-lg bg-brand-surface/40 border border-brand-border/40 space-y-1.5"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <CornerDownRight className="w-3 h-3 text-brand-muted/50" />
                                <Link
                                  href={`/profile/${reply.user?.username}`}
                                  className="w-5 h-5 rounded-md overflow-hidden bg-brand-surface border border-brand-border flex items-center justify-center text-[9px] font-bold text-brand-muted flex-shrink-0"
                                >
                                  {reply.user?.avatarUrl ? (
                                    <img
                                      src={reply.user.avatarUrl}
                                      alt={reply.user.username}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    (reply.user?.displayName || reply.user?.username || 'U')[0].toUpperCase()
                                  )}
                                </Link>
                                <Link
                                  href={`/profile/${reply.user?.username}`}
                                  className="text-xs font-bold text-brand-text hover:text-brand-secondary transition-colors"
                                >
                                  {reply.user?.displayName || reply.user?.username}
                                </Link>
                                {isReplyCritic && (
                                  <span className="px-1 py-0.2 rounded bg-violet-500/15 text-violet-300 text-[8px] font-bold">
                                    Crítico
                                  </span>
                                )}
                                <span className="text-[10px] text-brand-muted">
                                  · {formatRelativeTime(reply.createdAt)}
                                </span>
                              </div>

                              {isReplyAuthor && (
                                <button
                                  onClick={() => handleDelete(reply.id)}
                                  disabled={deletingId === reply.id}
                                  className="p-1 rounded text-brand-muted hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                >
                                  {deletingId === reply.id ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-3 h-3" />
                                  )}
                                </button>
                              )}
                            </div>
                            <p className="text-xs text-brand-text/90 leading-relaxed pl-5">
                              {reply.body}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
