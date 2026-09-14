'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { X, Plus, Search, Trash2, ArrowUp, ArrowDown, Sparkles, Hash, Globe, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { apiClient } from '@/lib/api';

interface SelectedGameItem {
  gameId: string;
  name: string;
  coverUrl?: string | null;
  releaseDate?: string | null;
  note?: string;
}

interface CreateListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onListCreated: (list: any) => void;
  initialGame?: {
    id: string;
    name: string;
    coverUrl?: string | null;
    releaseDate?: string | null;
  } | null;
}

export const CreateListModal: React.FC<CreateListModalProps> = ({
  isOpen,
  onClose,
  onListCreated,
  initialGame = null,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isRanked, setIsRanked] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [selectedGames, setSelectedGames] = useState<SelectedGameItem[]>([]);

  // Búsqueda de juegos
  const [gameSearch, setGameSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      setIsRanked(false);
      setIsPublic(true);
      setTags([]);
      setErrorMsg(null);
      setGameSearch('');
      setSearchResults([]);

      if (initialGame) {
        setSelectedGames([
          {
            gameId: initialGame.id,
            name: initialGame.name,
            coverUrl: initialGame.coverUrl,
            releaseDate: initialGame.releaseDate,
            note: '',
          },
        ]);
      } else {
        setSelectedGames([]);
      }
    }
  }, [isOpen, initialGame]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!gameSearch.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res: any = await apiClient(`/games?search=${encodeURIComponent(gameSearch.trim())}&limit=6`);
        setSearchResults(res.data || []);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [gameSearch]);

  if (!isOpen) return null;

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const cleaned = tagInput.trim().replace(/^#/, '');
      if (cleaned && !tags.includes(cleaned) && tags.length < 10) {
        setTags([...tags, cleaned]);
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleAddGame = (game: any) => {
    if (selectedGames.some((g) => g.gameId === game.id)) {
      return;
    }
    setSelectedGames([
      ...selectedGames,
      {
        gameId: game.id,
        name: game.name,
        coverUrl: game.coverUrl,
        releaseDate: game.releaseDate || game.firstReleaseDate,
        note: '',
      },
    ]);
    setGameSearch('');
    setSearchResults([]);
  };

  const handleRemoveGame = (gameId: string) => {
    setSelectedGames(selectedGames.filter((g) => g.gameId !== gameId));
  };

  const handleUpdateNote = (gameId: string, note: string) => {
    setSelectedGames(
      selectedGames.map((g) => (g.gameId === gameId ? { ...g, note } : g)),
    );
  };

  const handleMoveGame = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= selectedGames.length) return;

    const updated = [...selectedGames];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setSelectedGames(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (title.trim().length < 2) {
      setErrorMsg('El título de la lista debe tener al menos 2 caracteres.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        isRanked,
        isPublic,
        tags,
        initialGames: selectedGames.map((g) => ({
          gameId: g.gameId,
          note: g.note?.trim() || undefined,
        })),
      };

      const newList = await apiClient('/lists', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      onListCreated(newList);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al crear la lista.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="relative w-full max-w-2xl bg-brand-surface border border-brand-border rounded-2xl shadow-2xl p-6 sm:p-8 my-8 text-brand-text max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-brand-border/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-accent/20 border border-brand-accent/30 flex items-center justify-center text-brand-accent">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-white">
                Crear Nueva Lista
              </h2>
              <p className="text-xs text-brand-muted">
                Cura y comparte tu propia colección de videojuegos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-brand-muted hover:text-white hover:bg-brand-bg/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-5 space-y-5 pr-1">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* Título */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-2">
              Título de la Lista <span className="text-brand-accent">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Top 10 RPGs de Mundo Abierto, Joyas Ocultas de PS2..."
              maxLength={100}
              className="w-full px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border text-sm text-brand-text placeholder-brand-muted/50 focus:outline-none focus:border-brand-accent transition-colors"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-2">
              Descripción o Criterio (Opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explica el tema de tu lista, por qué elegiste estos juegos o qué sensaciones buscas transmitir..."
              rows={3}
              maxLength={2000}
              className="w-full px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border text-sm text-brand-text placeholder-brand-muted/50 focus:outline-none focus:border-brand-accent transition-colors resize-none"
            />
          </div>

          {/* Opciones: Ranked & Privacidad */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Modo Ranked */}
            <div
              onClick={() => setIsRanked(!isRanked)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                isRanked
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                  : 'bg-brand-bg/60 border-brand-border/60 text-brand-muted hover:border-brand-border'
              }`}
            >
              <div className="mt-0.5">
                <Hash className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-xs">Lista Ordenada (Ranked)</div>
                <div className="text-[11px] opacity-80 mt-0.5">
                  Muestra números de posición (#1, #2...) para rankings formales.
                </div>
              </div>
            </div>

            {/* Privacidad */}
            <div
              onClick={() => setIsPublic(!isPublic)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                isPublic
                  ? 'bg-brand-accent/10 border-brand-accent/40 text-brand-accent'
                  : 'bg-purple-500/10 border-purple-500/40 text-purple-300'
              }`}
            >
              <div className="mt-0.5">
                {isPublic ? <Globe className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
              </div>
              <div className="flex-1">
                <div className="font-bold text-xs">
                  {isPublic ? 'Lista Pública' : 'Lista Privada'}
                </div>
                <div className="text-[11px] opacity-80 mt-0.5">
                  {isPublic
                    ? 'Visible en la comunidad y en tu perfil.'
                    : 'Solo tú puedes ver y gestionar esta lista.'}
                </div>
              </div>
            </div>
          </div>

          {/* Etiquetas / Tags */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-2">
              Etiquetas (Presiona Enter para agregar)
            </label>
            <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-brand-bg border border-brand-border min-h-[42px]">
              {tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-lg bg-brand-surface border border-brand-accent/30 text-brand-accent text-xs font-medium flex items-center gap-1"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-rose-400 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {tags.length < 10 && (
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder={tags.length === 0 ? 'Ej: RPG, GOTY, Indie...' : 'Otra etiqueta...'}
                  className="bg-transparent border-none text-xs text-brand-text placeholder-brand-muted/40 focus:outline-none flex-1 min-w-[100px]"
                />
              )}
            </div>
          </div>

          {/* Añadir Videojuegos */}
          <div className="pt-2 border-t border-brand-border/40">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted">
                Videojuegos Seleccionados ({selectedGames.length})
              </label>
              <span className="text-[11px] text-brand-muted/70">
                Puedes reordenarlos y agregar una nota a cada uno
              </span>
            </div>

            {/* Buscador de juegos */}
            <div className="relative mb-3">
              <input
                type="text"
                value={gameSearch}
                onChange={(e) => setGameSearch(e.target.value)}
                placeholder="Buscar un videojuego en el catálogo para añadir..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-brand-bg border border-brand-border text-xs text-brand-text placeholder-brand-muted/50 focus:outline-none focus:border-brand-accent"
              />
              <Search className="w-4 h-4 text-brand-muted absolute left-3 top-2.5" />

              {/* Resultados desplegables */}
              {gameSearch.trim() && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-brand-surface border border-brand-border/80 rounded-xl shadow-2xl z-20 overflow-hidden max-h-56 overflow-y-auto">
                  {isSearching ? (
                    <div className="p-3 text-center text-xs text-brand-muted">
                      Buscando en el catálogo...
                    </div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((game) => {
                      const isAlreadyAdded = selectedGames.some((g) => g.gameId === game.id);
                      return (
                        <button
                          key={game.id}
                          type="button"
                          disabled={isAlreadyAdded}
                          onClick={() => handleAddGame(game)}
                          className={`w-full text-left p-2.5 flex items-center justify-between gap-3 border-b border-brand-border/20 last:border-none transition-colors ${
                            isAlreadyAdded
                              ? 'opacity-40 cursor-not-allowed bg-brand-bg/40'
                              : 'hover:bg-brand-bg/80'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <div className="w-8 h-10 rounded bg-brand-bg overflow-hidden relative flex-shrink-0">
                              {game.coverUrl ? (
                                <Image
                                  src={game.coverUrl}
                                  alt={game.name}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-brand-border/40" />
                              )}
                            </div>
                            <div className="truncate">
                              <div className="font-semibold text-xs text-white truncate">
                                {game.name}
                              </div>
                              <div className="text-[10px] text-brand-muted">
                                {game.firstReleaseDate
                                  ? new Date(game.firstReleaseDate).getFullYear()
                                  : 'Año desc.'}
                              </div>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-brand-accent flex-shrink-0">
                            {isAlreadyAdded ? 'Añadido' : '+ Añadir'}
                          </span>
                        </button>
                      );
                    })
                  ) : (
                    <div className="p-3 text-center text-xs text-brand-muted">
                      No se encontraron juegos con ese nombre
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Lista de juegos seleccionados */}
            {selectedGames.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {selectedGames.map((item, idx) => (
                  <div
                    key={item.gameId}
                    className="p-3 rounded-xl bg-brand-bg/70 border border-brand-border/50 flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="w-6 text-center font-mono font-bold text-xs text-brand-accent">
                          #{idx + 1}
                        </span>
                        <div className="w-7 h-9 rounded bg-brand-surface overflow-hidden relative flex-shrink-0">
                          {item.coverUrl ? (
                            <Image
                              src={item.coverUrl}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-brand-border/30" />
                          )}
                        </div>
                        <span className="font-bold text-xs text-white truncate">
                          {item.name}
                        </span>
                      </div>

                      {/* Acciones: mover arriba/abajo y eliminar */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveGame(idx, 'up')}
                          className="p-1 rounded text-brand-muted hover:text-white disabled:opacity-20 transition-colors"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === selectedGames.length - 1}
                          onClick={() => handleMoveGame(idx, 'down')}
                          className="p-1 rounded text-brand-muted hover:text-white disabled:opacity-20 transition-colors"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveGame(item.gameId)}
                          className="p-1 rounded text-brand-muted hover:text-rose-400 transition-colors ml-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Input de nota personalizada */}
                    <input
                      type="text"
                      value={item.note || ''}
                      onChange={(e) => handleUpdateNote(item.gameId, e.target.value)}
                      placeholder="Agrega una nota u opinión breve sobre este juego en la lista..."
                      maxLength={500}
                      className="w-full px-3 py-1.5 rounded-lg bg-brand-surface/70 border border-brand-border/40 text-[11px] text-brand-text placeholder-brand-muted/40 focus:outline-none focus:border-brand-accent/60"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-brand-border/60 text-center text-xs text-brand-muted">
                Busca juegos arriba para agregarlos a tu lista o puedes crear la lista ahora y agregar juegos después.
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-brand-border/60 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-brand-muted hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="px-5 py-2 rounded-xl text-xs font-bold text-brand-bg bg-brand-accent hover:brightness-110 disabled:opacity-50 shadow-lg shadow-brand-accent/20 transition-all flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <span>Guardando lista...</span>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Crear Lista</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
