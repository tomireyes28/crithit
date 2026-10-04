'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Heart,
  MessageSquare,
  UserPlus,
  Sparkles,
  Award,
  X,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { NotificationItem } from './NotificationDropdown';

interface ToastItem {
  id: string;
  notification: NotificationItem;
  createdAt: number;
}

interface RealtimeNotificationsContextType {
  unreadCount: number;
  setUnreadCount: React.Dispatch<React.SetStateAction<number>>;
  incrementUnreadCount: () => void;
  decrementUnreadCount: () => void;
  triggerToast: (notification: NotificationItem) => void;
}

const RealtimeNotificationsContext = createContext<
  RealtimeNotificationsContextType | undefined
>(undefined);

export const RealtimeNotificationsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, token } = useAuth();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const incrementUnreadCount = useCallback(() => {
    setUnreadCount((prev) => prev + 1);
  }, []);

  const decrementUnreadCount = useCallback(() => {
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const triggerToast = useCallback(
    (notification: NotificationItem) => {
      const toastId = notification.id || `toast-${Date.now()}`;
      setToasts((prev) => {
        // Evitar duplicados
        if (prev.some((t) => t.id === toastId)) return prev;
        const newToast: ToastItem = {
          id: toastId,
          notification,
          createdAt: Date.now(),
        };
        // Máximo 3 toasts simultáneos para no saturar la pantalla
        return [...prev.slice(-2), newToast];
      });

      // Auto dismiss a los 6 segundos
      setTimeout(() => {
        removeToast(toastId);
      }, 6000);
    },
    [removeToast],
  );

  // Conexión en segundo plano vía Server-Sent Events (SSE)
  useEffect(() => {
    if (!user || !token) {
      setToasts([]);
      return;
    }

    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    const streamUrl = `${apiBase}/notifications/stream?token=${encodeURIComponent(token)}`;

    let eventSource: EventSource | null = null;
    let isMounted = true;

    const connectStream = () => {
      try {
        eventSource = new EventSource(streamUrl);

        eventSource.onmessage = (event) => {
          if (!isMounted) return;
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'PING') {
              // Heartbeat keepalive recibido con éxito
              return;
            }

            if (data.type === 'NOTIFICATION' && data.payload) {
              const notif = data.payload as NotificationItem;
              incrementUnreadCount();
              triggerToast(notif);
            }

            if (data.type === 'UNREAD_COUNT' && data.payload) {
              if (typeof data.payload.unreadCount === 'number') {
                setUnreadCount(data.payload.unreadCount);
              }
            }
          } catch {
            // Ignorar errores de parsing
          }
        };

        eventSource.onerror = () => {
          // Si ocurre un error, EventSource reintentará automáticamente
          if (eventSource?.readyState === EventSource.CLOSED) {
            eventSource.close();
          }
        };
      } catch {
        // Fallback silencioso
      }
    };

    connectStream();

    // Pausar y reanudar al cambiar de pestaña para ahorrar batería y recursos
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        if (!eventSource || eventSource.readyState === EventSource.CLOSED) {
          connectStream();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isMounted = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [user, token, incrementUnreadCount, triggerToast]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'NEW_FOLLOWER':
        return <UserPlus className="w-4 h-4 text-cyan-400" />;
      case 'REVIEW_LIKE':
      case 'LIST_LIKE':
        return <Heart className="w-4 h-4 text-rose-400 fill-rose-400/20" />;
      case 'REVIEW_COMMENT':
        return <MessageSquare className="w-4 h-4 text-emerald-400" />;
      case 'CRITIC_STATUS_CHANGE':
        return <Award className="w-4 h-4 text-amber-400" />;
      default:
        return <Bell className="w-4 h-4 text-brand-accent" />;
    }
  };

  return (
    <RealtimeNotificationsContext.Provider
      value={{
        unreadCount,
        setUnreadCount,
        incrementUnreadCount,
        decrementUnreadCount,
        triggerToast,
      }}
    >
      {children}

      {/* Toast Flotante Container con Framer Motion */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none max-w-sm w-full px-4 sm:px-0">
        <AnimatePresence>
          {toasts.map((item) => {
            const actor = item.notification.actor;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                className="pointer-events-auto bg-brand-surface/95 border border-brand-border/80 rounded-2xl shadow-2xl shadow-black/60 p-4 backdrop-blur-xl relative overflow-hidden"
              >
                {/* Indicador de pulso activo */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-accent via-cyan-400 to-emerald-400" />

                <div className="flex items-start gap-3">
                  {/* Avatar o Icono */}
                  <div className="w-10 h-10 rounded-xl bg-brand-card border border-brand-border flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                    {actor?.avatarUrl ? (
                      <img
                        src={actor.avatarUrl}
                        alt={actor.displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      getNotificationIcon(item.notification.type)
                    )}
                    <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-brand-bg border border-brand-border scale-75">
                      {getNotificationIcon(item.notification.type)}
                    </div>
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-xs font-bold text-white truncate">
                        {actor?.displayName || 'Comunidad CritHit'}
                      </span>
                      {actor?.criticTier && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-violet-500/20 text-violet-300 border border-violet-500/40">
                          Crítico
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-brand-muted line-clamp-2 leading-relaxed">
                      {item.notification.message}
                    </p>
                    <div className="mt-2 flex items-center gap-3">
                      <Link
                        href="/notifications"
                        onClick={() => removeToast(item.id)}
                        className="text-[11px] font-bold text-brand-accent hover:underline flex items-center gap-1"
                      >
                        <span>Ver notificación</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                      <span className="text-[10px] text-brand-muted font-mono">Ahora</span>
                    </div>
                  </div>

                  {/* Botón cerrar */}
                  <button
                    type="button"
                    onClick={() => removeToast(item.id)}
                    className="p-1 rounded-lg text-brand-muted hover:text-white hover:bg-white/5 transition-colors absolute top-3 right-3"
                    aria-label="Cerrar notificación"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </RealtimeNotificationsContext.Provider>
  );
};

export const useRealtimeNotifications = () => {
  const context = useContext(RealtimeNotificationsContext);
  if (!context) {
    throw new Error(
      'useRealtimeNotifications debe ser usado dentro de un RealtimeNotificationsProvider',
    );
  }
  return context;
};
