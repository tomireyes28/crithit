'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
  Flame,
  Crown,
  Medal,
  Award,
  Sparkles,
  ArrowRight,
  Gamepad2,
  Calendar,
  MessageSquare,
  Users,
  ChevronRight,
} from 'lucide-react';
import { ScoreBadge } from '@/components/ui/ScoreBadge';
import { AnimatedScore } from '@/components/ui/AnimatedScore';
import { HoverLift } from '@/components/ui/MotionWrapper';

export interface RankedGame {
  id: string;
  rank: number;
  slug: string;
  name: string;
  summary?: string;
  coverUrl: string | null;
  backdropUrl?: string | null;
  communityScore: number | null;
  criticScore?: number | null;
  metacriticScore?: number | null;
  weeklyEngagement?: number;
  totalReviews?: number;
  genres?: string[];
  platforms?: string[];
}

const FALLBACK_WEEKLY_GAMES: Record<'week' | 'month' | 'all_time', RankedGame[]> = {
  week: [
    {
      id: '1',
      rank: 1,
      name: 'Elden Ring: Shadow of the Erdtree',
      slug: 'elden-ring-shadow-of-the-erdtree',
      coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co7vde.jpg',
      backdropUrl: 'https://images.igdb.com/igdb/image/upload/t_1080p/co7vde.jpg',
      communityScore: 95,
      criticScore: 96,
      metacriticScore: 95,
      weeklyEngagement: 2480,
      totalReviews: 890,
      genres: ['Action RPG', 'Fantasía Oscura'],
      platforms: ['PC', 'PS5', 'Xbox Series X'],
    },
    {
      id: '2',
      rank: 2,
      name: 'Black Myth: Wukong',
      slug: 'black-myth-wukong',
      coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co8j9a.jpg',
      backdropUrl: 'https://images.igdb.com/igdb/image/upload/t_1080p/co8j9a.jpg',
      communityScore: 89,
      criticScore: 82,
      metacriticScore: 81,
      weeklyEngagement: 2150,
      totalReviews: 640,
      genres: ['Acción', 'Aventura Mitológica'],
      platforms: ['PC', 'PS5'],
    },
    {
      id: '3',
      rank: 3,
      name: 'Metaphor: ReFantazio',
      slug: 'metaphor-refantazio',
      coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co6s98.jpg',
      backdropUrl: 'https://images.igdb.com/igdb/image/upload/t_1080p/co6s98.jpg',
      communityScore: 93,
      criticScore: 94,
      metacriticScore: 93,
      weeklyEngagement: 1890,
      totalReviews: 420,
      genres: ['JRPG', 'Estrategia por Turnos'],
      platforms: ['PC', 'PS5', 'Xbox Series X'],
    },
    {
      id: '4',
      rank: 4,
      name: 'Hades II',
      slug: 'hades-ii',
      coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5zpp.jpg',
      communityScore: 92,
      criticScore: 90,
      weeklyEngagement: 1650,
      totalReviews: 380,
      genres: ['Roguelike', 'Indie Acción'],
      platforms: ['PC'],
    },
    {
      id: '5',
      rank: 5,
      name: 'Astro Bot',
      slug: 'astro-bot',
      coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co86v2.jpg',
      communityScore: 94,
      criticScore: 94,
      weeklyEngagement: 1520,
      totalReviews: 340,
      genres: ['Plataformas 3D', 'Aventura'],
      platforms: ['PS5'],
    },
    {
      id: '6',
      rank: 6,
      name: "Baldur's Gate 3",
      slug: 'baldurs-gate-3',
      coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co670h.jpg',
      communityScore: 96,
      criticScore: 96,
      weeklyEngagement: 1490,
      totalReviews: 1250,
      genres: ['CRPG', 'Fantasía'],
      platforms: ['PC', 'PS5', 'Xbox Series X'],
    },
    {
      id: '7',
      rank: 7,
      name: 'Silent Hill 2',
      slug: 'silent-hill-2-remake',
      coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5p1d.jpg',
      communityScore: 88,
      criticScore: 86,
      weeklyEngagement: 1380,
      totalReviews: 310,
      genres: ['Survival Horror'],
      platforms: ['PC', 'PS5'],
    },
    {
      id: '8',
      rank: 8,
      name: 'Final Fantasy VII Rebirth',
      slug: 'final-fantasy-vii-rebirth',
      coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co6t8i.jpg',
      communityScore: 92,
      criticScore: 92,
      weeklyEngagement: 1290,
      totalReviews: 530,
      genres: ['Action RPG'],
      platforms: ['PS5'],
    },
  ],
  month: [
    {
      id: '2',
      rank: 1,
      name: 'Black Myth: Wukong',
      slug: 'black-myth-wukong',
      coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co8j9a.jpg',
      backdropUrl: 'https://images.igdb.com/igdb/image/upload/t_1080p/co8j9a.jpg',
      communityScore: 89,
      criticScore: 82,
      weeklyEngagement: 8450,
      totalReviews: 1840,
      genres: ['Acción', 'Aventura Mitológica'],
      platforms: ['PC', 'PS5'],
    },
    {
      id: '1',
      rank: 2,
      name: 'Elden Ring: Shadow of the Erdtree',
      slug: 'elden-ring-shadow-of-the-erdtree',
      coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co7vde.jpg',
      backdropUrl: 'https://images.igdb.com/igdb/image/upload/t_1080p/co7vde.jpg',
      communityScore: 95,
      criticScore: 96,
      weeklyEngagement: 7920,
      totalReviews: 2410,
      genres: ['Action RPG', 'Fantasía Oscura'],
      platforms: ['PC', 'PS5', 'Xbox Series X'],
    },
    {
      id: '5',
      rank: 3,
      name: 'Astro Bot',
      slug: 'astro-bot',
      coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co86v2.jpg',
      backdropUrl: 'https://images.igdb.com/igdb/image/upload/t_1080p/co86v2.jpg',
      communityScore: 94,
      criticScore: 94,
      weeklyEngagement: 5120,
      totalReviews: 920,
      genres: ['Plataformas 3D'],
      platforms: ['PS5'],
    },
    {
      id: '3',
      rank: 4,
      name: 'Metaphor: ReFantazio',
      slug: 'metaphor-refantazio',
      coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co6s98.jpg',
      communityScore: 93,
      criticScore: 94,
      weeklyEngagement: 4890,
      totalReviews: 760,
      genres: ['JRPG', 'Estrategia'],
      platforms: ['PC', 'PS5', 'Xbox Series X'],
    },
  ],
  all_time: [
    {
      id: '9',
      rank: 1,
      name: 'The Witcher 3: Wild Hunt',
      slug: 'the-witcher-3-wild-hunt',
      coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1wyy.jpg',
      backdropUrl: 'https://images.igdb.com/igdb/image/upload/t_1080p/co1wyy.jpg',
      communityScore: 97,
      criticScore: 95,
      weeklyEngagement: 9900,
      totalReviews: 4800,
      genres: ['RPG', 'Mundo Abierto'],
      platforms: ['PC', 'PS5', 'Xbox Series X', 'Switch'],
    },
    {
      id: '6',
      rank: 2,
      name: "Baldur's Gate 3",
      slug: 'baldurs-gate-3',
      coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co670h.jpg',
      backdropUrl: 'https://images.igdb.com/igdb/image/upload/t_1080p/co670h.jpg',
      communityScore: 96,
      criticScore: 96,
      weeklyEngagement: 9200,
      totalReviews: 3900,
      genres: ['CRPG', 'Fantasía'],
      platforms: ['PC', 'PS5', 'Xbox Series X'],
    },
    {
      id: '1',
      rank: 3,
      name: 'Elden Ring: Shadow of the Erdtree',
      slug: 'elden-ring-shadow-of-the-erdtree',
      coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co7vde.jpg',
      backdropUrl: 'https://images.igdb.com/igdb/image/upload/t_1080p/co7vde.jpg',
      communityScore: 95,
      criticScore: 96,
      weeklyEngagement: 8800,
      totalReviews: 3200,
      genres: ['Action RPG'],
      platforms: ['PC', 'PS5', 'Xbox Series X'],
    },
    {
      id: '5',
      rank: 4,
      name: 'Astro Bot',
      slug: 'astro-bot',
      coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co86v2.jpg',
      communityScore: 94,
      criticScore: 94,
      weeklyEngagement: 4500,
      totalReviews: 1200,
      genres: ['Plataformas 3D'],
      platforms: ['PS5'],
    },
  ],
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

/**
 * Tarjeta individual del Podio con efecto 3D Tilt y Glare especular
 */
function PodiumCard({
  game,
  badgeType,
}: {
  game: RankedGame;
  badgeType: 'gold' | 'silver' | 'bronze';
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const rotateX = useSpring(useTransform(mouseY, [0, 1], [9, -9]), {
    stiffness: 260,
    damping: 24,
  });
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-9, 9]), {
    stiffness: 260,
    damping: 24,
  });

  const glareX = useTransform(mouseX, [0, 1], [0, 100]);
  const glareY = useTransform(mouseY, [0, 1], [0, 100]);
  const glareBackground = useTransform(
    [glareX, glareY],
    ([x, y]) =>
      `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 65%)`,
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  const handleMouseLeave = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  // Configuración de metales para el podio
  const metalConfig = {
    gold: {
      border: 'border-amber-400/60 hover:border-amber-400',
      glow: 'shadow-[0_0_35px_rgba(251,191,36,0.22)]',
      gradient: 'from-amber-400 via-yellow-300 to-amber-500',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-400/50',
      rankText: 'text-amber-400',
      icon: Crown,
      label: 'Nº 1 Semanal',
    },
    silver: {
      border: 'border-slate-300/50 hover:border-slate-200',
      glow: 'shadow-[0_0_28px_rgba(203,213,225,0.18)]',
      gradient: 'from-slate-200 via-slate-100 to-slate-400',
      badgeBg: 'bg-slate-300/20 text-slate-200 border-slate-300/50',
      rankText: 'text-slate-300',
      icon: Medal,
      label: 'Nº 2 Semanal',
    },
    bronze: {
      border: 'border-amber-700/60 hover:border-amber-600',
      glow: 'shadow-[0_0_24px_rgba(180,83,9,0.18)]',
      gradient: 'from-amber-600 via-amber-500 to-amber-800',
      badgeBg: 'bg-amber-700/20 text-amber-300 border-amber-600/50',
      rankText: 'text-amber-500',
      icon: Award,
      label: 'Nº 3 Semanal',
    },
  }[badgeType];

  const MetalIcon = metalConfig.icon;

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="[perspective:900px] h-full"
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        className={`relative h-full flex flex-col rounded-3xl overflow-hidden glass-card border ${metalConfig.border} ${metalConfig.glow} transition-colors duration-300`}
      >
        {/* Poster Container */}
        <div className="relative aspect-[16/10] sm:aspect-[16/11] w-full overflow-hidden bg-brand-surface">
          {game.coverUrl ? (
            <img
              src={game.backdropUrl || game.coverUrl}
              alt={game.name}
              className="w-full h-full object-cover object-top transition-transform duration-500 hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-brand-card">
              <Gamepad2 className="w-12 h-12 text-brand-muted" />
            </div>
          )}

          {/* Dynamic Glare Reflection */}
          <motion.div
            style={{ background: glareBackground }}
            className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          />

          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-card via-transparent to-black/50" />

          {/* Rank Badge Header */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full backdrop-blur-md border text-xs font-black shadow-lg ${metalConfig.badgeBg}`}
            >
              <MetalIcon className="w-3.5 h-3.5" />
              <span>#{game.rank}</span>
            </div>

            {game.communityScore !== null && (
              <div className="backdrop-blur-md rounded-xl p-0.5 shadow-xl bg-brand-bg/60">
                <ScoreBadge score={game.communityScore} size="sm" />
              </div>
            )}
          </div>

          {/* Big Stylized Watermark Rank Number */}
          <span
            className={`absolute bottom-1 right-2 text-6xl sm:text-7xl font-black italic tracking-tighter opacity-15 select-none ${metalConfig.rankText}`}
          >
            0{game.rank}
          </span>
        </div>

        {/* Card Body */}
        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            {/* Platforms */}
            {game.platforms && game.platforms.length > 0 && (
              <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold text-brand-muted">
                {game.platforms.slice(0, 3).map((plat) => (
                  <span
                    key={plat}
                    className="px-2 py-0.5 rounded-md bg-brand-surface/80 border border-brand-border/60"
                  >
                    {plat}
                  </span>
                ))}
              </div>
            )}

            <Link href={`/games/${game.slug}`}>
              <h3 className="text-base sm:text-lg font-black text-white hover:text-brand-secondary transition-colors line-clamp-1">
                {game.name}
              </h3>
            </Link>

            {game.genres && game.genres.length > 0 && (
              <p className="text-xs text-brand-muted line-clamp-1">
                {game.genres.slice(0, 2).join(' • ')}
              </p>
            )}
          </div>

          {/* Engagement Footer */}
          <div className="pt-3 border-t border-brand-border/50 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
              <Flame className="w-4 h-4 fill-amber-400/20 text-amber-400 animate-pulse" />
              <span>
                {game.weeklyEngagement ? `${game.weeklyEngagement.toLocaleString()} jugando` : 'Muy popular'}
              </span>
            </div>

            <Link
              href={`/games/${game.slug}`}
              className="inline-flex items-center gap-1 text-xs font-bold text-brand-secondary hover:underline group"
            >
              <span>Ver ficha</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/**
 * Fila compacta para puestos 4 al 8/10
 */
function CompactRankRow({ game }: { game: RankedGame }) {
  return (
    <HoverLift>
      <Link
        href={`/games/${game.slug}`}
        className="glass-panel p-3.5 rounded-2xl border border-brand-border/60 hover:border-brand-secondary/40 flex items-center justify-between gap-3 group transition-all"
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Rank Number */}
          <span className="w-6 text-center text-sm font-black text-brand-muted group-hover:text-brand-secondary transition-colors">
            #{game.rank}
          </span>

          {/* Thumbnail */}
          <div className="w-10 h-14 rounded-lg overflow-hidden bg-brand-surface flex-shrink-0 border border-brand-border/40 relative">
            {game.coverUrl ? (
              <img src={game.coverUrl} alt={game.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Gamepad2 className="w-4 h-4 text-brand-muted" />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-black text-white group-hover:text-brand-secondary transition-colors truncate">
              {game.name}
            </h4>
            <div className="flex items-center gap-2 mt-0.5 text-[10px] text-brand-muted">
              {game.genres && game.genres[0] && <span>{game.genres[0]}</span>}
              {game.platforms && game.platforms[0] && (
                <>
                  <span>•</span>
                  <span>{game.platforms[0]}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Score & Arrow */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {game.communityScore !== null && (
            <ScoreBadge score={game.communityScore} size="sm" />
          )}
          <ChevronRight className="w-4 h-4 text-brand-muted group-hover:text-brand-secondary group-hover:translate-x-0.5 transition-all" />
        </div>
      </Link>
    </HoverLift>
  );
}

/**
 * Componente principal: Sección de Los Más Populares de la Semana
 */
export function WeeklyRankedSection() {
  const [activeTab, setActiveTab] = useState<'week' | 'month' | 'all_time'>('week');
  const [games, setGames] = useState<RankedGame[]>(FALLBACK_WEEKLY_GAMES.week);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    fetch(`${API_URL}/games/popular-weekly?timeframe=${activeTab}&limit=8`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!isMounted) return;
        if (json?.data && Array.isArray(json.data) && json.data.length > 0) {
          setGames(json.data);
        } else {
          setGames(FALLBACK_WEEKLY_GAMES[activeTab]);
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setGames(FALLBACK_WEEKLY_GAMES[activeTab]);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeTab]);

  const top3 = games.slice(0, 3);
  const restOfTop = games.slice(3, 8);

  const tabs = [
    { id: 'week', label: '🔥 Esta Semana', desc: 'Tendencia en los últimos 7 días' },
    { id: 'month', label: '📅 Este Mes', desc: 'Los más jugados del último mes' },
    { id: 'all_time', label: '🏆 Obras Maestras', desc: 'Las leyendas más valoradas' },
  ] as const;

  return (
    <section className="space-y-8 relative">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold tracking-wide">
            <Flame className="w-3.5 h-3.5 fill-amber-400" />
            <span>TOP COMUNITARIO EN VIVO</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight flex items-center gap-3">
            <span>Los Más Populares</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-brand-secondary to-brand-primary">
              de la Semana
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-brand-muted max-w-xl">
            Descubre los títulos con mayor tracción, registros en diario y debate comunitario.
          </p>
        </div>

        {/* Timeframe Selector Pills */}
        <div className="flex items-center p-1.5 rounded-2xl bg-brand-surface/90 border border-brand-border/80 backdrop-blur-md">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isActive ? 'text-brand-bg font-extrabold' : 'text-brand-muted hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="weeklyTimeframeTab"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    className="absolute inset-0 bg-gradient-to-r from-amber-400 to-brand-secondary rounded-xl shadow-md"
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Podium Grid (Top 3) */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="space-y-6"
        >
          {top3.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {top3[0] && <PodiumCard game={top3[0]} badgeType="gold" />}
              {top3[1] && <PodiumCard game={top3[1]} badgeType="silver" />}
              {top3[2] && <PodiumCard game={top3[2]} badgeType="bronze" />}
            </div>
          )}

          {/* Ranks 4 to 8/10 in Compact Rows */}
          {restOfTop.length > 0 && (
            <div className="pt-2">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-black text-brand-muted uppercase tracking-wider">
                  Continuación del Ranking (Posiciones 4 - {restOfTop.length + 3})
                </span>
                <Link
                  href="/games?sort=popular"
                  className="text-xs font-bold text-brand-secondary hover:underline flex items-center gap-1"
                >
                  <span>Explorar Top 100</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {restOfTop.map((game) => (
                  <CompactRankRow key={game.id} game={game} />
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
