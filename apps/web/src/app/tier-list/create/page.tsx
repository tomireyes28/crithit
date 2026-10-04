'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers,
  Search,
  Plus,
  Trash2,
  Download,
  Save,
  RotateCcw,
  Sparkles,
  Gamepad2,
  ChevronUp,
  ChevronDown,
  X,
  Check,
  Loader2,
  MoveHorizontal,
} from 'lucide-react';

interface GameItem {
  id: string;
  name: string;
  slug: string;
  coverUrl: string | null;
  communityScore?: number | null;
}

interface TierRow {
  id: string;
  label: string;
  color: string;
  games: GameItem[];
}

const DEFAULT_TIERS: TierRow[] = [
  { id: 'tier-s', label: 'S', color: '#EF4444', games: [] },
  { id: 'tier-a', label: 'A', color: '#F97316', games: [] },
  { id: 'tier-b', label: 'B', color: '#EAB308', games: [] },
  { id: 'tier-c', label: 'C', color: '#10B981', games: [] },
  { id: 'tier-d', label: 'D', color: '#3B82F6', games: [] },
];

export default function TierListCreatePage() {
  const router = useRouter();
  const { user } = useAuth();

  const [title, setTitle] = useState('Mi Tier List Definitiva');
  const [description, setDescription] = useState('Clasificación personalizada de los mejores títulos');
  const [tiers, setTiers] = useState<TierRow[]>(DEFAULT_TIERS);
  const [unrankedPool, setUnrankedPool] = useState<GameItem[]>([]);

  // Búsqueda en catálogo
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GameItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Estados de exportación / guardado
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Drag item seleccionado (soporte click / drag)
  const [selectedGame, setSelectedGame] = useState<{ game: GameItem; fromTierId: string | 'pool' } | null>(null);

  // Cargar juegos populares iniciales al pool para empezar de inmediato
  useEffect(() => {
    async function loadPopularGames() {
      try {
        const res: any = await apiClient('/games/trending?limit=12');
        const items = Array.isArray(res) ? res : res?.data || [];
        setUnrankedPool(
          items.map((g: any) => ({
            id: g.id,
            name: g.name,
            slug: g.slug,
            coverUrl: g.coverUrl,
            communityScore: g.communityScore,
          })),
        );
      } catch (err) {
        console.error('Error cargando juegos populares:', err);
      }
    }
    loadPopularGames();
  }, []);

  // Búsqueda en vivo
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const res: any = await apiClient(`/games?search=${encodeURIComponent(searchQuery.trim())}&limit=8`);
        const items = Array.isArray(res) ? res : res?.data || [];
        setSearchResults(
          items.map((g: any) => ({
            id: g.id,
            name: g.name,
            slug: g.slug,
            coverUrl: g.coverUrl,
            communityScore: g.communityScore,
          })),
        );
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Añadir juego desde búsqueda al pool
  const addGameToPool = (game: GameItem) => {
    // Verificar si ya existe en alguna fila o pool
    const existsInTier = tiers.some((t) => t.games.some((g) => g.id === game.id));
    const existsInPool = unrankedPool.some((g) => g.id === game.id);

    if (existsInTier || existsInPool) {
      showToast(`"${game.name}" ya está en la Tier List`);
      return;
    }

    setUnrankedPool((prev) => [game, ...prev]);
    showToast(`"${game.name}" añadido al banco de juegos`);
    setSearchQuery('');
    setSearchResults([]);
  };

  // Mover juego a un Tier
  const moveGameToTier = (game: GameItem, targetTierId: string, fromTierId: string | 'pool') => {
    if (fromTierId === targetTierId) return;

    // Remover de origen
    if (fromTierId === 'pool') {
      setUnrankedPool((prev) => prev.filter((g) => g.id !== game.id));
    } else {
      setTiers((prev) =>
        prev.map((t) => (t.id === fromTierId ? { ...t, games: t.games.filter((g) => g.id !== game.id) } : t)),
      );
    }

    // Agregar a destino
    setTiers((prev) =>
      prev.map((t) => (t.id === targetTierId ? { ...t, games: [...t.games, game] } : t)),
    );

    setSelectedGame(null);
  };

  // Devolver juego al pool
  const moveGameToPool = (game: GameItem, fromTierId: string) => {
    setTiers((prev) =>
      prev.map((t) => (t.id === fromTierId ? { ...t, games: t.games.filter((g) => g.id !== game.id) } : t)),
    );
    setUnrankedPool((prev) => [game, ...prev]);
    setSelectedGame(null);
  };

  // Modificar etiqueta de Tier
  const updateTierLabel = (tierId: string, newLabel: string) => {
    setTiers((prev) => prev.map((t) => (t.id === tierId ? { ...t, label: newLabel } : t)));
  };

  // Modificar color de Tier
  const updateTierColor = (tierId: string, newColor: string) => {
    setTiers((prev) => prev.map((t) => (t.id === tierId ? { ...t, color: newColor } : t)));
  };

  // Agregar nueva fila
  const addTierRow = () => {
    const newTier: TierRow = {
      id: `tier-${Date.now()}`,
      label: 'NUEVO',
      color: '#A855F7',
      games: [],
    };
    setTiers((prev) => [...prev, newTier]);
  };

  // Eliminar fila (sus juegos vuelven al pool)
  const removeTierRow = (tierId: string) => {
    const tier = tiers.find((t) => t.id === tierId);
    if (tier && tier.games.length > 0) {
      setUnrankedPool((prev) => [...tier.games, ...prev]);
    }
    setTiers((prev) => prev.filter((t) => t.id !== tierId));
  };

  // Mover fila arriba/abajo
  const moveTierOrder = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= tiers.length) return;

    const copy = [...tiers];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, moved);
    setTiers(copy);
  };

  // Guardar como Lista en CritHit
  const handleSaveAsList = async () => {
    if (!user) {
      showToast('Inicia sesión para guardar esta Tier List en tu perfil.');
      return;
    }

    try {
      setIsSaving(true);
      // Mapear todas las filas ordenadas a entradas de lista
      const entries: Array<{ gameId: string; notes?: string }> = [];
      tiers.forEach((tier) => {
        tier.games.forEach((g) => {
          entries.push({
            gameId: g.id,
            notes: `Nivel: ${tier.label}`,
          });
        });
      });

      if (entries.length === 0) {
        showToast('Asigna al menos un juego a alguna fila antes de guardar.');
        setIsSaving(false);
        return;
      }

      await apiClient('/lists', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description: `${description} • Creada con CritHit Tier Maker`,
          isRanked: true,
          isPublic: true,
          tags: ['TierList', 'Ranking'],
          entries,
        }),
      });

      setSavedSuccess(true);
      showToast('¡Tier List guardada con éxito en tus listas públicas!');
      setTimeout(() => {
        router.push('/lists');
      }, 1800);
    } catch (err: any) {
      showToast(err.message || 'Error al guardar la Tier List.');
    } finally {
      setIsSaving(false);
    }
  };

  // Exportar como imagen PNG en Canvas HTML5
  const handleExportPNG = () => {
    setIsExporting(true);

    const canvas = document.createElement('canvas');
    const width = 1200;
    const headerHeight = 160;
    const rowHeight = 130;
    const totalHeight = headerHeight + tiers.length * rowHeight + 90;

    canvas.width = width;
    canvas.height = totalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fondo
    ctx.fillStyle = '#0a0d14';
    ctx.fillRect(0, 0, width, totalHeight);

    // Header
    ctx.fillStyle = '#00D2FF';
    ctx.font = 'bold 24px monospace';
    ctx.fillText('CRITHIT TIER MAKER', 60, 60);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 44px sans-serif';
    ctx.fillText(title, 60, 115);

    // Renderizar filas
    tiers.forEach((tier, i) => {
      const y = headerHeight + i * rowHeight;

      // Caja del Label
      ctx.fillStyle = tier.color;
      ctx.fillRect(60, y, 140, rowHeight - 6);

      ctx.fillStyle = '#000000';
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(tier.label, 130, y + rowHeight / 2 + 6);
      ctx.textAlign = 'left';

      // Pista de juegos de la fila
      ctx.fillStyle = '#141a29';
      ctx.fillRect(206, y, width - 266, rowHeight - 6);

      // Texto de cantidad si no hay imágenes precargadas
      if (tier.games.length === 0) {
        ctx.fillStyle = '#4A5568';
        ctx.font = 'italic 18px sans-serif';
        ctx.fillText('Fila vacía', 230, y + rowHeight / 2);
      } else {
        tier.games.forEach((game, gIdx) => {
          const gx = 216 + gIdx * 90;
          if (gx + 80 < width - 60) {
            ctx.fillStyle = '#2D3748';
            ctx.fillRect(gx, y + 8, 80, rowHeight - 22);

            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 12px sans-serif';
            ctx.fillText(game.name.slice(0, 10), gx + 5, y + 40);
          }
        });
      }
    });

    // Footer de marca
    ctx.fillStyle = '#718096';
    ctx.font = 'bold 18px monospace';
    ctx.fillText('crithit.gg • Creado con CritHit', 60, totalHeight - 35);

    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `tier-list-${title.toLowerCase().replace(/\s+/g, '-')}.png`;
    a.click();
    setIsExporting(false);
    showToast('¡Imagen PNG de la Tier List generada con éxito!');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-24">
      {/* Toast flotante */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-brand-surface border border-brand-accent/50 text-white text-xs font-semibold shadow-2xl flex items-center gap-2 animate-fade-in">
          <Sparkles className="w-4 h-4 text-brand-secondary" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Cabecera y Configuración de Tier List */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-brand-surface/80 via-brand-card/70 to-brand-bg border border-brand-border/70 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-brand-primary/10 border border-brand-primary/30 text-brand-primary">
              <Layers className="w-3.5 h-3.5" />
              <span>Creador de Tier Lists</span>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-2xl sm:text-4xl font-black bg-transparent text-white border-b border-transparent hover:border-brand-border/60 focus:border-brand-secondary focus:outline-none transition-all"
              placeholder="Título de la Tier List..."
            />
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs sm:text-sm text-brand-muted bg-transparent border-none focus:outline-none"
              placeholder="Descripción opcional..."
            />
          </div>

          {/* Acciones principales de exportación */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportPNG}
              disabled={isExporting}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-brand-surface hover:bg-brand-surface/90 border border-brand-border hover:border-brand-secondary/50 text-white transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-brand-secondary" />
              <span>{isExporting ? 'Exportando...' : 'Descargar PNG'}</span>
            </button>

            <button
              onClick={handleSaveAsList}
              disabled={isSaving}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-brand-primary hover:bg-brand-primary-hover text-white transition-all flex items-center gap-1.5 shadow-glow-primary"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>{savedSuccess ? '¡Guardado!' : 'Guardar como Lista'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filas de la Tier List */}
      <div className="space-y-3">
        {tiers.map((tier, index) => (
          <div
            key={tier.id}
            className="flex rounded-2xl overflow-hidden border border-brand-border/60 bg-brand-bg/90 shadow-md group min-h-[110px]"
          >
            {/* Cabecera / Etiqueta de la Fila */}
            <div
              style={{ backgroundColor: tier.color }}
              className="w-24 sm:w-32 flex flex-col items-center justify-center p-3 text-black font-black text-xl sm:text-2xl flex-shrink-0 relative group/label select-none"
            >
              <input
                type="text"
                value={tier.label}
                onChange={(e) => updateTierLabel(tier.id, e.target.value)}
                className="w-full bg-transparent text-center font-black focus:outline-none"
              />

              {/* Selector de color sutil */}
              <input
                type="color"
                value={tier.color}
                onChange={(e) => updateTierColor(tier.id, e.target.value)}
                className="opacity-0 absolute inset-0 cursor-pointer w-full h-full"
                title="Cambiar color de fila"
              />
            </div>

            {/* Contenedor de Juegos de la Fila */}
            <div
              onClick={() => {
                if (selectedGame) {
                  moveGameToTier(selectedGame.game, tier.id, selectedGame.fromTierId);
                }
              }}
              className={`flex-1 p-3 flex flex-wrap items-center gap-2.5 transition-colors ${
                selectedGame ? 'bg-brand-surface/40 hover:bg-brand-secondary/10 cursor-pointer border-2 border-dashed border-brand-secondary/40' : 'bg-brand-card/40'
              }`}
            >
              {tier.games.length === 0 ? (
                <span className="text-xs text-brand-muted/40 italic pl-2">
                  {selectedGame ? 'Haz clic aquí para soltar el juego seleccionado' : 'Fila vacía. Haz clic en un juego para colocarlo aquí.'}
                </span>
              ) : (
                tier.games.map((game) => (
                  <div
                    key={game.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (selectedGame && selectedGame.game.id === game.id) {
                        setSelectedGame(null);
                      } else {
                        setSelectedGame({ game, fromTierId: tier.id });
                      }
                    }}
                    className={`relative w-16 sm:w-20 aspect-[3/4] rounded-xl overflow-hidden bg-brand-surface border transition-all cursor-pointer group/item shadow-sm ${
                      selectedGame?.game.id === game.id
                        ? 'border-brand-secondary scale-105 shadow-glow-secondary'
                        : 'border-brand-border/60 hover:border-white'
                    }`}
                  >
                    {game.coverUrl ? (
                      <img src={game.coverUrl} alt={game.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center p-1 text-[10px] text-center font-bold text-brand-muted">
                        {game.name}
                      </div>
                    )}

                    {/* Botón rápido para devolver al pool */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveGameToPool(game, tier.id);
                      }}
                      className="absolute top-1 right-1 p-1 rounded-md bg-black/70 hover:bg-rose-500 text-white opacity-0 group-hover/item:opacity-100 transition-opacity"
                      title="Quitar de fila"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Controles de fila (Mover arriba/abajo, eliminar) */}
            <div className="w-10 sm:w-12 bg-brand-surface/80 border-l border-brand-border/60 flex flex-col items-center justify-center gap-1.5 p-1 flex-shrink-0">
              <button
                onClick={() => moveTierOrder(index, 'up')}
                disabled={index === 0}
                className="p-1 rounded text-brand-muted hover:text-white disabled:opacity-20"
                title="Mover fila arriba"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => moveTierOrder(index, 'down')}
                disabled={index === tiers.length - 1}
                className="p-1 rounded text-brand-muted hover:text-white disabled:opacity-20"
                title="Mover fila abajo"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <button
                onClick={() => removeTierRow(tier.id)}
                className="p-1 rounded text-brand-muted hover:text-rose-400"
                title="Eliminar fila"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Botón para agregar nueva fila */}
      <div className="flex justify-center">
        <button
          onClick={addTierRow}
          className="px-5 py-2 rounded-xl text-xs font-bold bg-brand-surface/80 hover:bg-brand-surface border border-brand-border/60 hover:border-brand-secondary/40 text-brand-text hover:text-brand-secondary transition-all flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Nivel / Fila</span>
        </button>
      </div>

      {/* Banco de Juegos Disponibles (Unranked Pool) */}
      <div className="p-6 rounded-3xl bg-brand-surface/60 border border-brand-border/60 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border/40 pb-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Gamepad2 className="w-4 h-4 text-brand-secondary" />
              <span>Banco de Juegos Disponibles</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-brand-bg border border-brand-border text-brand-muted">
                {unrankedPool.length}
              </span>
            </h3>
            <p className="text-xs text-brand-muted">
              Selecciona cualquier carátula y luego haz clic en una fila para asignarlo a su nivel.
            </p>
          </div>

          {/* Barra de Búsqueda para incorporar nuevos juegos al banco */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar y añadir juego..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-brand-bg border border-brand-border/70 text-xs text-white placeholder-brand-muted focus:outline-none focus:border-brand-secondary"
            />
            {isSearching && (
              <Loader2 className="w-3.5 h-3.5 absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-secondary animate-spin" />
            )}

            {/* Desplegable de resultados de búsqueda */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl bg-brand-card border border-brand-border shadow-2xl p-2 z-50 max-h-60 overflow-y-auto space-y-1">
                {searchResults.map((game) => (
                  <div
                    key={game.id}
                    onClick={() => addGameToPool(game)}
                    className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-brand-surface cursor-pointer transition-colors"
                  >
                    <div className="w-7 h-9 rounded bg-brand-surface overflow-hidden flex-shrink-0">
                      {game.coverUrl && <img src={game.coverUrl} alt={game.name} className="w-full h-full object-cover" />}
                    </div>
                    <span className="text-xs font-bold text-white truncate flex-1">{game.name}</span>
                    <Plus className="w-3.5 h-3.5 text-brand-secondary" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Grilla del Pool */}
        {unrankedPool.length === 0 ? (
          <div className="py-10 text-center text-xs text-brand-muted">
            Todos los juegos del banco han sido clasificados en las filas. ¡Busca nuevos juegos arriba para agregarlos!
          </div>
        ) : (
          <div className="flex flex-wrap gap-2.5 min-h-[90px] p-2 rounded-2xl bg-brand-bg/50 border border-brand-border/40">
            {unrankedPool.map((game) => (
              <div
                key={game.id}
                onClick={() => {
                  if (selectedGame?.game.id === game.id) {
                    setSelectedGame(null);
                  } else {
                    setSelectedGame({ game, fromTierId: 'pool' });
                  }
                }}
                className={`w-16 sm:w-20 aspect-[3/4] rounded-xl overflow-hidden bg-brand-surface border transition-all cursor-pointer shadow-sm relative group ${
                  selectedGame?.game.id === game.id
                    ? 'border-brand-secondary scale-105 shadow-glow-secondary'
                    : 'border-brand-border/60 hover:border-white'
                }`}
              >
                {game.coverUrl ? (
                  <img src={game.coverUrl} alt={game.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-1 text-[10px] text-center font-bold text-brand-muted">
                    {game.name}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
