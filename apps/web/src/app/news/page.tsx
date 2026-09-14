'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Newspaper,
  Search,
  ExternalLink,
  Calendar,
  Sparkles,
  Tag,
  ChevronLeft,
  ChevronRight,
  Flame,
  Gamepad2,
  Bookmark,
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { NewsCardSkeleton } from '@/components/news/NewsCardSkeleton';

interface RelatedGame {
  id: string;
  name: string;
  slug: string;
  coverUrl?: string | null;
  communityScore?: number | null;
}

interface NewsArticleItem {
  id: string;
  title: string;
  summary?: string | null;
  url: string;
  imageUrl?: string | null;
  sourceName: string;
  sourceUrl?: string | null;
  category?: 'RELEASE' | 'ANNOUNCEMENT' | 'REVIEW' | 'UPDATE_PATCH' | 'DEAL' | 'EVENT' | 'OPINION' | null;
  publishedAt: string;
  games?: RelatedGame[];
}

interface NewsResponse {
  articles: NewsArticleItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const CATEGORIES = [
  { id: 'ALL', label: 'Todas' },
  { id: 'ANNOUNCEMENT', label: 'Anuncios', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { id: 'RELEASE', label: 'Lanzamientos', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  { id: 'UPDATE_PATCH', label: 'Actualizaciones', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  { id: 'REVIEW', label: 'Críticas', color: 'bg-brand-primary/20 text-brand-primary border-brand-primary/30' },
  { id: 'EVENT', label: 'Eventos', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  { id: 'DEAL', label: 'Ofertas', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
  { id: 'OPINION', label: 'Opinión', color: 'bg-teal-500/20 text-teal-400 border-teal-500/30' },
];

export default function NewsPage() {
  const [featured, setFeatured] = useState<NewsArticleItem | null>(null);
  const [articles, setArticles] = useState<NewsArticleItem[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [category, setCategory] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Cargar noticia destacada
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const feat = await apiClient<NewsArticleItem>('/news/featured');
        setFeatured(feat);
      } catch (err) {
        console.error('Error fetching featured news:', err);
      }
    };
    fetchFeatured();
  }, []);

  // Cargar noticias con filtros
  useEffect(() => {
    const fetchArticles = async () => {
      setIsLoading(true);
      try {
        const catQuery = category !== 'ALL' ? `&category=${category}` : '';
        const searchQuery = debouncedSearch ? `&search=${encodeURIComponent(debouncedSearch)}` : '';
        const res = await apiClient<NewsResponse>(
          `/news?page=${page}&limit=9${catQuery}${searchQuery}`
        );
        setArticles(res.articles || []);
        setTotalPages(res.totalPages || 1);
      } catch (err) {
        console.error('Error fetching news:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchArticles();
  }, [page, category, debouncedSearch]);

  const formatTimeAgo = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - d.getTime()) / (1000 * 3600));

    if (diffHours < 1) return 'hace unos minutos';
    if (diffHours < 24) return `hace ${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `hace ${diffDays}d`;
    return d.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
  };

  const getCategoryBadgeClass = (cat?: string | null) => {
    const found = CATEGORIES.find((c) => c.id === cat);
    return found?.color || 'bg-brand-surface text-brand-muted border-brand-border';
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Cabecera Principal */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-brand-border/60">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-brand-primary uppercase tracking-wider mb-1">
              <Newspaper className="w-4 h-4" />
              Actualidad & Cobertura
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Noticias de Videojuegos
            </h1>
            <p className="text-xs sm:text-sm text-brand-muted mt-1">
              El pulso de la industria, anuncios, parches y lanzamientos destacados
            </p>
          </div>

          {/* Barra de Búsqueda */}
          <div className="relative w-full md:w-72">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar noticias..."
              className="w-full bg-brand-surface border border-brand-border/80 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-brand-muted focus:outline-none focus:border-brand-primary transition-all"
            />
            <Search className="w-4 h-4 text-brand-muted absolute left-3.5 top-3" />
          </div>
        </div>

        {/* Hero Banner: Noticia Destacada */}
        {featured && !debouncedSearch && category === 'ALL' && (
          <div className="relative rounded-3xl overflow-hidden border border-brand-border/80 bg-brand-surface group shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[380px]">
              {/* Imagen panorámica */}
              <div className="lg:col-span-7 relative min-h-[260px] lg:min-h-full overflow-hidden">
                <Image
                  src={featured.imageUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200'}
                  alt={featured.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-brand-bg via-brand-bg/40 to-transparent" />
              </div>

              {/* Contenido Destacado */}
              <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between z-10 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-brand-primary text-brand-bg flex items-center gap-1 shadow-md shadow-brand-primary/20">
                      <Flame className="w-3 h-3" />
                      Destacado
                    </span>
                    {featured.category && (
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getCategoryBadgeClass(
                          featured.category
                        )}`}
                      >
                        {featured.category}
                      </span>
                    )}
                    <span className="text-xs text-brand-muted font-medium">
                      {featured.sourceName} • {formatTimeAgo(featured.publishedAt)}
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-white leading-snug group-hover:text-brand-primary transition-colors">
                    {featured.title}
                  </h2>

                  <p className="text-xs sm:text-sm text-brand-muted leading-relaxed line-clamp-3">
                    {featured.summary}
                  </p>
                </div>

                {/* Juegos relacionados y CTA */}
                <div className="pt-4 border-t border-brand-border/60 flex items-center justify-between gap-3 flex-wrap">
                  {featured.games && featured.games.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Gamepad2 className="w-4 h-4 text-brand-primary" />
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {featured.games.map((g) => (
                          <Link
                            key={g.id}
                            href={`/games/${g.slug}`}
                            className="text-xs font-bold text-white hover:text-brand-primary bg-brand-card/80 hover:bg-brand-card px-2.5 py-1 rounded-lg border border-brand-border/80 transition-colors"
                          >
                            {g.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  <a
                    href={featured.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary hover:text-white transition-colors ml-auto"
                  >
                    Leer fuente completa
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chips de Categorías */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setCategory(cat.id);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                category === cat.id
                  ? 'bg-brand-primary text-brand-bg shadow-md shadow-brand-primary/20'
                  : 'bg-brand-surface/60 text-brand-muted hover:text-white border border-brand-border/60 hover:bg-brand-surface'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Grilla de Noticias */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <NewsCardSkeleton key={i} />
              ))}
            </div>
          ) : articles.length === 0 ? (
            <div className="p-12 rounded-3xl bg-brand-surface/40 border border-brand-border/60 text-center flex flex-col items-center justify-center">
              <Newspaper className="w-12 h-12 text-brand-muted/60 mb-3" />
              <h3 className="text-base font-bold text-white mb-1">No se encontraron noticias</h3>
              <p className="text-xs text-brand-muted max-w-sm">
                No hay artículos que coincidan con tu búsqueda o filtro seleccionado.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl bg-brand-surface/70 border border-brand-border/70 hover:border-brand-primary/40 hover:bg-brand-surface transition-all duration-200 overflow-hidden flex flex-col justify-between group shadow-sm"
                >
                  {/* Imagen */}
                  <div className="relative aspect-video w-full overflow-hidden bg-brand-card">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-brand-muted">
                        <Newspaper className="w-8 h-8 opacity-40" />
                      </div>
                    )}

                    {/* Badge de Categoría flotante */}
                    {item.category && (
                      <div className="absolute top-3 left-3">
                        <span
                          className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border backdrop-blur-md ${getCategoryBadgeClass(
                            item.category
                          )}`}
                        >
                          {item.category}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Cuerpo */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-brand-muted font-medium">
                        <span>{item.sourceName}</span>
                        <span>{formatTimeAgo(item.publishedAt)}</span>
                      </div>

                      <h3 className="text-base font-bold text-white leading-snug group-hover:text-brand-primary transition-colors line-clamp-2">
                        {item.title}
                      </h3>

                      <p className="text-xs text-brand-muted leading-relaxed line-clamp-3">
                        {item.summary}
                      </p>
                    </div>

                    {/* Footer con juegos vinculados y enlace externo */}
                    <div className="pt-3 border-t border-brand-border/40 flex items-center justify-between gap-2">
                      {item.games && item.games.length > 0 ? (
                        <div className="flex items-center gap-1.5 overflow-hidden">
                          {item.games.slice(0, 2).map((g) => (
                            <Link
                              key={g.id}
                              href={`/games/${g.slug}`}
                              className="text-[11px] font-bold text-brand-secondary hover:underline truncate"
                            >
                              🎮 {g.name}
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[11px] text-brand-muted">CritHit News</span>
                      )}

                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-brand-primary hover:text-white flex items-center gap-1 flex-shrink-0 transition-colors"
                      >
                        Leer
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-6 border-t border-brand-border/40">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="px-4 py-2 rounded-xl bg-brand-surface hover:bg-brand-surface/80 border border-brand-border text-xs font-bold text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </button>

            <span className="text-xs text-brand-muted font-medium px-2">
              Página <span className="text-white font-bold">{page}</span> de{' '}
              <span className="text-white font-bold">{totalPages}</span>
            </span>

            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="px-4 py-2 rounded-xl bg-brand-surface hover:bg-brand-surface/80 border border-brand-border text-xs font-bold text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-all"
            >
              Siguiente
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
