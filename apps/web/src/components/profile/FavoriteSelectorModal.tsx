'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { ScoreBadge } from '@/components/ui/ScoreBadge';
import { motion } from 'framer-motion';
import { X, Search, Sparkles, Gamepad2, AlertTriangle, Check, Loader2, Save } from 'lucide-react';

export interface FavoriteSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialFavorites: Array<{
    position: number;
    game: {
      id: string;
      name: string;
      coverUrl: string | null;
      communityScore: number | null;
    };
  }>;
  onFavoritesSaved: (favorites: any[]) => void;
}

export const FavoriteSelectorModal: React.FC<FavoriteSelectorModalProps> = ({
  isOpen,
  onClose,
  initialFavorites,
  onFavoritesSaved,
}) => {
  const [slots, setSlots] = useState<
    Record<
      number,
      {
        id: string;
        name: string;
        coverUrl: string | null;
        communityScore: number | null;
      } | null
    >
  >({
    1: null,
    2: null,
    3: null,
    4: null,
  });

  const [activeSlot, setActiveSlot] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Inicializar slots cuando se abre el modal
  useEffect(() => {
    const initialMap: any = { 1: null, 2: null, 3: null, 4: null };
    initialFavorites.forEach((fav) => {
      if (fav.position >= 1 && fav.position <= 4) {
        initialMap[fav.position] = fav.game;
      }
    });
    setSlots(initialMap);
    setSearchQuery('');
    setSearchResults([]);
    setErrorMessage(null);
  }, [initialFavorites, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Búsqueda de juegos con debounce
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timeoutId = setTimeout(async () => {
      try {
        const res: any = await apiClient(
          `/games?search=${encodeURIComponent(searchQuery.trim())}&limit=6`,
        );
        setSearchResults(res.items || []);
      } catch (err) {
        console.error('Error al buscar juegos:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  if (!isOpen) return null;

  const handleAssignGame = (game: any) => {
    setErrorMessage(null);

    // Evitar que el mismo juego esté en dos ranuras
    const isAlreadyAssigned = Object.entries(slots).some(
      ([posStr, g]) => g?.id === game.id && parseInt(posStr) !== activeSlot,
    );

    if (isAlreadyAssigned) {
      setErrorMessage(`"${game.name}" ya se encuentra en tus 4 favoritos.`);
      return;
    }

    setSlots((prev) => ({
      ...prev,
      [activeSlot]: {
        id: game.id,
        name: game.name,
        coverUrl: game.coverUrl,
        communityScore: game.communityScore,
      },
    }));

    // Auto-avanzar al siguiente slot vacío si existe
    const nextSlot = [1, 2, 3, 4].find(
      (p) => p !== activeSlot && slots[p] === null,
    );
    if (nextSlot) {
      setActiveSlot(nextSlot);
    }
  };

  const handleClearSlot = (e: React.MouseEvent, pos: number) => {
    e.stopPropagation();
    setSlots((prev) => ({ ...prev, [pos]: null }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const favoritesPayload = Object.entries(slots)
        .filter(([_, g]) => g !== null)
        .map(([pos, g]) => ({
          gameId: g!.id,
          position: parseInt(pos),
        }));

      const res: any = await apiClient('/users/profile/favorites', {
        method: 'PUT',
        body: JSON.stringify({ favorites: favoritesPayload }),
      });

      onFavoritesSaved(res);
      onClose();
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Error al guardar los 4 favoritos. Inténtalo de nuevo.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="relative w-full max-w-xl bg-brand-surface border border-brand-border/80 rounded-3xl shadow-2xl shadow-black overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between p-6 border-b border-brand-border/60 bg-brand-bg/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-brand-secondary/20 border border-brand-secondary/40 flex items-center justify-center text-brand-secondary">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs uppercase font-mono tracking-wider text-brand-muted">
                Personalización de Perfil
              </span>
              <h3 className="text-xl font-black text-brand-text">
                Elegir Favorite Four
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-brand-surface hover:bg-brand-border/60 text-brand-muted hover:text-brand-text flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMessage && (
          <div className="p-3.5 bg-rose-500/15 border-b border-rose-500/30 text-rose-400 text-xs font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Selector de los 4 slots */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-muted block">
              1. Selecciona la ranura que deseas modificar:
            </span>

            <div className="grid grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((pos) => {
                const game = slots[pos];
                const isActive = activeSlot === pos;

                return (
                  <div
                    key={pos}
                    onClick={() => setActiveSlot(pos)}
                    className={`aspect-[3/4] rounded-2xl relative cursor-pointer border-2 transition-all p-1.5 flex flex-col justify-between overflow-hidden ${
                      isActive
                        ? 'border-brand-secondary shadow-lg shadow-brand-secondary/20 ring-2 ring-brand-secondary/30 bg-brand-bg'
                        : 'border-brand-border/60 bg-brand-bg/60 hover:border-brand-border'
                    }`}
                  >
                    <div className="flex items-center justify-between z-10">
                      <span className="w-5 h-5 rounded-md bg-black/60 font-mono text-[10px] font-bold text-white flex items-center justify-center">
                        #{pos}
                      </span>
                      {game && (
                        <button
                          type="button"
                          onClick={(e) => handleClearSlot(e, pos)}
                          className="w-5 h-5 rounded-md bg-rose-500/80 hover:bg-rose-600 text-white flex items-center justify-center text-[10px] transition-colors"
                          title="Remover juego"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {game ? (
                      <>
                        {game.coverUrl && (
                          <img
                            src={game.coverUrl}
                            alt={game.name}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />
                        <span className="z-10 text-[10px] font-bold text-white line-clamp-2 leading-tight">
                          {game.name}
                        </span>
                      </>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-1">
                        <span className="text-xl text-brand-muted/40 font-light mb-1">
                          +
                        </span>
                        <span className="text-[10px] text-brand-muted/60 font-mono">
                          Vacío
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Buscador de videojuegos para el slot activo */}
          <div className="space-y-3 pt-2 border-t border-brand-border/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-muted">
                2. Buscar juego para la Ranura #{activeSlot}:
              </span>
              {isSearching && (
                <span className="text-[11px] text-brand-secondary font-mono flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Buscando...
                </span>
              )}
            </div>

            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Escribe el nombre del juego (ej. Elden Ring, Zelda)..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border focus:border-brand-secondary focus:outline-none text-xs sm:text-sm text-brand-text placeholder:text-brand-muted/50"
              />
              <Search className="w-4 h-4 text-brand-muted absolute left-3 top-3" />
            </div>

            {/* Resultados de búsqueda */}
            {searchResults.length > 0 && (
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {searchResults.map((game) => (
                  <div
                    key={game.id}
                    onClick={() => handleAssignGame(game)}
                    className="p-2 rounded-xl bg-brand-bg/60 hover:bg-brand-bg border border-brand-border/40 hover:border-brand-secondary/50 cursor-pointer flex items-center justify-between gap-3 transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {game.coverUrl ? (
                        <img
                          src={game.coverUrl}
                          alt={game.name}
                          className="w-8 h-10 object-cover rounded flex-shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-10 rounded bg-brand-surface flex items-center justify-center flex-shrink-0 text-brand-muted">
                          <Gamepad2 className="w-4 h-4" />
                        </div>
                      )}
                      <span className="text-xs font-bold text-brand-text group-hover:text-brand-secondary transition-colors truncate">
                        {game.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <ScoreBadge score={game.communityScore} size="sm" />
                      <span className="text-xs font-bold text-brand-secondary">
                        Asignar a #{activeSlot} →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="p-6 border-t border-brand-border/60 bg-brand-bg/40 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-brand-muted hover:text-brand-text transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-brand-secondary to-emerald-500 text-brand-bg hover:brightness-110 shadow-lg shadow-brand-secondary/25 transition-all disabled:opacity-50 flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Guardando...' : 'Guardar Favorite Four'}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
