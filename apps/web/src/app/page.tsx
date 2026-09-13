'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ScoreSlider } from '@/components/ui/ScoreSlider';
import { ScoreBadge } from '@/components/ui/ScoreBadge';
import {
  Sparkles,
  Award,
  BookOpen,
  Users,
  Compass,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

// Juegos de ejemplo para la preview inicial
const FEATURED_GAMES = [
  {
    id: '1',
    name: 'Elden Ring: Shadow of the Erdtree',
    slug: 'elden-ring-shadow-of-the-erdtree',
    cover: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co7vde.jpg',
    communityScore: 94,
    criticScore: 96,
    year: 2024,
    genres: ['RPG', 'Acción'],
  },
  {
    id: '2',
    name: 'Black Myth: Wukong',
    slug: 'black-myth-wukong',
    cover: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co8j9a.jpg',
    communityScore: 89,
    criticScore: 82,
    year: 2024,
    genres: ['Acción', 'Aventura'],
  },
  {
    id: '3',
    name: 'Hades II',
    slug: 'hades-ii',
    cover: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5zpp.jpg',
    communityScore: 92,
    criticScore: 90,
    year: 2024,
    genres: ['Roguelike', 'Indie'],
  },
  {
    id: '4',
    name: 'Metaphor: ReFantazio',
    slug: 'metaphor-refantazio',
    cover: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co6s98.jpg',
    communityScore: 91,
    criticScore: 93,
    year: 2024,
    genres: ['JRPG', 'Estrategia'],
  },
];

export default function HomePage() {
  const [demoScore, setDemoScore] = useState<number>(88);

  return (
    <div className="space-y-20 py-4">
      {/* Hero Section */}
      <section className="relative text-center max-w-4xl mx-auto space-y-8 pt-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-surface border border-brand-border text-xs font-semibold text-brand-secondary shadow-glow-secondary">
          <Sparkles className="w-3.5 h-3.5" />
          <span>El nuevo estándar para la crítica y registro de videojuegos</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-tight">
          Lleva tu diario gamer.
          <br />
          Puntúa del <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-secondary via-brand-primary to-brand-tertiary">0 al 100</span>.
        </h1>

        <p className="text-lg sm:text-xl text-brand-muted max-w-2xl mx-auto leading-relaxed">
          Basta de 5 estrellas o notas simplistas. En <strong>CritHit</strong> registras lo que juegas,
          evalúas con precisión milimétrica, ganas tu acreditación de crítico certificado y compartes tu pasión.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            href="/register"
            className="px-7 py-3.5 rounded-xl font-bold text-white bg-brand-primary hover:bg-brand-primary-hover shadow-glow-primary transition-all flex items-center gap-2"
          >
            Comenzar Gratis
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/games"
            className="px-7 py-3.5 rounded-xl font-bold text-brand-text bg-brand-card hover:bg-brand-surface border border-brand-border transition-all flex items-center gap-2"
          >
            <Compass className="w-4 h-4 text-brand-secondary" />
            Explorar Catálogo
          </Link>
        </div>
      </section>

      {/* Interactive Scoring Demo Section */}
      <section className="max-w-2xl mx-auto bg-gradient-to-b from-brand-card to-brand-surface/30 p-1 rounded-3xl border border-brand-border shadow-2xl">
        <div className="p-4 sm:p-6 space-y-4">
          <div className="text-center space-y-1 mb-6">
            <span className="text-xs uppercase font-mono tracking-widest text-brand-secondary font-bold">
              Proba el Diferencial
            </span>
            <h3 className="text-2xl font-black text-white">
              Slider de Puntuación Granular (0 a 100)
            </h3>
            <p className="text-xs text-brand-muted">
              Desliza para ver la adaptación de color dinámico y banda de crítica en tiempo real.
            </p>
          </div>

          <ScoreSlider initialValue={demoScore} onChange={setDemoScore} />
        </div>
      </section>

      {/* Featured / Trending Games Showcase */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-brand-primary" />
            <h2 className="text-2xl font-black text-white">Juegos en Tendencia</h2>
          </div>
          <Link
            href="/games"
            className="text-xs font-semibold text-brand-secondary hover:underline flex items-center gap-1"
          >
            Ver todos los juegos <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {FEATURED_GAMES.map((game) => (
            <div
              key={game.id}
              className="group bg-brand-card border border-brand-border rounded-2xl overflow-hidden hover:border-brand-primary/60 transition-all duration-300 flex flex-col shadow-lg hover:shadow-glow-primary"
            >
              {/* Cover with aspect ratio */}
              <div className="relative aspect-[3/4] bg-brand-surface overflow-hidden">
                <img
                  src={game.cover}
                  alt={game.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2.5 right-2.5">
                  <ScoreBadge score={game.communityScore} size="sm" />
                </div>
              </div>

              {/* Game Info */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between text-[11px] text-brand-muted font-medium mb-1">
                    <span>{game.year}</span>
                    <span>{game.genres.join(' • ')}</span>
                  </div>
                  <h3 className="font-bold text-sm text-white group-hover:text-brand-secondary transition-colors line-clamp-1">
                    {game.name}
                  </h3>
                </div>

                <div className="pt-2 border-t border-brand-border/40 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-brand-muted text-[11px]">Críticos:</span>
                    <ScoreBadge score={game.criticScore} size="sm" />
                  </div>
                  <span className="text-[11px] text-brand-muted font-mono">
                    {game.communityScore}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Pillars Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        <div className="bg-brand-card border border-brand-border p-6 rounded-2xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-brand-primary/20 border border-brand-primary/40 flex items-center justify-center text-brand-primary">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Escala Granular 0-100</h3>
          <p className="text-sm text-brand-muted leading-relaxed">
            ¿Un 7.5 no alcanza a expresar lo que sentiste? Usa una escala continua y justa del 0 al 100 con histogramas de distribución completos.
          </p>
        </div>

        <div className="bg-brand-card border border-brand-border p-6 rounded-2xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-brand-secondary/20 border border-brand-secondary/40 flex items-center justify-center text-brand-secondary">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Críticos Verificados con Examen</h3>
          <p className="text-sm text-brand-muted leading-relaxed">
            Rinde el test de acreditación para validar tu criterio sobre diseño, historia y análisis. Gana tu insignia y haz que tu voz cuente en el Critic Score.
          </p>
        </div>

        <div className="bg-brand-card border border-brand-border p-6 rounded-2xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-brand-tertiary/20 border border-brand-tertiary/40 flex items-center justify-center text-brand-tertiary">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Diario, Backlog & Horas</h3>
          <p className="text-sm text-brand-muted leading-relaxed">
            Organiza tu biblioteca en Jugando, Completado, 100% / Mastered y Backlog. Registra las horas dedicadas e importa tu progreso.
          </p>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="bg-gradient-to-r from-brand-surface via-brand-card to-brand-surface border border-brand-primary/40 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-glow-primary">
        <h2 className="text-3xl sm:text-4xl font-black text-white">
          ¿Listo para unirte a la nueva era de la crítica gaming?
        </h2>
        <p className="text-brand-muted max-w-xl mx-auto text-sm sm:text-base">
          Crea tu perfil en segundos, pinnea tus 4 juegos favoritos en tu vitrina y comienza a calificar con precisión.
        </p>
        <Link
          href="/register"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white bg-brand-primary hover:bg-brand-primary-hover shadow-glow-primary transition-all text-base"
        >
          <Users className="w-5 h-5" />
          Crear mi Perfil en CritHit
        </Link>
      </section>
    </div>
  );
}
