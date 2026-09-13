'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Search, Flame, Sparkles, Layers, User, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api';
import { ListCard, ListCardData } from '@/components/lists/ListCard';
import { CreateListModal } from '@/components/lists/CreateListModal';

export default function ListsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'popular' | 'recent' | 'entries' | 'me'>('popular');
  const [searchQuery, setSearchQuery] = useState('');
  const [lists, setLists] = useState<ListCardData[]>([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchLists = useCallback(async (tab: string, search: string, page = 1) => {
    setIsLoading(true);
    try {
      if (tab === 'me') {
        if (!user) {
          setLists([]);
          setIsLoading(false);
          return;
        }
        const data: any = await apiClient('/lists/me');
        setLists(data || []);
        setMeta({ page: 1, totalPages: 1, total: data?.length || 0 });
      } else {
        const queryParams = new URLSearchParams();
        queryParams.set('page', page.toString());
        queryParams.set('limit', '18');
        queryParams.set('sort', tab);
        if (search.trim()) {
          queryParams.set('search', search.trim());
        }

        const res: any = await apiClient(`/lists?${queryParams.toString()}`);
        setLists(res.data || []);
        setMeta(res.meta || { page: 1, totalPages: 1, total: 0 });
      }
    } catch {
      setLists([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Manejo de query params iniciales
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'me' || tabParam === 'recent' || tabParam === 'entries') {
      setActiveTab(tabParam as any);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchLists(activeTab, searchQuery, meta.page);
  }, [activeTab, fetchLists]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      fetchLists(activeTab, val, 1);
    }, 400);
  };

  const handleCreateListClick = () => {
    if (!user) {
      router.push('/login?redirect=/lists');
      return;
    }
    setIsCreateModalOpen(true);
  };

  const handleListCreated = (newList: any) => {
    // Si estamos en "Mis Listas" o "Recientes", la colocamos primera
    setLists((prev) => [newList, ...prev]);
    // Redirigir directamente al detalle de la lista creada
    router.push(`/lists/${newList.id}`);
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text pb-20">
      {/* Hero Section */}
      <div className="relative border-b border-brand-border/60 bg-gradient-to-b from-brand-surface/80 via-brand-bg to-brand-bg pt-12 pb-8 sm:pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-accent/10 border border-brand-accent/30 text-brand-accent text-xs font-semibold uppercase tracking-wider mb-3">
              <Layers className="w-3.5 h-3.5" />
              <span>Colecciones y Rankings</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white font-sans">
              Listas de la <span className="text-brand-accent">Comunidad</span>
            </h1>
            <p className="text-sm sm:text-base text-brand-muted max-w-2xl mt-2 leading-relaxed">
              Explora selecciones temáticas, rankings definitivos y bitácoras curadas por jugadores y críticos acreditados de CritHit.
            </p>
          </div>

          <button
            onClick={handleCreateListClick}
            className="self-start md:self-auto px-5 py-3 rounded-xl bg-brand-accent hover:brightness-110 text-brand-bg font-bold text-sm shadow-lg shadow-brand-accent/20 transition-all duration-200 flex items-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Crear Lista</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Navigation Tabs & Search Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-brand-border/40">
          {/* Tabs */}
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
            <button
              onClick={() => {
                setActiveTab('popular');
                fetchLists('popular', searchQuery, 1);
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'popular'
                  ? 'bg-brand-surface text-brand-accent border border-brand-accent/40 shadow-sm'
                  : 'text-brand-muted hover:text-white hover:bg-brand-surface/40'
              }`}
            >
              <Flame className="w-4 h-4 text-orange-400" />
              <span>Más Populares</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('recent');
                fetchLists('recent', searchQuery, 1);
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'recent'
                  ? 'bg-brand-surface text-brand-accent border border-brand-accent/40 shadow-sm'
                  : 'text-brand-muted hover:text-white hover:bg-brand-surface/40'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Recientes</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('entries');
                fetchLists('entries', searchQuery, 1);
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'entries'
                  ? 'bg-brand-surface text-brand-accent border border-brand-accent/40 shadow-sm'
                  : 'text-brand-muted hover:text-white hover:bg-brand-surface/40'
              }`}
            >
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Con Más Juegos</span>
            </button>

            {user && (
              <button
                onClick={() => {
                  setActiveTab('me');
                  fetchLists('me', searchQuery, 1);
                }}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'me'
                    ? 'bg-brand-surface text-brand-accent border border-brand-accent/40 shadow-sm'
                    : 'text-brand-muted hover:text-white hover:bg-brand-surface/40'
                }`}
              >
                <User className="w-4 h-4 text-brand-secondary" />
                <span>Mis Listas</span>
              </button>
            )}
          </div>

          {/* Search input */}
          {activeTab !== 'me' && (
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Buscar por título o tag..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-brand-surface border border-brand-border text-xs text-brand-text placeholder-brand-muted/60 focus:outline-none focus:border-brand-accent transition-colors"
              />
              <Search className="w-4 h-4 text-brand-muted absolute left-3 top-2.5" />
            </div>
          )}
        </div>

        {/* Lists Grid */}
        <div className="pt-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-brand-muted gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-brand-accent" />
              <p className="text-sm font-medium">Cargando colecciones de la comunidad...</p>
            </div>
          ) : lists.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {lists.map((list) => (
                  <ListCard key={list.id} list={list} />
                ))}
              </div>

              {/* Paginación */}
              {meta.totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-12">
                  <button
                    disabled={meta.page <= 1}
                    onClick={() => fetchLists(activeTab, searchQuery, meta.page - 1)}
                    className="px-4 py-2 rounded-xl border border-brand-border bg-brand-surface text-xs font-semibold text-brand-text disabled:opacity-30 hover:border-brand-accent transition-colors"
                  >
                    Anterior
                  </button>
                  <span className="text-xs font-mono text-brand-muted">
                    Página {meta.page} de {meta.totalPages}
                  </span>
                  <button
                    disabled={meta.page >= meta.totalPages}
                    onClick={() => fetchLists(activeTab, searchQuery, meta.page + 1)}
                    className="px-4 py-2 rounded-xl border border-brand-border bg-brand-surface text-xs font-semibold text-brand-text disabled:opacity-30 hover:border-brand-accent transition-colors"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 px-4 bg-brand-surface/40 rounded-2xl border border-dashed border-brand-border/60">
              <Layers className="w-12 h-12 text-brand-muted/40 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white mb-1">
                {activeTab === 'me'
                  ? 'Aún no has creado ninguna lista'
                  : 'No se encontraron listas'}
              </h3>
              <p className="text-xs text-brand-muted max-w-sm mx-auto mb-5">
                {activeTab === 'me'
                  ? 'Crea tu primera lista para organizar tus videojuegos favoritos o armar rankings temáticos.'
                  : 'Intenta con otro término de búsqueda o sé el primero en crear una lista sobre este tema.'}
              </p>
              <button
                onClick={handleCreateListClick}
                className="px-4 py-2 rounded-xl bg-brand-accent text-brand-bg font-bold text-xs shadow-md hover:brightness-110 transition-all"
              >
                + Crear Lista Ahora
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Creación */}
      <CreateListModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onListCreated={handleListCreated}
      />
    </div>
  );
}
