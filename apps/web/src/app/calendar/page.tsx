'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ListFilter,
  Grid,
  List,
  Sparkles,
  Gamepad2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { ScoreBadge } from '@/components/ui/ScoreBadge';

interface CalendarPlatform {
  id: string;
  name: string;
  slug: string;
  abbreviation?: string | null;
}

interface CalendarGame {
  id: string;
  slug: string;
  name: string;
  summary?: string | null;
  coverUrl?: string | null;
  backdropUrl?: string | null;
  firstReleaseDate: string;
  communityScore?: number | null;
  criticScore?: number | null;
  metacriticScore?: number | null;
  genres?: string[];
  platforms?: CalendarPlatform[];
}

const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const PLATFORM_FILTERS = [
  { id: 'all', label: 'Todas' },
  { id: 'pc', label: 'PC' },
  { id: 'playstation5', label: 'PS5' },
  { id: 'xbox-series-x', label: 'Xbox' },
  { id: 'nintendo-switch', label: 'Switch' },
];

export default function CalendarPage() {
  const today = new Date();
  const [year, setYear] = useState<number>(today.getFullYear());
  const [month, setMonth] = useState<number>(today.getMonth() + 1); // 1-12
  const [platform, setPlatform] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'timeline' | 'grid'>('timeline');
  const [games, setGames] = useState<CalendarGame[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Cargar juegos del mes
  useEffect(() => {
    const fetchCalendarGames = async () => {
      setIsLoading(true);
      try {
        const platParam = platform !== 'all' ? `&platform=${platform}` : '';
        const data = await apiClient<CalendarGame[]>(
          `/games/calendar?year=${year}&month=${month}${platParam}`
        );
        setGames(data || []);
      } catch (err) {
        console.error('Error fetching calendar games:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCalendarGames();
  }, [year, month, platform]);

  const handlePrevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const handleCurrentMonth = () => {
    setYear(today.getFullYear());
    setMonth(today.getMonth() + 1);
  };

  // Agrupar juegos por día del mes
  const gamesByDay = games.reduce((acc, game) => {
    const d = new Date(game.firstReleaseDate);
    const dayNum = d.getUTCDate();
    if (!acc[dayNum]) acc[dayNum] = [];
    acc[dayNum].push(game);
    return acc;
  }, {} as Record<number, CalendarGame[]>);

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayWeekday = (new Date(year, month - 1, 1).getDay() + 6) % 7; // Lunes = 0

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Cabecera Principal */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-brand-border/60">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-brand-primary uppercase tracking-wider mb-1">
              <CalendarIcon className="w-4 h-4" />
              Lanzamientos & Estrenos
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Calendario de Videojuegos
            </h1>
            <p className="text-xs sm:text-sm text-brand-muted mt-1">
              Planifica tu agenda gamer y descubre cuándo se estrenan tus próximos títulos favoritos
            </p>
          </div>

          {/* Selector de Meses */}
          <div className="flex items-center gap-3 bg-brand-surface border border-brand-border/80 p-1.5 rounded-2xl shadow-lg">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-xl text-brand-muted hover:text-white hover:bg-brand-card transition-all"
              title="Mes Anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={handleCurrentMonth}
              className="px-4 py-1 text-center font-black text-white text-base hover:text-brand-primary transition-colors min-w-[170px]"
            >
              {MONTH_NAMES[month - 1]} {year}
            </button>

            <button
              onClick={handleNextMonth}
              className="p-2 rounded-xl text-brand-muted hover:text-white hover:bg-brand-card transition-all"
              title="Mes Siguiente"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Barra de Filtros y Selector de Modo de Vista */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Filtros de Plataforma */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 w-full sm:w-auto">
            {PLATFORM_FILTERS.map((pf) => (
              <button
                key={pf.id}
                onClick={() => setPlatform(pf.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  platform === pf.id
                    ? 'bg-brand-primary text-brand-bg shadow-md shadow-brand-primary/20'
                    : 'bg-brand-surface/60 text-brand-muted hover:text-white border border-brand-border/60 hover:bg-brand-surface'
                }`}
              >
                {pf.label}
              </button>
            ))}
          </div>

          {/* Toggle de Vista: Línea de Tiempo vs Cuadrícula */}
          <div className="flex items-center gap-1 bg-brand-surface/80 p-1 rounded-xl border border-brand-border/60 self-end sm:self-auto">
            <button
              onClick={() => setViewMode('timeline')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'timeline'
                  ? 'bg-brand-card text-white shadow-sm'
                  : 'text-brand-muted hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              Línea de Tiempo
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'grid'
                  ? 'bg-brand-card text-white shadow-sm'
                  : 'text-brand-muted hover:text-white'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              Cuadrícula
            </button>
          </div>
        </div>

        {/* Contenido Principal */}
        {isLoading ? (
          <div className="py-28 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold text-brand-muted">
              Cargando lanzamientos de {MONTH_NAMES[month - 1]}...
            </span>
          </div>
        ) : games.length === 0 ? (
          <div className="p-16 rounded-3xl bg-brand-surface/40 border border-brand-border/60 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-surface border border-brand-border/80 flex items-center justify-center text-brand-muted shadow-md">
              <CalendarIcon className="w-7 h-7 opacity-50" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                No hay lanzamientos registrados en {MONTH_NAMES[month - 1]} de {year}
              </h3>
              <p className="text-xs text-brand-muted max-w-sm mt-1">
                Prueba cambiando de mes o eliminando los filtros de plataforma para ver otros estrenos.
              </p>
            </div>
            <button
              onClick={() => {
                setPlatform('all');
                setYear(2024);
                setMonth(9);
              }}
              className="px-4 py-2 rounded-xl bg-brand-surface hover:bg-brand-surface/80 border border-brand-border text-xs font-bold text-brand-primary transition-all"
            >
              Ver Septiembre 2024
            </button>
          </div>
        ) : viewMode === 'timeline' ? (
          /* ══════════════════════════════════════════════════════════
             VISTA 1: LÍNEA DE TIEMPO (TIMELINE LIST)
             ══════════════════════════════════════════════════════════ */
          <div className="space-y-6">
            {Object.keys(gamesByDay)
              .map(Number)
              .sort((a, b) => a - b)
              .map((day) => {
                const dayGames = gamesByDay[day];
                const dateObj = new Date(Date.UTC(year, month - 1, day));
                const dayName = dateObj.toLocaleDateString('es-ES', { weekday: 'long', timeZone: 'UTC' });

                return (
                  <div key={day} className="flex flex-col md:flex-row gap-4 items-start">
                    {/* Badge de Día */}
                    <div className="md:w-36 flex-shrink-0 flex md:flex-col items-baseline md:items-start gap-2 md:gap-0 sticky top-20 bg-brand-bg/90 backdrop-blur-sm py-1 z-10">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl sm:text-3xl font-black text-white">
                          {day}
                        </span>
                        <span className="text-xs font-bold text-brand-primary uppercase tracking-wider">
                          {MONTH_NAMES[month - 1].slice(0, 3)}
                        </span>
                      </div>
                      <span className="text-xs text-brand-muted font-medium capitalize">
                        {dayName}
                      </span>
                    </div>

                    {/* Tarjetas de Juegos de ese día */}
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                      {dayGames.map((game) => (
                        <Link
                          key={game.id}
                          href={`/games/${game.slug}`}
                          className="p-3.5 rounded-2xl bg-brand-surface/70 hover:bg-brand-surface border border-brand-border/70 hover:border-brand-primary/40 transition-all flex gap-3.5 group shadow-sm"
                        >
                          {/* Póster vertical */}
                          <div className="w-16 h-22 rounded-xl bg-brand-card overflow-hidden relative flex-shrink-0 border border-brand-border/60">
                            {game.coverUrl ? (
                              <Image
                                src={game.coverUrl}
                                alt={game.name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-brand-muted">
                                <Gamepad2 className="w-6 h-6 opacity-40" />
                              </div>
                            )}
                          </div>

                          {/* Info del Juego */}
                          <div className="min-w-0 flex-1 flex flex-col justify-between">
                            <div>
                              <h4 className="text-sm font-bold text-white group-hover:text-brand-primary transition-colors truncate">
                                {game.name}
                              </h4>

                              {/* Plataformas */}
                              <div className="flex items-center gap-1 mt-1 flex-wrap">
                                {game.platforms?.slice(0, 3).map((p) => (
                                  <span
                                    key={p.id}
                                    className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-brand-card text-brand-muted border border-brand-border/60"
                                  >
                                    {p.abbreviation || p.name}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Puntuación si ya está disponible */}
                            <div className="pt-2 flex items-center justify-between text-xs">
                              {game.communityScore !== null && game.communityScore !== undefined ? (
                                <ScoreBadge score={game.communityScore} size="sm" showLabel={false} />
                              ) : (
                                <span className="text-[10px] text-brand-secondary font-bold flex items-center gap-1">
                                  <Sparkles className="w-3 h-3" />
                                  Próximo Estreno
                                </span>
                              )}
                              <ArrowRight className="w-3.5 h-3.5 text-brand-muted group-hover:text-brand-primary transition-transform group-hover:translate-x-0.5" />
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          /* ══════════════════════════════════════════════════════════
             VISTA 2: CUADRÍCULA MENSUAL (MONTH GRID)
             ══════════════════════════════════════════════════════════ */
          <div className="rounded-3xl border border-brand-border/80 bg-brand-surface/60 overflow-hidden shadow-2xl">
            {/* Cabecera de días de la semana */}
            <div className="grid grid-cols-7 border-b border-brand-border/60 bg-brand-card/70 text-center py-2 text-xs font-bold text-brand-muted">
              <span>Lun</span>
              <span>Mar</span>
              <span>Mié</span>
              <span>Jue</span>
              <span>Vie</span>
              <span>Sáb</span>
              <span>Dom</span>
            </div>

            {/* Días del Mes */}
            <div className="grid grid-cols-7 divide-x divide-y divide-brand-border/40">
              {/* Celdas vacías previas al día 1 */}
              {Array.from({ length: firstDayWeekday }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-[100px] p-2 bg-brand-bg/30" />
              ))}

              {/* Días del mes */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const dayGames = gamesByDay[dayNum] || [];
                const isToday =
                  today.getFullYear() === year &&
                  today.getMonth() + 1 === month &&
                  today.getDate() === dayNum;

                return (
                  <div
                    key={dayNum}
                    className={`min-h-[110px] p-2 flex flex-col justify-between transition-colors ${
                      isToday
                        ? 'bg-brand-primary/5'
                        : dayGames.length > 0
                        ? 'bg-brand-surface/80 hover:bg-brand-surface'
                        : 'bg-brand-bg/20'
                    }`}
                  >
                    {/* Número del día */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                          isToday
                            ? 'bg-brand-primary text-brand-bg font-black'
                            : 'text-brand-muted'
                        }`}
                      >
                        {dayNum}
                      </span>
                      {dayGames.length > 0 && (
                        <span className="text-[10px] font-bold text-brand-primary">
                          {dayGames.length} {dayGames.length === 1 ? 'juego' : 'juegos'}
                        </span>
                      )}
                    </div>

                    {/* Miniaturas de Juegos */}
                    <div className="space-y-1 mt-1 flex-1">
                      {dayGames.slice(0, 2).map((g) => (
                        <Link
                          key={g.id}
                          href={`/games/${g.slug}`}
                          className="block p-1 rounded-md bg-brand-card hover:bg-brand-primary/20 border border-brand-border/60 text-[11px] font-medium text-white truncate transition-colors"
                          title={g.name}
                        >
                          {g.name}
                        </Link>
                      ))}
                      {dayGames.length > 2 && (
                        <span className="text-[10px] font-bold text-brand-muted block pl-1">
                          +{dayGames.length - 2} más
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
