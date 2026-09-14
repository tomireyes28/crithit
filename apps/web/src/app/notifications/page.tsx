'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Bell,
  CheckCheck,
  UserPlus,
  Heart,
  Layers,
  Sparkles,
  Trash2,
  Check,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { NotificationItem } from '@/components/notifications/NotificationDropdown';

interface NotificationsResponse {
  notifications: NotificationItem[];
  total: number;
  unreadCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function NotificationsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchNotifications = async (targetPage = 1, currentFilter = filter) => {
    if (!user) return;
    setIsLoading(true);
    try {
      const unreadParam = currentFilter === 'unread' ? '&unreadOnly=true' : '';
      const res = await apiClient<NotificationsResponse>(
        `/notifications?page=${targetPage}&limit=15${unreadParam}`
      );
      setNotifications(res.notifications || []);
      setTotalPages(res.totalPages || 1);
      setPage(res.page || 1);
      setUnreadCount(res.unreadCount || 0);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications(1, filter);
    }
  }, [user, filter]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-brand-surface/80 border border-brand-border flex items-center justify-center text-brand-muted mb-4 shadow-lg">
          <Bell className="w-8 h-8 text-brand-primary opacity-80" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Centro de Notificaciones</h1>
        <p className="text-brand-muted text-sm max-w-md mb-6">
          Inicia sesión en CritHit para enterarte cuando otros jugadores te sigan o interactúen con tus reseñas y listas.
        </p>
        <Link
          href="/login"
          className="px-6 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-secondary text-brand-bg font-bold text-sm transition-all shadow-md"
        >
          Iniciar Sesión
        </Link>
      </div>
    );
  }

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await apiClient(`/notifications/${id}/read`, { method: 'PUT' });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await apiClient('/notifications/read-all', { method: 'PUT' });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await apiClient(`/notifications/${id}`, { method: 'DELETE' });
      const target = notifications.find((n) => n.id === id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (target && !target.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const handleItemClick = (item: NotificationItem) => {
    if (!item.isRead) {
      handleMarkAsRead(item.id);
    }

    if (item.type === 'NEW_FOLLOWER' && item.actor?.username) {
      router.push(`/profile/${item.actor.username}`);
    } else if (item.type === 'LIST_LIKE' && item.entityId) {
      router.push(`/lists/${item.entityId}`);
    } else if (item.actor?.username) {
      router.push(`/profile/${item.actor.username}`);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTypeIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'NEW_FOLLOWER':
        return <UserPlus className="w-4 h-4 text-emerald-400" />;
      case 'REVIEW_LIKE':
        return <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />;
      case 'LIST_LIKE':
        return <Layers className="w-4 h-4 text-purple-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-brand-primary" />;
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Cabecera Principal */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-brand-border/60">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-brand-surface border border-brand-border text-brand-primary shadow-sm">
                <Bell className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Notificaciones
                </h1>
                <p className="text-xs sm:text-sm text-brand-muted mt-0.5">
                  Interacciones de la comunidad con tu perfil, listas y reseñas
                </p>
              </div>
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-surface hover:bg-brand-surface/80 border border-brand-border text-xs font-bold text-white hover:text-brand-primary transition-all self-start sm:self-auto shadow-sm"
            >
              <CheckCheck className="w-4 h-4 text-brand-primary" />
              Marcar todas como leídas
            </button>
          )}
        </div>

        {/* Pestañas de Filtro */}
        <div className="flex items-center gap-2 mt-6 mb-6">
          <button
            onClick={() => {
              setFilter('all');
              setPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              filter === 'all'
                ? 'bg-brand-primary text-brand-bg shadow-md shadow-brand-primary/20'
                : 'bg-brand-surface/60 text-brand-muted hover:text-white border border-brand-border/60'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => {
              setFilter('unread');
              setPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              filter === 'unread'
                ? 'bg-brand-primary text-brand-bg shadow-md shadow-brand-primary/20'
                : 'bg-brand-surface/60 text-brand-muted hover:text-white border border-brand-border/60'
            }`}
          >
            No leídas
            {unreadCount > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  filter === 'unread'
                    ? 'bg-brand-bg text-brand-primary'
                    : 'bg-brand-primary text-brand-bg'
                }`}
              >
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Listado de Notificaciones */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-brand-muted">Cargando tus notificaciones...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-12 rounded-3xl bg-brand-surface/40 border border-brand-border/50 text-center flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-2xl bg-brand-surface border border-brand-border/80 flex items-center justify-center text-brand-muted mb-4 shadow-md">
                <Bell className="w-7 h-7 opacity-50" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">
                {filter === 'unread' ? 'No tienes notificaciones pendientes' : 'Bandeja de notificaciones vacía'}
              </h3>
              <p className="text-xs text-brand-muted max-w-sm">
                {filter === 'unread'
                  ? 'Estás al día con todas las novedades de la comunidad de CritHit.'
                  : 'Cuando otros gamers te sigan o interactúen con tus reseñas y listas, lo verás aquí.'}
              </p>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`group p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                  !item.isRead
                    ? 'bg-brand-surface/90 border-brand-primary/40 shadow-sm shadow-brand-primary/5 hover:border-brand-primary/60'
                    : 'bg-brand-surface/40 border-brand-border/60 hover:bg-brand-surface/70 hover:border-brand-border'
                }`}
              >
                {/* Lado Izquierdo: Avatar + Info */}
                <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                  {/* Avatar con sub-icono */}
                  <div className="relative flex-shrink-0">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-brand-surface border border-brand-border overflow-hidden relative flex items-center justify-center text-sm font-bold text-brand-primary">
                      {item.actor?.avatarUrl ? (
                        <Image
                          src={item.actor.avatarUrl}
                          alt={item.actor.displayName || item.actor.username}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        item.actor?.username?.charAt(0).toUpperCase() || '?'
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-brand-card border border-brand-border flex items-center justify-center shadow-md">
                      {getTypeIcon(item.type)}
                    </div>
                  </div>

                  {/* Texto de la notificación */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-white hover:underline">
                        {item.actor?.displayName || item.actor?.username || 'Usuario'}
                      </span>
                      {item.actor?.criticTier && (
                        <span className="text-[10px] font-bold text-sky-400 bg-sky-500/20 px-1.5 py-0.5 rounded border border-sky-500/30 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          Critic
                        </span>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-brand-text/90 mt-0.5 leading-snug">
                      {item.message}
                    </p>

                    <span className="text-[11px] text-brand-muted mt-1 block">
                      {formatTime(item.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Lado Derecho: Acciones */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!item.isRead && (
                    <button
                      onClick={(e) => handleMarkAsRead(item.id, e)}
                      className="p-2 text-brand-muted hover:text-brand-primary bg-brand-card/60 hover:bg-brand-card border border-brand-border/60 rounded-xl transition-all"
                      title="Marcar como leída"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={(e) => handleDelete(item.id, e)}
                    className="p-2 text-brand-muted hover:text-red-400 bg-brand-card/60 hover:bg-brand-card border border-brand-border/60 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    title="Eliminar notificación"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="hidden sm:flex text-brand-muted group-hover:text-white transition-colors pl-1">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-8 pt-6 border-t border-brand-border/40">
            <button
              onClick={() => {
                const prev = Math.max(1, page - 1);
                setPage(prev);
                fetchNotifications(prev);
              }}
              disabled={page <= 1}
              className="px-3.5 py-2 rounded-xl bg-brand-surface hover:bg-brand-surface/80 border border-brand-border text-xs font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </button>

            <span className="text-xs text-brand-muted font-medium px-2">
              Página <span className="text-white font-bold">{page}</span> de{' '}
              <span className="text-white font-bold">{totalPages}</span>
            </span>

            <button
              onClick={() => {
                const next = Math.min(totalPages, page + 1);
                setPage(next);
                fetchNotifications(next);
              }}
              disabled={page >= totalPages}
              className="px-3.5 py-2 rounded-xl bg-brand-surface hover:bg-brand-surface/80 border border-brand-border text-xs font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-all"
            >
              Siguiente
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
