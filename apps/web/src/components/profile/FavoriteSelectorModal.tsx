'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { ScoreBadge } from '@/components/ui/ScoreBadge';

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

  useEffect(() => {
    const nextSlots: Record<number, any> = { 1: null, 2: null, 3: null, 4: null };
    initialFavorites.forEach((f) => {
      if (f.position >= 1 && f.position <= 4) {
        nextSlots[f.position] = f.game;
      }
    });
    setSlots(nextSlots);
    setSearchQuery('');
    setSearchResults([]);
    setErrorMessage(null);
  }, [initialFavorites, isOpen]);

  // Búsqueda en catálogo con debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res: any = await apiClient(
          `/games?search=${encodeURIComponent(searchQuery.trim())}&limit=8`,
        );
        setSearchResults(res.data || []);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  if (!isOpen) return null;

  const handleSelectGame = (game: any) => {
    // Verificar si ya está en otro slot
    const alreadySlot = Object.entries(slots).find(
      ([pos, g]) => g?.id === game.id && Number(pos) !== activeSlot,
    );
    if (alreadySlot) {
      setErrorMessage(`"${game.name}" ya está seleccionado en la posición #${alreadySlot[0]}`);
      return;
    }

    setErrorMessage(null);
    setSlots((prev) => ({
      ...prev,
      [activeSlot]: {
        id: game.id,
        name: game.name,
        coverUrl: game.coverUrl,
        communityScore: game.communityScore,
      },
    }));

    // Pasar automáticamente al siguiente slot vacío si existe
    const nextEmpty = [1, 2, 3, 4].find(
      (p) => p !== activeSlot && !slots[p],
    );
    if (nextEmpty) {
      setActiveSlot(nextEmpty);
    }
  };

  const handleClearSlot = (e: React.MouseEvent, pos: number) => {
    e.stopPropagation();
    setSlots((prev) => ({
      ...prev,
      [pos]: null,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const favoritesPayload: any[] = [];
      [1, 2, 3, 4].forEach((pos) => {
        if (slots[pos]) {
          favoritesPayload.push({
            gameId: slots[pos]!.id,
            position: pos,
          });
        }
      });

      const updated = await apiClient('/users/favorites', {
        method: 'PUT',
        body: JSON.stringify({ favorites: favoritesPayload }),
      });

      onFavoritesSaved(updated as any[]);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al guardar los favoritos.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-2xl bg-brand-surface border border-brand-border/80 rounded-3xl shadow-2xl shadow-black overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between p-6 border-b border-brand-border/60 bg-brand-bg/40">
          <div>
            <span className="text-xs uppercase font-mono tracking-wider text-brand-muted">
              Personalización de Perfil
            </span>
            <h3 className="text-xl font-black text-brand-text">
              Elegir Favorite Four
            </h3>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-brand-surface hover:bg-brand-border/60 text-brand-muted hover:text-brand-text flex items-center justify-center transition-colors text-lg"
          >
            ✕
          </button>
        </div>

        {errorMessage && (
          <div className="p-3.5 bg-rose-500/15 border-b border-rose-500/30 text-rose-400 text-xs font-medium flex items-center gap-2">
            <span>⚠️</span>
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
                        ? 'border-brand-accent shadow-lg shadow-brand-accent/20 ring-2 ring-brand-accent/30 bg-brand-bg'
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
                          className="w-5 h-5 rounded-full bg-rose-500/80 hover:bg-rose-500 text-white flex items-center justify-center text-[10px] transition-colors"
                          title="Eliminar de esta ranura"
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
                            className="absolute inset-0 w-full h-full object-cover z-0"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-0" />
                        <span className="z-10 text-[10px] font-bold text-white line-clamp-1">
                          {game.name}
                        </span>
                      </>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center">
                        <span className="text-xl text-brand-muted mb-1">+</span>
                        <span className="text-[10px] font-semibold text-brand-muted">
                          Vacío
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Buscador de Juegos */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-muted block">
              2. Busca y selecciona el juego para la ranura #{activeSlot}:
            </span>

            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Escribe el nombre del juego (ej: Elden Ring, Zelda, Cyberpunk)..."
                className="w-full px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border focus:border-brand-accent focus:outline-none text-xs sm:text-sm text-brand-text placeholder:text-brand-muted/50"
              />
              {isSearching && (
                <div className="absolute right-3.5 top-3 text-xs text-brand-muted animate-spin">
                  ⏳
                </div>
              )}
            </div>

            {/* Resultados de Búsqueda */}
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {searchResults.length > 0 ? (
                searchResults.map((game) => (
                  <div
                    key={game.id}
                    onClick={() => handleSelectGame(game)}
                    className="p-2 rounded-xl bg-brand-bg/60 hover:bg-brand-bg border border-brand-border/40 hover:border-brand-accent/50 cursor-pointer flex items-center justify-between gap-3 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {game.coverUrl ? (
                        <img
                          src={game.coverUrl}
                          alt={game.name}
                          className="w-8 h-11 object-cover rounded-md border border-brand-border/60 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-11 rounded-md bg-brand-surface flex items-center justify-center text-xs flex-shrink-0">
                          🎮
                        </div>
                      )}
                      <span className="text-xs font-bold text-brand-text group-hover:text-brand-accent transition-colors truncate">
                        {game.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <ScoreBadge score={game.communityScore} size="sm" />
                      <span className="text-xs font-bold text-brand-accent">
                        Asignar a #{activeSlot} →
                      </span>
                    </div>
                  </div>
                ))
              ) : searchQuery.trim() && !isSearching ? (
                <p className="text-center text-xs text-brand-muted py-4">
                  No se encontraron juegos con ese nombre.
                </p>
              ) : (
                <p className="text-center text-xs text-brand-muted/60 py-4">
                  Escribe en el buscador para ver títulos disponibles.
                </p>
              )}
            </div>
          </div>

          {/* Footer de Botones */}
          <div className="pt-4 border-t border-brand-border/60 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-brand-muted hover:text-brand-text transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-brand-accent to-emerald-500 text-brand-bg hover:brightness-110 shadow-lg shadow-brand-accent/25 transition-all disabled:opacity-50"
            >
              {isSaving ? 'Guardando...' : 'Guardar Favorite Four'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
