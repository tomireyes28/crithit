'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  Gamepad2,
  User as UserIcon,
  List as ListIcon,
  Newspaper,
  Clock,
  ArrowRight,
  TrendingUp,
  Award,
  Calendar,
  BookOpen,
  Loader2,
  Trash2,
  ChevronRight,
} from 'lucide-react';
import { ScoreBadge } from '@/components/ui/ScoreBadge';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface SearchResultItem {
  id: string;
  type: 'game' | 'user' | 'list' | 'news';
  title: string;
  subtitle?: string;
  url: string;
  image?: string | null;
  score?: number | null;
  badge?: string | null;
}

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STORAGE_KEY = 'crithit_recent_searches';

export function CommandPaletteModal({ isOpen, onClose }: CommandPaletteModalProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'game' | 'user' | 'list' | 'news'>('all');
  const [results, setResults] = useState<{
    games: any[];
    users: any[];
    lists: any[];
    news: any[];
  }>({ games: [], users: [], lists: [], news: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Cargar búsquedas recientes de localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch {}
  }, []);

  // Escuchar atajos de teclado globales
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle con Cmd+K o Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Si está cerrado, abre
          // Se gestiona desde el componente padre o listener
        }
      }

      // Cerrar con Escape
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Foco automático en el input al abrir
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Búsqueda en API con debounce
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults({ games: [], users: [], lists: [], news: [] });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timeout = setTimeout(() => {
      fetch(`${API_URL}/search?q=${encodeURIComponent(query.trim())}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) {
            setResults({
              games: data.games || [],
              users: data.users || [],
              lists: data.lists || [],
              news: data.news || [],
            });
            setSelectedIndex(0);
          }
        })
        .catch(() => {})
        .finally(() => {
          setIsLoading(false);
        });
    }, 200);

    return () => clearTimeout(timeout);
  }, [query]);

  // Guardar en búsquedas recientes
  const saveRecentSearch = (text: string) => {
    if (!text.trim()) return;
    try {
      const updated = [text.trim(), ...recentSearches.filter((s) => s.toLowerCase() !== text.trim().toLowerCase())].slice(0, 8);
      setRecentSearches(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  // Convertir resultados a lista plana para navegación con teclado
  const flatItems: SearchResultItem[] = [];

  if (activeCategory === 'all' || activeCategory === 'game') {
    results.games.forEach((g) => {
      flatItems.push({
        id: `game-${g.id}`,
        type: 'game',
        title: g.name,
        subtitle: g.genres?.slice(0, 2).join(' • ') || 'Videojuego',
        url: `/games/${g.slug}`,
        image: g.coverUrl,
        score: g.communityScore,
      });
    });
  }

  if (activeCategory === 'all' || activeCategory === 'user') {
    results.users.forEach((u) => {
      flatItems.push({
        id: `user-${u.id}`,
        type: 'user',
        title: u.displayName || u.username,
        subtitle: `@${u.username}`,
        url: `/profile/${u.username}`,
        image: u.avatarUrl,
        badge: u.criticBadge,
      });
    });
  }

  if (activeCategory === 'all' || activeCategory === 'list') {
    results.lists.forEach((l) => {
      flatItems.push({
        id: `list-${l.id}`,
        type: 'list',
        title: l.title,
        subtitle: `Por @${l.user?.username} • ${l.gameCount || 0} juegos`,
        url: `/lists/${l.id}`,
        image: l.entries?.[0]?.game?.coverUrl || null,
      });
    });
  }

  if (activeCategory === 'all' || activeCategory === 'news') {
    results.news.forEach((n) => {
      flatItems.push({
        id: `news-${n.id}`,
        type: 'news',
        title: n.title,
        subtitle: `Noticia • ${n.category || 'Actualidad'}`,
        url: `/news`,
        image: n.imageUrl || null,
      });
    });
  }

  // Navegación con teclado dentro del modal
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (flatItems.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % flatItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + flatItems.length) % flatItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = flatItems[selectedIndex];
      if (target) {
        saveRecentSearch(target.title);
        onClose();
        router.push(target.url);
      }
    }
  };

  const handleSelect = (item: SearchResultItem) => {
    saveRecentSearch(item.title);
    onClose();
    router.push(item.url);
  };

  const quickLinks = [
    { title: 'Juegos en Tendencia', url: '/games?sort=popular', icon: TrendingUp },
    { title: 'Examen de Críticos Acreditados', url: '/critics/exam', icon: Award },
    { title: 'Calendario de Estrenos 2026', url: '/calendar', icon: Calendar },
    { title: 'Diario de Partidas (PlayLog)', url: '/diary', icon: BookOpen },
    { title: 'Explorar Listas de la Comunidad', url: '/lists', icon: ListIcon },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-14 sm:pt-20 px-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="relative w-full max-w-2xl bg-brand-card/95 border border-brand-border/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[82vh] z-10 glass-panel"
        >
          {/* Top Search Input Bar */}
          <div className="p-4 sm:p-5 border-b border-brand-border/60 flex items-center gap-3 relative">
            <Search className="w-5 h-5 text-brand-secondary flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Buscar juegos, usuarios, listas, noticias..."
              className="w-full bg-transparent text-white placeholder-brand-muted text-base sm:text-lg font-medium focus:outline-none"
            />

            {isLoading && <Loader2 className="w-4 h-4 text-brand-secondary animate-spin flex-shrink-0" />}

            {query && !isLoading && (
              <button
                onClick={() => setQuery('')}
                className="p-1 rounded-lg hover:bg-brand-surface text-brand-muted hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onClose}
              className="px-2 py-1 rounded-lg bg-brand-surface border border-brand-border/80 text-[10px] font-mono text-brand-muted hover:text-white transition-colors"
            >
              ESC
            </button>
          </div>

          {/* Category Filter Pills (cuando hay búsqueda) */}
          {query.trim().length >= 2 && (
            <div className="px-4 py-2 border-b border-brand-border/40 flex items-center gap-1.5 overflow-x-auto text-xs font-bold scrollbar-none">
              {(
                [
                  { id: 'all', label: 'Todos' },
                  { id: 'game', label: `Juegos (${results.games.length})` },
                  { id: 'user', label: `Usuarios (${results.users.length})` },
                  { id: 'list', label: `Listas (${results.lists.length})` },
                  { id: 'news', label: `Noticias (${results.news.length})` },
                ] as const
              ).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1 rounded-xl transition-all whitespace-nowrap ${
                    activeCategory === cat.id
                      ? 'bg-brand-secondary text-brand-bg font-extrabold shadow-sm'
                      : 'bg-brand-surface/70 text-brand-muted hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          )}

          {/* Results / Suggestions Container */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 max-h-[60vh] scrollbar-thin scrollbar-thumb-brand-border">
            {/* Si no hay búsqueda: Mostrar recientes y atajos */}
            {query.trim().length < 2 && (
              <div className="space-y-5">
                {/* Búsquedas recientes */}
                {recentSearches.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between px-2 mb-2">
                      <span className="text-[11px] font-black uppercase text-brand-muted tracking-wider flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        Búsquedas Recientes
                      </span>
                      <button
                        onClick={clearRecentSearches}
                        className="text-[10px] text-brand-muted hover:text-red-400 flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        Borrar
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 px-1">
                      {recentSearches.map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => setQuery(item)}
                          className="px-3 py-1.5 rounded-xl bg-brand-surface/80 hover:bg-brand-surface border border-brand-border/60 hover:border-brand-secondary/40 text-xs font-semibold text-brand-text hover:text-white flex items-center gap-1.5 transition-all"
                        >
                          <Clock className="w-3 h-3 text-brand-muted" />
                          <span>{item}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Accesos rápidos */}
                <div>
                  <span className="text-[11px] font-black uppercase text-brand-muted tracking-wider px-2 mb-2 block">
                    Accesos Directos
                  </span>
                  <div className="space-y-1">
                    {quickLinks.map((link, idx) => {
                      const Icon = link.icon;
                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            onClose();
                            router.push(link.url);
                          }}
                          className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-brand-surface border border-transparent hover:border-brand-border/60 text-left transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-brand-surface flex items-center justify-center text-brand-secondary group-hover:scale-105 transition-transform">
                              <Icon className="w-4 h-4" />
                            </div>
                            <span className="text-xs sm:text-sm font-bold text-white group-hover:text-brand-secondary transition-colors">
                              {link.title}
                            </span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-brand-muted group-hover:text-brand-secondary group-hover:translate-x-0.5 transition-all" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Si hay resultados de búsqueda */}
            {query.trim().length >= 2 && (
              <>
                {flatItems.length === 0 && !isLoading ? (
                  <div className="text-center py-12 space-y-2">
                    <p className="text-sm font-bold text-white">No se encontraron resultados para &quot;{query}&quot;</p>
                    <p className="text-xs text-brand-muted">
                      Prueba con el nombre del juego en inglés o busca por franquicia.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {flatItems.map((item, idx) => {
                      const isSelected = selectedIndex === idx;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelect(item)}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          className={`w-full flex items-center justify-between p-2.5 rounded-2xl border transition-all text-left ${
                            isSelected
                              ? 'bg-brand-secondary/15 border-brand-secondary/50 shadow-sm'
                              : 'bg-brand-surface/40 hover:bg-brand-surface/80 border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Icon or Thumbnail */}
                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-brand-surface flex-shrink-0 flex items-center justify-center border border-brand-border/60 relative">
                              {item.image ? (
                                <img src={item.image} alt="" className="w-full h-full object-cover" />
                              ) : item.type === 'game' ? (
                                <Gamepad2 className="w-5 h-5 text-brand-muted" />
                              ) : item.type === 'user' ? (
                                <UserIcon className="w-5 h-5 text-brand-muted" />
                              ) : item.type === 'list' ? (
                                <ListIcon className="w-5 h-5 text-brand-muted" />
                              ) : (
                                <Newspaper className="w-5 h-5 text-brand-muted" />
                              )}
                            </div>

                            {/* Details */}
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs sm:text-sm font-black text-white truncate">
                                  {item.title}
                                </span>
                                {item.badge && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-sky-500/20 text-sky-400 border border-sky-500/30">
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                              {item.subtitle && (
                                <p className="text-[11px] text-brand-muted truncate mt-0.5">{item.subtitle}</p>
                              )}
                            </div>
                          </div>

                          {/* Score or Arrow */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {item.score !== undefined && item.score !== null && (
                              <ScoreBadge score={item.score} size="sm" />
                            )}
                            <ChevronRight
                              className={`w-4 h-4 transition-transform ${
                                isSelected ? 'text-brand-secondary translate-x-0.5' : 'text-brand-muted'
                              }`}
                            />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer Shortcuts Info */}
          <div className="px-4 py-2.5 bg-brand-bg/70 border-t border-brand-border/60 flex items-center justify-between text-[11px] text-brand-muted">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="px-1 rounded bg-brand-surface border border-brand-border/80 font-mono text-[9px]">↑↓</kbd>
                navegar
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 rounded bg-brand-surface border border-brand-border/80 font-mono text-[9px]">↵</kbd>
                seleccionar
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 rounded bg-brand-surface border border-brand-border/80 font-mono text-[9px]">esc</kbd>
                cerrar
              </span>
            </div>
            <span className="text-[10px] font-semibold text-brand-secondary/80">CritHit Command Palette</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
