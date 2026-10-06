'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api';
import { PlayStatus, PLAY_STATUS_MAP, ALL_PLAY_STATUSES } from '@crithit/shared';
import { ScoreBadge } from '@/components/ui/ScoreBadge';
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
  HoverLift,
  BouncyTap,
  ScrollReveal,
  SPRING_SNAPPY,
  SPRING_BOUNCY,
  SPRING_GENTLE,
} from '@/components/ui/MotionWrapper';
import { motion, AnimatePresence } from 'framer-motion';
import { RollingNumber } from '@/components/ui/AnimatedScore';
import {
  BookOpen,
  Gamepad2,
  Trophy,
  Crown,
  Bookmark,
  Clock,
  Repeat,
  Trash2,
  Plus,
  Compass,
  AlertCircle,
} from 'lucide-react';

interface PlayLogEntry {
  id: string;
  gameId: string;
  status: PlayStatus;
  logDate: string;
  platform?: string | null;
  hoursPlayed?: number | null;
  isReplay: boolean;
  notes?: string | null;
  createdAt: string;
  game: {
    id: string;
    name: string;
    slug: string;
    coverUrl?: string | null;
    firstReleaseDate?: string | null;
    communityScore?: number | null;
  };
}

interface PlayLogResponse {
  data: PlayLogEntry[];
  stats: {
    totalLogs: number;
    totalHours: number;
    completedCount: number;
    masteredCount: number;
  };
}

export default function DiaryPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [logs, setLogs] = useState<PlayLogEntry[]>([]);
  const [stats, setStats] = useState<PlayLogResponse['stats'] | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchDiary = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const url =
        selectedStatus === 'ALL'
          ? '/play-logs/me?limit=50'
          : `/play-logs/me?status=${selectedStatus}&limit=50`;

      const res = await apiClient<PlayLogResponse>(url);
      setLogs(res.data);
      setStats(res.stats);
    } catch {
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  }, [user, selectedStatus]);

  useEffect(() => {
    if (user) {
      fetchDiary();
    } else {
      setIsLoading(false);
    }
  }, [user, fetchDiary]);

  const handleDelete = async (id: string, gameName: string) => {
    const confirm = window.confirm(
      `¿Deseas eliminar el registro de ${gameName} de tu diario?`,
    );
    if (!confirm) return;

    setDeletingId(id);
    try {
      await apiClient(`/play-logs/${id}`, { method: 'DELETE' });
      setLogs((prev) => prev.filter((l) => l.id !== id));
      if (stats) {
        setStats({
          ...stats,
          totalLogs: Math.max(0, stats.totalLogs - 1),
        });
      }
    } catch {
      alert('No se pudo eliminar el registro.');
    } finally {
      setDeletingId(null);
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

  // Si no está autenticado
  if (!isAuthLoading && !user) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center text-center px-4 bg-brand-bg">
        <div className="w-20 h-20 rounded-3xl bg-brand-primary/10 border border-brand-primary/30 flex items-center justify-center text-brand-primary mb-6 shadow-glow-primary">
          <BookOpen className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-black text-white mb-3">
          Diario de Videojuegos
        </h1>
        <p className="text-brand-muted text-sm max-w-md mb-8 leading-relaxed">
          Registra cada partida jugada, guarda las horas dedicadas, organiza tu backlog y crea tu bitácora personal estilo Letterboxd.
        </p>
        <Link
          href="/login"
          className="px-6 py-3 rounded-xl font-bold text-sm bg-brand-primary hover:bg-brand-primary-hover text-white shadow-glow-primary transition-all"
        >
          Iniciar sesión para acceder a tu Diario
        </Link>
      </div>
    );
  }

  const getStatusBadge = (status: PlayStatus) => {
    const info = PLAY_STATUS_MAP[status];
    if (!info) return null;
    return (
      <span
        className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${info.badgeClass}`}
      >
        {info.labelEs}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text pb-24 space-y-8">
      {/* Cabecera Principal con Glassmorphism 2.0 y ScrollReveal */}
      <ScrollReveal direction="down" distance={15}>
        <div className="glass-card-v2 p-6 sm:p-8 rounded-3xl border border-white/[0.08] shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-surface border border-white/10 text-xs font-semibold text-brand-secondary shadow-glow-secondary mb-2">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Bitácora Personal</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Diario de Juego
              </h1>
              <p className="text-xs sm:text-sm text-brand-muted">
                Tu historial de partidas, tiempo invertido y estados de juego en tiempo real.
              </p>
            </div>

            {/* Estadísticas de Juego Rápidas con RollingNumber */}
            {stats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <motion.div
                  whileHover={{ y: -2, scale: 1.02 }}
                  transition={SPRING_BOUNCY}
                  className="p-3.5 rounded-2xl glass-card-v2 border border-white/[0.08] text-center shadow-lg"
                >
                  <span className="block font-mono font-black text-xl text-blue-400">
                    <RollingNumber value={stats.totalLogs} separator />
                  </span>
                  <span className="text-[11px] font-semibold text-brand-muted uppercase tracking-wider">
                    Entradas
                  </span>
                </motion.div>
                <motion.div
                  whileHover={{ y: -2, scale: 1.02 }}
                  transition={SPRING_BOUNCY}
                  className="p-3.5 rounded-2xl glass-card-v2 border border-white/[0.08] text-center shadow-lg"
                >
                  <span className="block font-mono font-black text-xl text-brand-secondary">
                    <RollingNumber
                      value={Math.round(stats.totalHours)}
                      suffix="h"
                      separator
                    />
                  </span>
                  <span className="text-[11px] font-semibold text-brand-muted uppercase tracking-wider">
                    Horas
                  </span>
                </motion.div>
                <motion.div
                  whileHover={{ y: -2, scale: 1.02 }}
                  transition={SPRING_BOUNCY}
                  className="p-3.5 rounded-2xl glass-card-v2 border border-white/[0.08] text-center shadow-lg"
                >
                  <span className="block font-mono font-black text-xl text-emerald-400">
                    <RollingNumber value={stats.completedCount} separator />
                  </span>
                  <span className="text-[11px] font-semibold text-brand-muted uppercase tracking-wider">
                    Completados
                  </span>
                </motion.div>
                <motion.div
                  whileHover={{ y: -2, scale: 1.02 }}
                  transition={SPRING_BOUNCY}
                  className="p-3.5 rounded-2xl glass-card-v2 border border-white/[0.08] text-center shadow-lg"
                >
                  <span className="block font-mono font-black text-xl text-amber-400">
                    <RollingNumber value={stats.masteredCount} separator />
                  </span>
                  <span className="text-[11px] font-semibold text-brand-muted uppercase tracking-wider">
                    100% / Master
                  </span>
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </ScrollReveal>

      {/* Barra de Filtros con Pills Deslizantes layoutId */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none mask-fade-x">
        <BouncyTap>
          <button
            onClick={() => setSelectedStatus('ALL')}
            className={`relative px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
              selectedStatus === 'ALL'
                ? 'text-white'
                : 'text-brand-muted hover:text-white glass-card-v2 border border-white/[0.06]'
            }`}
          >
            {selectedStatus === 'ALL' && (
              <motion.div
                layoutId="activeDiaryStatusPill"
                className="absolute inset-0 bg-brand-primary rounded-xl shadow-glow-primary z-0"
                transition={SPRING_SNAPPY}
              />
            )}
            <span className="relative z-10">Todos ({stats?.totalLogs || 0})</span>
          </button>
        </BouncyTap>

        {ALL_PLAY_STATUSES.map((st) => {
          const isSelected = selectedStatus === st.status;
          return (
            <BouncyTap key={st.status}>
              <button
                onClick={() => setSelectedStatus(st.status)}
                className={`relative px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                  isSelected
                    ? 'text-white'
                    : 'text-brand-muted hover:text-white glass-card-v2 border border-white/[0.06]'
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="activeDiaryStatusPill"
                    className="absolute inset-0 bg-brand-primary rounded-xl shadow-glow-primary z-0"
                    transition={SPRING_SNAPPY}
                  />
                )}
                <span className="relative z-10">{st.labelEs}</span>
              </button>
            </BouncyTap>
          );
        })}
      </div>

      {/* Contenido / Listado */}
      <div>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl glass-card-v2 border border-white/[0.06] flex gap-4 shimmer-bg h-28"
              />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="glass-card-v2 p-12 rounded-3xl border border-white/[0.08] flex flex-col items-center justify-center text-center space-y-4 shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-brand-surface border border-white/10 flex items-center justify-center text-brand-muted">
              <Gamepad2 className="w-8 h-8 text-brand-secondary" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">
                No hay partidas registradas en esta categoría
              </h3>
              <p className="text-xs text-brand-muted max-w-sm mx-auto">
                Explora el catálogo de juegos y usa el botón "Añadir al Diario" para registrar tus horas y progreso.
              </p>
            </div>
            <BouncyTap>
              <Link
                href="/games"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-primary hover:bg-brand-primary-hover text-white shadow-glow-primary transition-all"
              >
                <Compass className="w-4 h-4" />
                Explorar Catálogo
              </Link>
            </BouncyTap>
          </div>
        ) : (
          <StaggerContainer className="space-y-4">
            {logs.map((log) => {
              const releaseYear = log.game.firstReleaseDate
                ? new Date(log.game.firstReleaseDate).getFullYear()
                : null;

              return (
                <StaggerItem key={log.id}>
                  <div className="glass-card-v2 p-4 sm:p-5 rounded-2xl border border-white/[0.08] hover:border-white/[0.18] transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group shadow-md">
                    {/* Info Juego + Portada */}
                    <div className="flex items-center gap-4 min-w-0">
                      <Link
                        href={`/games/${log.game.slug}`}
                        className="w-14 sm:w-16 aspect-[3/4] rounded-xl overflow-hidden bg-brand-surface border border-white/10 flex-shrink-0 relative hover:scale-105 transition-transform"
                      >
                        {log.game.coverUrl ? (
                          <img
                            src={log.game.coverUrl}
                            alt={log.game.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-brand-muted">
                            <Gamepad2 className="w-6 h-6" />
                          </div>
                        )}
                      </Link>

                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            href={`/games/${log.game.slug}`}
                            className="text-base sm:text-lg font-bold text-white hover:text-brand-secondary transition-colors truncate"
                          >
                            {log.game.name}
                          </Link>
                          {releaseYear && (
                            <span className="text-xs text-brand-muted font-mono">
                              ({releaseYear})
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-brand-muted">
                          <span>{formatDate(log.logDate)}</span>
                          {log.platform && (
                            <>
                              <span>·</span>
                              <span className="px-2 py-0.5 rounded bg-brand-surface border border-white/10 font-mono text-[11px] text-brand-text">
                                {log.platform}
                              </span>
                            </>
                          )}
                          {log.hoursPlayed !== null && log.hoursPlayed !== undefined && (
                            <>
                              <span>·</span>
                              <span className="font-semibold text-brand-secondary flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {log.hoursPlayed} hrs
                              </span>
                            </>
                          )}
                          {log.isReplay && (
                            <>
                              <span>·</span>
                              <span className="text-amber-400 font-medium flex items-center gap-1">
                                <Repeat className="w-3 h-3" />
                                Rejugada
                              </span>
                            </>
                          )}
                        </div>

                        {/* Notas de la partida */}
                        {log.notes && (
                          <p className="mt-2 text-xs text-brand-text/80 bg-brand-bg/60 p-2.5 rounded-xl border border-white/[0.06] italic">
                            "{log.notes}"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Estado + Acciones */}
                    <div className="flex items-center gap-3 self-end sm:self-center">
                      {getStatusBadge(log.status)}

                      {log.game.communityScore !== null &&
                        log.game.communityScore !== undefined && (
                          <ScoreBadge score={log.game.communityScore} size="sm" />
                        )}

                      <BouncyTap>
                        <button
                          onClick={() => handleDelete(log.id, log.game.name)}
                          disabled={deletingId === log.id}
                          title="Eliminar del diario"
                          className="p-2 rounded-xl text-brand-muted hover:text-rose-400 hover:bg-rose-500/10 transition-colors opacity-60 group-hover:opacity-100 disabled:opacity-30"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </BouncyTap>
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        )}
      </div>
    </div>
  );
}
