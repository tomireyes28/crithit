'use client';

import React, { Suspense, useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { GameSummary } from '@crithit/shared';
import { GameCard } from '@/components/games/GameCard';
import { GameCardSkeleton } from '@/components/games/GameCardSkeleton';
import {
  Search,
  X,
  Flame,
  Star,
  Calendar,
  ArrowUpDown,
  Filter,
  Gamepad2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Loader2,
} from 'lucide-react';

interface GenreItem {
  id: string;
  name: string;
  slug: string;
}

interface PlatformItem {
  id: string;
  name: string;
  slug: string;
  abbreviation: string | null;
}

interface GamesApiResponse {
  data: GameSummary[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const SORT_OPTIONS = [
  { value: 'trending', label: 'En Tendencia', icon: Flame },
  { value: 'score', label: 'Mejor Puntuados', icon: Star },
  { value: 'release', label: 'Más Recientes', icon: Calendar },
  { value: 'name', label: 'Nombre (A-Z)', icon: ArrowUpDown },
] as const;

function GamesCatalog() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Estados de filtros derivados de la URL o por defecto
  const initialSearch = searchParams.get('search') || '';
  const initialGenre = searchParams.get('genre') || '';
  const initialPlatform = searchParams.get('platform') || '';
  const initialSort = searchParams.get('sort') || 'trending';
  const initialPage = Number(searchParams.get('page')) || 1;

  const [searchInput, setSearchInput] = useState(initialSearch);
  const [activeSearch, setActiveSearch] = useState(initialSearch);
  const [activeGenre, setActiveGenre] = useState(initialGenre);
  const [activePlatform, setActivePlatform] = useState(initialPlatform);
  const [activeSort, setActiveSort] = useState(initialSort);
  const [currentPage, setCurrentPage] = useState(initialPage);

  // Estados de datos
  const [games, setGames] = useState<GameSummary[]>([]);
  const [meta, setMeta] = useState<GamesApiResponse['meta']>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
  });
  const [genresList, setGenresList] = useState<GenreItem[]>([]);
  const [platformsList, setPlatformsList] = useState<PlatformItem[]>([]);

  // Estados de UI
  const [loading, setLoading] = useState(true);
  const [searchPending, setSearchPending] = useState(false);

  // Cargar lista dinámica de géneros y plataformas una sola vez
  useEffect(() => {
    async function fetchFilters() {
      try {
        const [genres, platforms] = await Promise.all([
          apiClient<GenreItem[]>('/games/genres').catch(() => []),
          apiClient<PlatformItem[]>('/games/platforms').catch(() => []),
        ]);
        if (genres && genres.length > 0) setGenresList(genres);
        if (platforms && platforms.length > 0) setPlatformsList(platforms);
      } catch (err) {
        console.error('Error al cargar filtros dinámicos:', err);
      }
    }
    fetchFilters();
  }, []);

  // Sincronizar estado local cuando cambian los query params de navegación (ej. botón Atrás del navegador)
  useEffect(() => {
    const s = searchParams.get('search') || '';
    const g = searchParams.get('genre') || '';
    const p = searchParams.get('platform') || '';
    const sort = searchParams.get('sort') || 'trending';
    const page = Number(searchParams.get('page')) || 1;

    setSearchInput(s);
    setActiveSearch(s);
    setActiveGenre(g);
    setActivePlatform(p);
    setActiveSort(sort);
    setCurrentPage(page);
  }, [searchParams]);

  // Debounce para la búsqueda en vivo
  useEffect(() => {
    if (searchInput === activeSearch) return;

    setSearchPending(true);
    const handler = setTimeout(() => {
      setActiveSearch(searchInput);
      setCurrentPage(1);
      updateUrl({ search: searchInput, page: 1 });
      setSearchPending(false);
    }, 400);

    return () => clearTimeout(handler);
  }, [searchInput]);

  // Función para actualizar la URL con los parámetros seleccionados
  const updateUrl = useCallback(
    (overrides: {
      search?: string;
      genre?: string;
      platform?: string;
      sort?: string;
      page?: number;
    }) => {
      const params = new URLSearchParams();

      const searchVal = overrides.search !== undefined ? overrides.search : activeSearch;
      const genreVal = overrides.genre !== undefined ? overrides.genre : activeGenre;
      const platformVal = overrides.platform !== undefined ? overrides.platform : activePlatform;
      const sortVal = overrides.sort !== undefined ? overrides.sort : activeSort;
      const pageVal = overrides.page !== undefined ? overrides.page : currentPage;

      if (searchVal.trim()) params.set('search', searchVal.trim());
      if (genreVal) params.set('genre', genreVal);
      if (platformVal) params.set('platform', platformVal);
      if (sortVal && sortVal !== 'trending') params.set('sort', sortVal);
      if (pageVal > 1) params.set('page', pageVal.toString());

      const qs = params.toString();
      router.push(`/games${qs ? `?${qs}` : ''}`);
    },
    [activeSearch, activeGenre, activePlatform, activeSort, currentPage, router],
  );

  // Consulta al backend para obtener los videojuegos
  const fetchGames = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (activeSearch.trim()) queryParams.set('search', activeSearch.trim());
      if (activeGenre) queryParams.set('genre', activeGenre);
      if (activePlatform) queryParams.set('platform', activePlatform);
      if (activeSort) queryParams.set('sort', activeSort);
      queryParams.set('page', currentPage.toString());
      queryParams.set('limit', '18');

      const response = await apiClient<GamesApiResponse>(`/games?${queryParams.toString()}`);
      setGames(response.data || []);
      setMeta(
        response.meta || {
          total: response.data?.length || 0,
          page: currentPage,
          limit: 18,
          totalPages: 1,
        },
      );
    } catch (err) {
      console.error('Error al obtener el catálogo de juegos:', err);
      setGames([]);
    } finally {
      setLoading(false);
    }
  }, [activeSearch, activeGenre, activePlatform, activeSort, currentPage]);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  // Handlers para interactuar con filtros
  const handleSortChange = (newSort: string) => {
    setActiveSort(newSort);
    setCurrentPage(1);
    updateUrl({ sort: newSort, page: 1 });
  };

  const handleGenreToggle = (genreSlug: string) => {
    const nextGenre = activeGenre === genreSlug ? '' : genreSlug;
    setActiveGenre(nextGenre);
    setCurrentPage(1);
    updateUrl({ genre: nextGenre, page: 1 });
  };

  const handlePlatformChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextPlatform = e.target.value;
    setActivePlatform(nextPlatform);
    setCurrentPage(1);
    updateUrl({ platform: nextPlatform, page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > meta.totalPages) return;
    setCurrentPage(newPage);
    updateUrl({ page: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setActiveSearch('');
    setActiveGenre('');
    setActivePlatform('');
    setActiveSort('trending');
    setCurrentPage(1);
    router.push('/games');
  };

  const isFiltered = Boolean(activeSearch || activeGenre || activePlatform || activeSort !== 'trending');

  return (
    <div className="space-y-8 pb-16">
      {/* Encabezado y Barra de Búsqueda Principal */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-brand-card/90 via-brand-surface/70 to-brand-bg border border-brand-border/60 shadow-xl overflow-hidden">
        {/* Glow de fondo */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-brand-secondary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-surface border border-brand-border/80 text-xs font-semibold text-brand-secondary shadow-glow-secondary">
            <Gamepad2 className="w-4 h-4" />
            <span>Catálogo Completo con Puntuación 0-100</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Explora Videojuegos
          </h1>

          <p className="text-sm sm:text-base text-brand-muted max-w-2xl mx-auto">
            Descubre títulos aclamados, lanzamientos recientes y joyas ocultas. Si buscas un juego que aún no está en la comunidad, lo traeremos al instante.
          </p>

          {/* Barra de Búsqueda Reactiva */}
          <div className="relative max-w-2xl mx-auto">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-brand-muted pointer-events-none" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Busca por nombre (ej. Elden Ring, Cyberpunk, Zelda, Silksong)..."
                className="w-full pl-12 pr-12 py-3.5 rounded-2xl bg-brand-bg/80 border border-brand-border/80 text-white placeholder-brand-muted/60 focus:outline-none focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20 shadow-inner transition-all duration-200"
              />
              {searchPending ? (
                <div className="absolute right-4 text-brand-secondary animate-spin">
                  <Loader2 className="w-5 h-5" />
                </div>
              ) : searchInput ? (
                <button
                  onClick={() => setSearchInput('')}
                  className="absolute right-4 p-1 rounded-full text-brand-muted hover:text-white hover:bg-brand-surface transition-colors"
                  title="Borrar búsqueda"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Filtros y Ordenamiento */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-brand-border/60 pb-4">
          {/* Pestañas de Ordenamiento */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-brand-surface/80 border border-brand-border/60 w-fit">
            {SORT_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isActive = activeSort === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => handleSortChange(opt.value)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-primary text-white shadow-glow-primary'
                      : 'text-brand-muted hover:text-white hover:bg-brand-card'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-brand-secondary' : ''}`} />
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>

          {/* Filtro por Plataforma y Botón Limpiar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-brand-muted" />
              <select
                value={activePlatform}
                onChange={handlePlatformChange}
                className="px-3 py-2 rounded-xl bg-brand-surface border border-brand-border/80 text-xs font-medium text-white focus:outline-none focus:border-brand-secondary cursor-pointer"
              >
                <option value="">Todas las plataformas</option>
                {platformsList.map((plat) => (
                  <option key={plat.id} value={plat.slug}>
                    {plat.name} {plat.abbreviation ? `(${plat.abbreviation})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {isFiltered && (
              <button
                onClick={handleClearFilters}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-xs font-medium text-red-400 hover:bg-red-500/20 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restablecer</span>
              </button>
            )}
          </div>
        </div>

        {/* Chips de Géneros */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-brand-border">
          <button
            onClick={() => handleGenreToggle('')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
              !activeGenre
                ? 'bg-white text-brand-bg font-bold shadow-sm'
                : 'bg-brand-surface border border-brand-border/60 text-brand-muted hover:text-white hover:border-brand-border'
            }`}
          >
            Todos los géneros
          </button>
          {genresList.map((genre) => {
            const isSelected = activeGenre === genre.slug;
            return (
              <button
                key={genre.id}
                onClick={() => handleGenreToggle(genre.slug)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  isSelected
                    ? 'bg-brand-secondary text-brand-bg font-bold shadow-glow-secondary'
                    : 'bg-brand-surface border border-brand-border/60 text-brand-muted hover:text-white hover:border-brand-border'
                }`}
              >
                {genre.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Barra de Estadísticas de Resultados */}
      <div className="flex items-center justify-between text-xs text-brand-muted">
        <span>
          {loading ? (
            'Buscando títulos...'
          ) : (
            <>
              Mostrando <strong className="text-white">{games.length}</strong> de{' '}
              <strong className="text-white">{meta.total}</strong> títulos encontrados
            </>
          )}
        </span>
        {meta.totalPages > 1 && (
          <span>
            Página <strong className="text-white">{currentPage}</strong> de{' '}
            <strong className="text-white">{meta.totalPages}</strong>
          </span>
        )}
      </div>

      {/* Grilla de Videojuegos o Skeletons */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {Array.from({ length: 12 }).map((_, idx) => (
            <GameCardSkeleton key={idx} />
          ))}
        </div>
      ) : games.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      ) : (
        /* Estado Vacío */
        <div className="rounded-3xl border border-dashed border-brand-border/80 bg-brand-surface/30 p-12 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-brand-card flex items-center justify-center mx-auto text-brand-muted border border-brand-border/60">
            <Gamepad2 className="w-8 h-8 text-brand-muted/60" />
          </div>
          <h3 className="text-xl font-bold text-white">No encontramos ningún juego</h3>
          <p className="text-sm text-brand-muted">
            {activeSearch
              ? `No se hallaron coincidencias para "${activeSearch}". Intenta con otro término o revisa la ortografía.`
              : 'No hay títulos disponibles con la combinación de filtros seleccionada.'}
          </p>
          <button
            onClick={handleClearFilters}
            className="px-5 py-2.5 rounded-xl bg-brand-primary text-white font-semibold text-xs hover:bg-brand-primary-hover shadow-glow-primary transition-all inline-flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Restablecer todos los filtros
          </button>
        </div>
      )}

      {/* Paginación */}
      {!loading && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-brand-surface border border-brand-border/60 text-xs font-semibold text-brand-muted hover:text-white hover:border-brand-secondary/40 disabled:opacity-30 disabled:pointer-events-none transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Anterior</span>
          </button>

          <div className="flex items-center gap-1 px-3 py-2 rounded-xl bg-brand-card border border-brand-border/60 text-xs font-mono text-zinc-300">
            <span className="text-brand-secondary font-bold">{currentPage}</span>
            <span className="text-brand-muted">/</span>
            <span>{meta.totalPages}</span>
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= meta.totalPages}
            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-brand-surface border border-brand-border/60 text-xs font-semibold text-brand-muted hover:text-white hover:border-brand-secondary/40 disabled:opacity-30 disabled:pointer-events-none transition-all"
          >
            <span>Siguiente</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function GamesPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-8 pb-16 animate-pulse">
          <div className="h-48 rounded-3xl bg-brand-card/50 border border-brand-border/40" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {Array.from({ length: 12 }).map((_, idx) => (
              <GameCardSkeleton key={idx} />
            ))}
          </div>
        </div>
      }
    >
      <GamesCatalog />
    </Suspense>
  );
}
