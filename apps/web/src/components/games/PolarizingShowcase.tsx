'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { CriticCommunityGapMeter } from './CriticCommunityGapMeter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Scale,
  Flame,
  Award,
  Users,
  ChevronRight,
  Sparkles,
  Gamepad2,
  Loader2,
} from 'lucide-react';

export interface PolarizingGameItem {
  id: string;
  slug: string;
  name: string;
  summary: string | null;
  coverUrl: string | null;
  backdropUrl: string | null;
  criticScore: number;
  communityScore: number;
  gap: number;
  disparity: number;
  direction: 'CRITICS_FAVOR' | 'COMMUNITY_FAVOR';
  polarizationIndex: number;
  verdict?: string;
  genres: string[];
  platforms: string[];
  totalReviews: number;
  criticCount?: number;
  communityCount?: number;
}

export const PolarizingShowcase: React.FC = () => {
  const [games, setGames] = useState<PolarizingGameItem[]>([]);
  const [category, setCategory] = useState<'all' | 'critics_favor' | 'community_favor'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadPolarizing() {
      try {
        setLoading(true);
        const res: any = await apiClient(`/games/polarizing?category=${category}&limit=6`);
        if (isMounted) {
          setGames(Array.isArray(res) ? res : []);
        }
      } catch (err) {
        console.error('Error fetching polarizing games:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadPolarizing();
    return () => {
      isMounted = false;
    };
  }, [category]);

  const categoryTabs = [
    { id: 'all', label: 'Todos los debates', icon: Scale },
    { id: 'critics_favor', label: 'Favoritos de la Crítica', icon: Award },
    { id: 'community_favor', label: 'Favoritos de los Jugadores', icon: Users },
  ] as const;

  return (
    <section className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-brand-surface/70 to-brand-card/80 border border-brand-border/80 backdrop-blur-xl overflow-hidden space-y-6">
      {/* Resplandor ambiental de fondo */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Cabecera de la Sección */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-brand-border/40 pb-5">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Flame className="w-3.5 h-3.5" />
            <span>Medidor de Polarización de CritHit</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            El Gran Debate:{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-rose-400 to-cyan-400">
              Crítica vs Comunidad
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-brand-muted max-w-2xl leading-relaxed">
            Títulos que generan la mayor disparidad de opiniones entre la prensa especializada y los jugadores. ¿De qué lado te posicionas tú?
          </p>
        </div>

        {/* Píldoras de filtrado */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-brand-surface/80 border border-brand-border/60 self-start md:self-auto">
          {categoryTabs.map((tab) => {
            const Icon = tab.icon;
            const active = category === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCategory(tab.id)}
                className={`relative px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  active
                    ? 'text-white shadow-sm'
                    : 'text-brand-muted hover:text-white hover:bg-brand-bg/50'
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="polarizingTabIndicator"
                    className="absolute inset-0 bg-brand-surface border border-brand-border rounded-lg shadow-inner z-0"
                    transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid de Juegos Polarizantes */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-3 text-brand-muted">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
          <span className="text-xs font-semibold">Calculando índices de discrepancia...</span>
        </div>
      ) : games.length === 0 ? (
        <div className="py-12 text-center text-brand-muted text-xs">
          No se encontraron títulos en esta categoría.
        </div>
      ) : (
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {games.map((game) => (
              <motion.div
                key={game.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className="group flex flex-col rounded-2xl bg-brand-bg/70 border border-brand-border/60 hover:border-brand-border transition-all overflow-hidden p-4 space-y-3.5 hover:shadow-xl hover:shadow-black/40"
              >
                {/* Mini Hero Header de la tarjeta */}
                <div className="flex gap-3.5 items-start">
                  <Link
                    href={`/games/${game.slug}`}
                    className="w-16 h-22 rounded-xl overflow-hidden bg-brand-surface border border-brand-border/70 flex-shrink-0 group-hover:scale-105 transition-transform"
                  >
                    {game.coverUrl ? (
                      <img
                        src={game.coverUrl}
                        alt={game.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-brand-muted">
                        <Gamepad2 className="w-6 h-6" />
                      </div>
                    )}
                  </Link>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {game.genres.slice(0, 2).map((g) => (
                        <span
                          key={g}
                          className="px-2 py-0.5 rounded text-[10px] font-medium bg-brand-surface border border-brand-border/50 text-brand-muted"
                        >
                          {g}
                        </span>
                      ))}
                    </div>

                    <Link
                      href={`/games/${game.slug}`}
                      className="block text-sm font-bold text-white hover:text-amber-400 transition-colors truncate"
                    >
                      {game.name}
                    </Link>

                    <p className="text-[11px] text-brand-muted line-clamp-2">
                      {game.summary || 'Sin sinopsis disponible.'}
                    </p>
                  </div>
                </div>

                {/* Medidor Compacto de la Brecha */}
                <CriticCommunityGapMeter
                  criticScore={game.criticScore}
                  communityScore={game.communityScore}
                  compact={true}
                  customVerdict={game.verdict}
                />

                {/* Veredicto descriptivo sintético */}
                {game.verdict && (
                  <p className="text-[11px] text-brand-muted/90 italic leading-relaxed px-1">
                    "{game.verdict}"
                  </p>
                )}

                {/* Botón CTA al debate */}
                <div className="pt-1 mt-auto">
                  <Link
                    href={`/games/${game.slug}`}
                    className="w-full py-2 px-3 rounded-xl bg-brand-surface/70 hover:bg-brand-surface border border-brand-border/60 hover:border-amber-500/40 text-xs font-bold text-white hover:text-amber-300 transition-all flex items-center justify-center gap-1.5 group/btn"
                  >
                    <span>Unirse al Debate y Calificar</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
};
