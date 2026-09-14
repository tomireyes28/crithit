'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ScoreSlider } from '@/components/ui/ScoreSlider';
import { ScoreBadge } from '@/components/ui/ScoreBadge';
import { GameCard } from '@/components/games/GameCard';
import { FadeIn, StaggerContainer, StaggerItem, HoverLift } from '@/components/ui/MotionWrapper';
import {
  Sparkles,
  Award,
  BookOpen,
  Users,
  Compass,
  ArrowRight,
  TrendingUp,
  MessageSquare,
  Clock,
  Gamepad2,
  ThumbsUp,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

const FEATURED_GAMES_FALLBACK = [
  {
    id: '1',
    name: 'Elden Ring: Shadow of the Erdtree',
    slug: 'elden-ring-shadow-of-the-erdtree',
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co7vde.jpg',
    communityScore: 94,
    criticScore: 96,
    firstReleaseDate: '2024-06-21',
    genres: ['RPG', 'Acción'],
    platforms: ['PC', 'PS5', 'Xbox Series X'],
  },
  {
    id: '2',
    name: 'Black Myth: Wukong',
    slug: 'black-myth-wukong',
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co8j9a.jpg',
    communityScore: 89,
    criticScore: 82,
    firstReleaseDate: '2024-08-20',
    genres: ['Acción', 'Aventura'],
    platforms: ['PC', 'PS5'],
  },
  {
    id: '3',
    name: 'Hades II',
    slug: 'hades-ii',
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5zpp.jpg',
    communityScore: 92,
    criticScore: 90,
    firstReleaseDate: '2024-05-06',
    genres: ['Roguelike', 'Indie'],
    platforms: ['PC'],
  },
  {
    id: '4',
    name: 'Metaphor: ReFantazio',
    slug: 'metaphor-refantazio',
    coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co6s98.jpg',
    communityScore: 91,
    criticScore: 93,
    firstReleaseDate: '2024-10-11',
    genres: ['JRPG', 'Estrategia'],
    platforms: ['PC', 'PS5', 'Xbox Series X'],
  },
];

export default function HomePage() {
  const [demoScore, setDemoScore] = useState<number>(88);
  const [trendingGames, setTrendingGames] = useState<any[]>(FEATURED_GAMES_FALLBACK);
  const [recentReviews, setRecentReviews] = useState<any[]>([]);

  useEffect(() => {
    // Fetch live trending games
    fetch(`${API_URL}/games?limit=4&sort=popular`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.items && data.items.length > 0) {
          setTrendingGames(data.items);
        }
      })
      .catch(() => {});

    // Fetch live recent reviews
    fetch(`${API_URL}/reviews?limit=3&sort=recent`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.items && data.items.length > 0) {
          setRecentReviews(data.items);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-24 py-6 relative">
      {/* Decorative ambient background glows */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-brand-primary/15 via-brand-secondary/10 to-brand-tertiary/15 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Hero Section */}
      <FadeIn className="text-center max-w-4xl mx-auto space-y-8 pt-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-surface/80 border border-brand-border/80 text-xs font-semibold text-brand-secondary shadow-glow-secondary backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5" />
          <span>El nuevo estándar para la crítica y registro de videojuegos</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-tight">
          Lleva tu diario gamer.
          <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-secondary via-brand-primary to-brand-tertiary">
            Puntúa del 0 al 100.
          </span>
        </h1>

        <p className="text-base sm:text-xl text-brand-muted max-w-2xl mx-auto leading-relaxed">
          Escribe reseñas sinceras, sigue a la comunidad, acredita tu criterio crítico y descubre qué jugar a continuación en una sola plataforma.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <HoverLift>
            <Link
              href="/games"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white bg-brand-primary hover:bg-brand-primary-hover shadow-glow-primary transition-all text-sm sm:text-base"
            >
              <Compass className="w-5 h-5" />
              Explorar Catálogo
            </Link>
          </HoverLift>
          <HoverLift>
            <Link
              href="/critics"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-brand-text bg-brand-surface/80 hover:bg-brand-surface border border-brand-border/80 hover:border-brand-secondary/40 transition-all text-sm sm:text-base backdrop-blur-md"
            >
              <Award className="w-5 h-5 text-brand-secondary" />
              Acreditación de Críticos
            </Link>
          </HoverLift>
        </div>
      </FadeIn>

      {/* Interactive Score Slider Demo */}
      <FadeIn delay={0.1} className="max-w-2xl mx-auto glass-panel p-6 sm:p-8 rounded-3xl border border-brand-border/60 shadow-2xl space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-secondary" />
              La Granularidad Importa
            </h2>
            <p className="text-xs text-brand-muted mt-0.5">
              Prueba la escala 0-100 continua en vivo. Sin estrellas rígidas.
            </p>
          </div>
          <ScoreBadge score={demoScore} size="lg" showLabel />
        </div>

        <ScoreSlider value={demoScore} onChange={setDemoScore} />
      </FadeIn>

      {/* Featured Games Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-brand-secondary" />
            <h2 className="text-xl sm:text-2xl font-black text-white">
              En Tendencia esta Semana
            </h2>
          </div>
          <Link
            href="/games?sort=popular"
            className="text-xs sm:text-sm font-semibold text-brand-secondary hover:underline flex items-center gap-1"
          >
            Ver catálogo completo
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <StaggerContainer className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          {trendingGames.map((game) => (
            <StaggerItem key={game.id}>
              <GameCard game={game} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* Live Community Reviews Section */}
      {recentReviews.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-brand-tertiary" />
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Últimas Reseñas de la Comunidad
              </h2>
            </div>
            <Link
              href="/reviews"
              className="text-xs sm:text-sm font-semibold text-brand-secondary hover:underline flex items-center gap-1"
            >
              Ver todas las reseñas
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentReviews.map((rev) => (
              <HoverLift key={rev.id}>
                <div className="glass-panel p-5 rounded-2xl border border-brand-border/60 hover:border-brand-border transition-all flex flex-col justify-between h-full space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <Link
                        href={`/profile/${rev.user?.username}`}
                        className="flex items-center gap-2 min-w-0"
                      >
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center text-xs font-bold text-white uppercase overflow-hidden flex-shrink-0">
                          {rev.user?.avatarUrl ? (
                            <img src={rev.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            (rev.user?.displayName || 'U')[0]
                          )}
                        </div>
                        <span className="text-xs font-bold text-white hover:text-brand-secondary transition-colors truncate">
                          {rev.user?.displayName || rev.user?.username}
                        </span>
                      </Link>
                      <ScoreBadge score={rev.score} size="sm" />
                    </div>

                    {rev.game && (
                      <Link
                        href={`/games/${rev.game.slug}`}
                        className="flex items-center gap-2.5 p-2 rounded-xl bg-brand-bg/60 border border-brand-border/40 hover:border-brand-secondary/40 transition-colors"
                      >
                        {rev.game.coverUrl ? (
                          <img src={rev.game.coverUrl} alt="" className="w-7 h-9 rounded object-cover flex-shrink-0" />
                        ) : (
                          <Gamepad2 className="w-5 h-5 text-brand-muted" />
                        )}
                        <span className="text-xs font-bold text-white truncate">
                          {rev.game.name}
                        </span>
                      </Link>
                    )}

                    {rev.title && (
                      <h4 className="text-xs font-bold text-white line-clamp-1">
                        {rev.title}
                      </h4>
                    )}

                    {rev.body && (
                      <p className="text-xs text-brand-muted line-clamp-3 leading-relaxed">
                        {rev.body}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-brand-border/30 flex items-center justify-between text-[11px] text-brand-muted">
                    {rev.playedHours !== null && rev.playedHours !== undefined ? (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-brand-secondary" />
                        {rev.playedHours}h
                      </span>
                    ) : (
                      <span />
                    )}
                    {rev.recommends !== null && rev.recommends !== undefined && (
                      <span className={`flex items-center gap-1 font-semibold ${rev.recommends ? 'text-emerald-400' : 'text-rose-400'}`}>
                        <ThumbsUp className={`w-3 h-3 ${!rev.recommends ? 'rotate-180' : ''}`} />
                        {rev.recommends ? 'Recomendado' : 'No recomendado'}
                      </span>
                    )}
                  </div>
                </div>
              </HoverLift>
            ))}
          </div>
        </section>
      )}

      {/* Feature Pillars Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <HoverLift>
          <div className="glass-panel p-6 rounded-2xl border border-brand-border/60 space-y-3 h-full">
            <div className="w-10 h-10 rounded-xl bg-brand-primary/20 border border-brand-primary/40 flex items-center justify-center text-brand-primary">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Escala Granular 0-100</h3>
            <p className="text-sm text-brand-muted leading-relaxed">
              ¿Un 7.5 no alcanza a expresar lo que sentiste? Usa una escala continua y justa del 0 al 100 con histogramas de distribución completos.
            </p>
          </div>
        </HoverLift>

        <HoverLift>
          <div className="glass-panel p-6 rounded-2xl border border-brand-border/60 space-y-3 h-full">
            <div className="w-10 h-10 rounded-xl bg-brand-secondary/20 border border-brand-secondary/40 flex items-center justify-center text-brand-secondary">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Críticos Verificados con Examen</h3>
            <p className="text-sm text-brand-muted leading-relaxed">
              Rinde el test de acreditación para validar tu criterio sobre diseño, historia y análisis. Gana tu insignia y haz que tu voz cuente en el Critic Score.
            </p>
          </div>
        </HoverLift>

        <HoverLift>
          <div className="glass-panel p-6 rounded-2xl border border-brand-border/60 space-y-3 h-full">
            <div className="w-10 h-10 rounded-xl bg-brand-tertiary/20 border border-brand-tertiary/40 flex items-center justify-center text-brand-tertiary">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Diario, Backlog & Horas</h3>
            <p className="text-sm text-brand-muted leading-relaxed">
              Organiza tu biblioteca en Jugando, Completado, 100% / Mastered y Backlog. Registra las horas dedicadas e importa tu progreso.
            </p>
          </div>
        </HoverLift>
      </section>

      {/* Final Call to Action */}
      <FadeIn className="relative overflow-hidden bg-gradient-to-r from-brand-surface via-brand-card to-brand-surface border border-brand-primary/40 rounded-3xl p-8 sm:p-14 text-center space-y-6 shadow-glow-primary">
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-brand-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-brand-secondary/20 rounded-full blur-3xl pointer-events-none" />

        <h2 className="text-3xl sm:text-4xl font-black text-white relative z-10">
          ¿Listo para unirte a la nueva era de la crítica gaming?
        </h2>
        <p className="text-brand-muted max-w-xl mx-auto text-sm sm:text-base relative z-10">
          Crea tu perfil en segundos, pinnea tus 4 juegos favoritos en tu vitrina y comienza a calificar con precisión.
        </p>
        <div className="pt-2 relative z-10">
          <HoverLift>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white bg-brand-primary hover:bg-brand-primary-hover shadow-glow-primary transition-all text-base"
            >
              <Users className="w-5 h-5" />
              Crear mi Perfil en CritHit
            </Link>
          </HoverLift>
        </div>
      </FadeIn>
    </div>
  );
}
