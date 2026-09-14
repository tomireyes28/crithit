'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Users, Award, Loader2, UserCheck, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

interface FollowUserItem {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string | null;
  bio?: string | null;
  role?: string;
  criticTier?: string | null;
  isFollowing?: boolean;
}

interface FollowersModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  type: 'followers' | 'following';
}

export const FollowersModal: React.FC<FollowersModalProps> = ({
  isOpen,
  onClose,
  username,
  type,
}) => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<FollowUserItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && username) {
      setIsLoading(true);
      apiClient<FollowUserItem[]>(`/users/${username}/${type}`)
        .then((data) => setUsers(data || []))
        .catch(() => setUsers([]))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, username, type]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleToggleFollow = async (item: FollowUserItem) => {
    if (!currentUser || actionLoadingId) return;
    setActionLoadingId(item.id);

    try {
      const res: any = await apiClient(`/users/${item.username}/follow`, {
        method: 'POST',
      });
      setUsers((prev) =>
        prev.map((u) => (u.id === item.id ? { ...u, isFollowing: res.isFollowing } : u)),
      );
    } catch (err: any) {
      alert(err.message || 'Error al actualizar seguimiento');
    } finally {
      setActionLoadingId(null);
    }
  };

  const title = type === 'followers' ? 'Seguidores' : 'Siguiendo';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="relative w-full max-w-md bg-brand-surface border border-brand-border rounded-2xl shadow-2xl p-6 text-brand-text flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-brand-border/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-accent/20 border border-brand-accent/40 flex items-center justify-center text-brand-accent">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{title}</h3>
              <p className="text-xs text-brand-muted">@{username}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-brand-muted hover:text-white hover:bg-brand-bg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of Users */}
        <div className="flex-1 overflow-y-auto py-4 space-y-2 pr-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-brand-muted gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-brand-accent" />
              <span className="text-xs">Cargando usuarios...</span>
            </div>
          ) : users.length > 0 ? (
            users.map((item) => {
              const isMe = currentUser?.id === item.id;
              const isProcessing = actionLoadingId === item.id;

              return (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-brand-bg/50 border border-brand-border/40 hover:border-brand-border hover:bg-brand-bg/80 transition-all flex items-center justify-between gap-3"
                >
                  <Link
                    href={`/profile/${item.username}`}
                    onClick={onClose}
                    className="flex items-center gap-3 min-w-0 group"
                  >
                    <div className="w-10 h-10 rounded-full bg-brand-primary/30 border border-brand-primary/50 overflow-hidden relative flex-shrink-0 flex items-center justify-center font-bold text-sm text-brand-secondary group-hover:scale-105 transition-transform">
                      {item.avatarUrl ? (
                        <Image
                          src={item.avatarUrl}
                          alt={item.displayName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        item.displayName.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-xs text-white group-hover:text-brand-accent transition-colors truncate">
                          {item.displayName}
                        </span>
                        {item.criticTier && (
                          <Award className="w-3 h-3 text-amber-400 flex-shrink-0" />
                        )}
                      </div>
                      <span className="text-[11px] text-brand-muted block truncate">
                        @{item.username}
                      </span>
                    </div>
                  </Link>

                  {/* Botón de seguir / siguiendo (si no es el usuario actual) */}
                  {!isMe && currentUser && (
                    <button
                      disabled={isProcessing}
                      onClick={() => handleToggleFollow(item)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 flex-shrink-0 ${
                        item.isFollowing
                          ? 'bg-brand-surface border border-brand-border text-brand-muted hover:text-rose-400 hover:border-rose-500/40'
                          : 'bg-brand-accent text-brand-bg font-bold hover:brightness-110 shadow-sm'
                      }`}
                    >
                      {item.isFollowing ? (
                        <>
                          <UserCheck className="w-3 h-3 text-emerald-400" />
                          <span>Siguiendo</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3 h-3" />
                          <span>Seguir</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 px-4">
              <Users className="w-10 h-10 text-brand-muted/40 mx-auto mb-2" />
              <p className="text-xs text-brand-muted">
                {type === 'followers'
                  ? 'Este usuario aún no tiene seguidores.'
                  : 'Este usuario aún no sigue a nadie.'}
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
