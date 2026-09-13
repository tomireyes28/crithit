'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api';
import { ScoreBadge } from '@/components/ui/ScoreBadge';
import { PlayStatus, PLAY_STATUS_MAP } from '@crithit/shared';

interface PlayLogEntry {
  id: string;
  userId: string;
  gameId: string;
  status: PlayStatus;
  logDate: string;
  startedAt: string | null;
  finishedAt: string | null;
  platform: string | null;
  hoursPlayed: number | null;
  isReplay: boolean;
  replayCount: number;
  notes: string | null;
  createdAt: string;
  game: {
    id: string;
    name: string;
    slug: string;
    coverUrl: string | null;
    backdropUrl: string | null;
    firstReleaseDate: string | null;
    communityScore: number | null;
  };
}

interface PlayLogResponse {
  data: PlayLogEntry[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  stats: {
    totalLogs: number;
    totalHours: number;
    completedCount: number;
    statusCounts: Record<string, number>;
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
        month: 'long',
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
        <div className="w-20 h-20 rounded-3xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-4xl mb-6">
          📖
        </div>
        <h1 className="text-3xl font-black text-brand-text mb-3">
          Diario de Videojuegos
        </h1>
        <p className="text-brand-muted text-sm max-w-md mb-8">
          Registra cada partida jugada, guarda las horas dedicadas, organiza tu backlog y crea tu bitácora personal estilo Letterboxd.
        </p>
        <Link
          href="/login"
          className="px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-brand-accent to-emerald-500 text-brand-bg hover:brightness-110 shadow-lg shadow-brand-accent/25 transition-all"
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
    <div className="min-h-screen bg-brand-bg text-brand-text pb-24">
      {/* Cabecera Principal */}
      <div className="bg-brand-surface/40 border-b border-brand-border/60 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">📖</span>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                  Diario de Juego
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-brand-muted">
                Tu historial de partidas, tiempo invertido y estados de juego en tiempo real.
              </p>
            </div>

            {/* Estadísticas de Juego Rápidas */}
            {stats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-brand-surface border border-brand-border/80 text-center">
                  <span className="block font-mono font-black text-xl text-blue-400">
                    {stats.totalLogs}
                  </span>
                  <span className="text-[11px] font-semibold text-brand-muted uppercase tracking-wider">
                    Entradas
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-brand-surface border border-brand-border/80 text-center">
                  <span className="block font-mono font-black text-xl text-brand-accent">
                    {Math.round(stats.totalHours)}h
                  </span>
                  <span className="text-[11px] font-semibold text-brand-muted uppercase tracking-wider">
                    Horas
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-brand-surface border border-brand-border/80 text-center">
                  <span className="block font-mono font-black text-xl text-emerald-400">
                    {stats.completedCount}
                  </span>
                  <span className="text-[11px] font-semibold text-brand-muted uppercase tracking-wider">
                    Completados
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-brand-surface border border-brand-border/80 text-center">
                  <span className="block font-mono font-black text-xl text-amber-400">
                    {stats.statusCounts.MASTERED || 0}
                  </span>
                  <span className="text-[11px] font-semibold text-brand-muted uppercase tracking-wider">
                    100% Mastered
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Filtros por Estado */}
          <div className="mt-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {[
              { id: 'ALL', label: 'Todos los registros' },
              { id: 'PLAYING', label: '🎮 Jugando' },
              { id: 'COMPLETED', label: '🏆 Completados' },
              { id: 'MASTERED', label: '👑 100%' },
              { id: 'BACKLOG', label: '⏳ Backlog' },
              { id: 'SHELVED', label: '⏸️ Pausados' },
              { id: 'DROPPED', label: '❌ Abandonados' },
              { id: 'WISHLIST', label: '💖 Deseos' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedStatus(f.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedStatus === f.id
                    ? 'bg-brand-primary text-white shadow-md'
                    : 'bg-brand-surface/60 hover:bg-brand-surface text-brand-muted hover:text-brand-text border border-brand-border/40'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contenido Principal: Timeline del Diario */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="h-28 rounded-2xl bg-brand-surface/40 border border-brand-border/60"
              />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 rounded-3xl bg-brand-surface/30 border border-brand-border/60 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-brand-surface flex items-center justify-center text-3xl mb-4">
              🎮
            </div>
            <h3 className="text-lg font-bold text-brand-text mb-2">
              No hay partidas registradas en esta categoría
            </h3>
            <p className="text-xs text-brand-muted max-w-sm mb-6">
              Explora el catálogo de juegos y usa el botón "Añadir al Diario" para registrar tus horas y progreso.
            </p>
            <Link
              href="/games"
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-accent text-brand-bg hover:brightness-110 transition-all shadow"
            >
              Explorar Catálogo
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => {
              const releaseYear = log.game.firstReleaseDate
                ? new Date(log.game.firstReleaseDate).getFullYear()
                : null;

              return (
                <div
                  key={log.id}
                  className="p-4 sm:p-5 rounded-2xl bg-brand-surface/40 border border-brand-border/60 hover:border-brand-border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                >
                  {/* Info Juego + Portada */}
                  <div className="flex items-center gap-4 min-w-0">
                    <Link
                      href={`/games/${log.game.slug}`}
                      className="w-14 sm:w-16 aspect-[3/4] rounded-xl overflow-hidden bg-brand-surface border border-brand-border/80 flex-shrink-0 relative hover:scale-105 transition-transform"
                    >
                      {log.game.coverUrl ? (
                        <img
                          src={log.game.coverUrl}
                          alt={log.game.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl">
                          🎮
                        </div>
                      )}
                    </Link>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Link
                          href={`/games/${log.game.slug}`}
                          className="text-base sm:text-lg font-bold text-brand-text hover:text-brand-accent transition-colors truncate"
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
                            <span className="px-2 py-0.5 rounded bg-brand-bg border border-brand-border font-mono text-[11px] text-brand-text">
                              {log.platform}
                            </span>
                          </>
                        )}
                        {log.hoursPlayed !== null && log.hoursPlayed !== undefined && (
                          <>
                            <span>·</span>
                            <span className="font-semibold text-brand-accent">
                              ⏱️ {log.hoursPlayed} hrs
                            </span>
                          </>
                        )}
                        {log.isReplay && (
                          <>
                            <span>·</span>
                            <span className="text-amber-400 font-medium">🔁 Rejugada</span>
                          </>
                        )}
                      </div>

                      {/* Notas de la partida */}
                      {log.notes && (
                        <p className="mt-2 text-xs text-brand-text/80 bg-brand-bg/60 p-2.5 rounded-xl border border-brand-border/40 italic">
                          "{log.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Estado + Badge + Botón Eliminar */}
                  <div className="flex items-center gap-3 sm:gap-4 self-end sm:self-center flex-shrink-0">
                    <ScoreBadge score={log.game.communityScore} size="sm" />
                    {getStatusBadge(log.status)}

                    <button
                      onClick={() => handleDelete(log.id, log.game.name)}
                      disabled={deletingId === log.id}
                      className="text-xs text-brand-muted hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors opacity-80 sm:opacity-0 group-hover:opacity-100"
                      title="Eliminar del diario"
                    >
                      {deletingId === log.id ? '...' : '🗑️'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
