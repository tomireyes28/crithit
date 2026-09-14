'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  ExternalLink,
  Trash2,
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export interface NotificationItem {
  id: string;
  recipientId: string;
  actorId?: string | null;
  type:
    | 'NEW_FOLLOWER'
    | 'REVIEW_LIKE'
    | 'REVIEW_COMMENT'
    | 'LIST_LIKE'
    | 'MENTION'
    | 'CRITIC_STATUS_CHANGE'
    | 'GAME_RELEASE';
  message: string;
  entityType?: string | null;
  entityId?: string | null;
  isRead: boolean;
  createdAt: string;
  actor?: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string | null;
    role?: string;
    criticTier?: string | null;
    criticBadge?: string | null;
  } | null;
}

interface NotificationsResponse {
  notifications: NotificationItem[];
  total: number;
  unreadCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const NotificationDropdown: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Consultar contador de no leídas periódicamente
  useEffect(() => {
    if (!user) return;

    const fetchUnreadCount = async () => {
      try {
        const res = await apiClient<{ unreadCount: number }>('/notifications/unread-count');
        setUnreadCount(res.unreadCount || 0);
      } catch {
        // Fallback silencioso
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Polling cada 30 segundos

    return () => clearInterval(interval);
  }, [user]);

  // Cargar notificaciones cuando se abre el menú o cambia el filtro
  useEffect(() => {
    if (!isOpen || !user) return;

    const fetchNotifications = async () => {
      setIsLoading(true);
      try {
        const unreadParam = filter === 'unread' ? '&unreadOnly=true' : '';
        const res = await apiClient<NotificationsResponse>(
          `/notifications?page=1&limit=8${unreadParam}`
        );
        setNotifications(res.notifications || []);
        setUnreadCount(res.unreadCount || 0);
      } catch (err) {
        console.error('Error fetching notifications:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, [isOpen, filter, user]);

  // Cerrar dropdown al hacer click afuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!user) return null;

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
    setIsOpen(false);

    if (item.type === 'NEW_FOLLOWER' && item.actor?.username) {
      router.push(`/profile/${item.actor.username}`);
    } else if (item.type === 'LIST_LIKE' && item.entityId) {
      router.push(`/lists/${item.entityId}`);
    } else if (item.actor?.username) {
      router.push(`/profile/${item.actor.username}`);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSec < 60) return 'hace un momento';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `hace ${diffMin}m`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `hace ${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `hace ${diffDays}d`;
    return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
  };

  const getTypeIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'NEW_FOLLOWER':
        return <UserPlus className="w-3.5 h-3.5 text-emerald-400" />;
      case 'REVIEW_LIKE':
        return <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />;
      case 'LIST_LIKE':
        return <Layers className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-brand-primary" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón Campana */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-xl transition-all ${
          isOpen
            ? 'bg-brand-surface text-white border border-brand-primary/40 shadow-sm shadow-brand-primary/10'
            : 'text-brand-muted hover:text-white hover:bg-brand-surface/70 border border-transparent'
        }`}
        aria-label="Notificaciones"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-brand-primary text-brand-bg text-[10px] font-extrabold rounded-full flex items-center justify-center shadow-lg shadow-brand-primary/30 animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-brand-card/95 backdrop-blur-xl border border-brand-border/90 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[520px]">
          {/* Header */}
          <div className="p-3.5 border-b border-brand-border/60 flex items-center justify-between bg-brand-surface/50">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">Notificaciones</span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-brand-primary/20 text-brand-primary border border-brand-primary/30">
                  {unreadCount} nuevas
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-brand-muted hover:text-brand-primary transition-colors flex items-center gap-1 font-medium"
                title="Marcar todas como leídas"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Marcar leídas
              </button>
            )}
          </div>

          {/* Filtros */}
          <div className="flex border-b border-brand-border/40 bg-brand-bg/40 px-2 py-1">
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                filter === 'all'
                  ? 'bg-brand-surface text-white shadow-sm'
                  : 'text-brand-muted hover:text-white'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                filter === 'unread'
                  ? 'bg-brand-surface text-white shadow-sm'
                  : 'text-brand-muted hover:text-white'
              }`}
            >
              No leídas
              {unreadCount > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
              )}
            </button>
          </div>

          {/* Lista de Notificaciones */}
          <div className="overflow-y-auto flex-1 divide-y divide-brand-border/30">
            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2 text-brand-muted">
                <div className="w-6 h-6 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-xs">Cargando...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-12 px-4 text-center flex flex-col items-center justify-center gap-2">
                <div className="w-10 h-10 rounded-full bg-brand-surface/60 flex items-center justify-center text-brand-muted">
                  <Bell className="w-5 h-5 opacity-60" />
                </div>
                <p className="text-xs font-medium text-brand-muted">
                  {filter === 'unread'
                    ? 'Estás al día con tus notificaciones'
                    : 'Aún no tienes notificaciones'}
                </p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`p-3 sm:p-3.5 flex items-start gap-3 hover:bg-brand-surface/80 transition-colors cursor-pointer group relative ${
                    !item.isRead ? 'bg-brand-primary/5' : ''
                  }`}
                >
                  {/* Avatar con icono sub-badge */}
                  <div className="relative flex-shrink-0">
                    <div className="w-9 h-9 rounded-full bg-brand-surface border border-brand-border overflow-hidden relative flex items-center justify-center text-xs font-bold text-brand-primary">
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
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-brand-card border border-brand-border flex items-center justify-center shadow-sm">
                      {getTypeIcon(item.type)}
                    </div>
                  </div>

                  {/* Contenido de la notificación */}
                  <div className="flex-1 min-w-0 pr-6">
                    <p className="text-xs text-brand-text leading-relaxed">
                      <span className="font-bold text-white hover:underline">
                        {item.actor?.displayName || item.actor?.username || 'Alguien'}
                      </span>{' '}
                      {item.message}
                    </p>
                    <span className="text-[10px] text-brand-muted mt-1 block">
                      {formatTimeAgo(item.createdAt)}
                    </span>
                  </div>

                  {/* Indicador de no leída y botón borrar al hover */}
                  <div className="absolute right-2 top-3 flex items-center gap-1">
                    {!item.isRead && (
                      <span className="w-2 h-2 rounded-full bg-brand-primary flex-shrink-0" />
                    )}
                    <button
                      onClick={(e) => handleDelete(item.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-brand-muted hover:text-red-400 rounded transition-all"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 border-t border-brand-border/60 bg-brand-surface/40 text-center">
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs font-semibold text-brand-primary hover:text-white transition-colors flex items-center justify-center gap-1.5"
            >
              Ver todas las notificaciones
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
