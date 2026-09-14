'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Users, Globe, Flame, Filter, Loader2, Sparkles, UserPlus } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api';
import { ActivityFeedItem } from '@/components/activity/ActivityFeedItem';

export default function ActivityPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'following' | 'global'>('global');
  const [filterType, setFilterType] = useState<'ALL' | 'REVIEWS' | 'LOGS' | 'LISTS'>('ALL');
  const [activities, setActivities] = useState<any[]>([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0, followingCount: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Si el usuario está autenticado, activar por defecto "following"
  useEffect(() => {
    if (user) {
      setActiveTab('following');
    } else {
      setActiveTab('global');
    }
  }, [user]);

  const fetchActivities = useCallback(async (tab: 'following' | 'global', type: string, page = 1) => {
    setIsLoading(true);
    try {
      const endpoint =
        tab === 'following'
          ? `/activity/feed?page=${page}&type=${type}`
          : `/activity/global?page=${page}&type=${type}`;

      const res: any = await apiClient(endpoint);
      setActivities(res.data || []);
      setMeta(res.meta || { page: 1, totalPages: 1, total: 0, followingCount: 0 });
    } catch {
      setActivities([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivities(activeTab, filterType, 1);
  }, [activeTab, filterType, fetchActivities]);

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text pb-20">
      {/* Hero Header */}
      <div className="border-b border-brand-border/60 bg-gradient-to-b from-brand-surface/80 via-brand-bg to-brand-bg pt-10 pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-secondary/10 border border-brand-secondary/30 text-brand-secondary text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pulso Social</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white font-sans">
            Feed de <span className="text-brand-secondary">Actividad</span>
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted max-w-xl mt-2 leading-relaxed">
            Sigue en tiempo real qué están jugando, calificando y organizando las personas que sigues en CritHit.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Pestañas Principales (Siguiendo vs Comunidad Global) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-brand-border/40">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {user && (
              <button
                onClick={() => setActiveTab('following')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
                  activeTab === 'following'
                    ? 'bg-brand-surface text-brand-secondary border border-brand-secondary/40 shadow-sm'
                    : 'text-brand-muted hover:text-white hover:bg-brand-surface/40'
                }`}
              >
                <Users className="w-4 h-4 text-brand-secondary" />
                <span>Siguiendo</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('global')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'global'
                  ? 'bg-brand-surface text-brand-accent border border-brand-accent/40 shadow-sm'
                  : 'text-brand-muted hover:text-white hover:bg-brand-surface/40'
              }`}
            >
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>Comunidad Global</span>
            </button>
          </div>

          {/* Subfiltros por tipo */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {(
              [
                { label: 'Todos', value: 'ALL' },
                { label: 'Reseñas', value: 'REVIEWS' },
                { label: 'Diario', value: 'LOGS' },
                { label: 'Listas', value: 'LISTS' },
              ] as const
            ).map((f) => (
              <button
                key={f.value}
                onClick={() => setFilterType(f.value)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors ${
                  filterType === f.value
                    ? 'bg-brand-surface border border-brand-border text-white font-bold'
                    : 'text-brand-muted hover:text-brand-text'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Feed de Actividad */}
        <div className="pt-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-brand-muted gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-brand-secondary" />
              <p className="text-xs font-medium">Cargando actividades recientes...</p>
            </div>
          ) : activities.length > 0 ? (
            <div className="space-y-4">
              {activities.map((item) => (
                <ActivityFeedItem key={item.id} item={item} />
              ))}

              {/* Paginación simple */}
              {meta.totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-8">
                  <button
                    disabled={meta.page <= 1}
                    onClick={() => fetchActivities(activeTab, filterType, meta.page - 1)}
                    className="px-4 py-2 rounded-xl border border-brand-border bg-brand-surface text-xs font-semibold text-brand-text disabled:opacity-30 hover:border-brand-secondary transition-colors"
                  >
                    Anterior
                  </button>
                  <span className="text-xs font-mono text-brand-muted">
                    Página {meta.page} de {meta.totalPages}
                  </span>
                  <button
                    disabled={meta.page >= meta.totalPages}
                    onClick={() => fetchActivities(activeTab, filterType, meta.page + 1)}
                    className="px-4 py-2 rounded-xl border border-brand-border bg-brand-surface text-xs font-semibold text-brand-text disabled:opacity-30 hover:border-brand-secondary transition-colors"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </div>
          ) : activeTab === 'following' && meta.followingCount === 0 ? (
            <div className="text-center py-16 px-4 bg-brand-surface/40 rounded-2xl border border-dashed border-brand-border/60">
              <UserPlus className="w-12 h-12 text-brand-secondary/50 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white mb-1">
                Aún no sigues a ningún jugador
              </h3>
              <p className="text-xs text-brand-muted max-w-sm mx-auto mb-5">
                Sigue a otros usuarios y críticos acreditados para ver sus reseñas, partidas y colecciones en esta línea de tiempo.
              </p>
              <button
                onClick={() => setActiveTab('global')}
                className="px-4 py-2 rounded-xl bg-brand-secondary/20 hover:bg-brand-secondary/30 text-brand-secondary border border-brand-secondary/40 font-bold text-xs transition-all"
              >
                Ver Actividad Global de la Comunidad →
              </button>
            </div>
          ) : (
            <div className="text-center py-16 px-4 bg-brand-surface/40 rounded-2xl border border-dashed border-brand-border/60">
              <Globe className="w-12 h-12 text-brand-muted/40 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white mb-1">
                No hay actividades recientes
              </h3>
              <p className="text-xs text-brand-muted max-w-sm mx-auto">
                No se encontraron eventos con los filtros seleccionados.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
