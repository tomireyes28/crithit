'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Check, Plus, Loader2, Bookmark, Layers, Lock, Hash } from 'lucide-react';
import { motion } from 'framer-motion';
import { apiClient } from '@/lib/api';
import { CreateListModal } from './CreateListModal';

interface UserListStatusItem {
  id: string;
  title: string;
  isRanked: boolean;
  isPublic: boolean;
  entryCount: number;
  containsGame: boolean;
}

interface AddToListModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: {
    id: string;
    name: string;
    coverUrl?: string | null;
    firstReleaseDate?: string | null;
  };
}

export const AddToListModal: React.FC<AddToListModalProps> = ({
  isOpen,
  onClose,
  game,
}) => {
  const [lists, setLists] = useState<UserListStatusItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingListId, setLoadingListId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchListsStatus = async () => {
    setIsLoading(true);
    try {
      const data: any = await apiClient(`/lists/game/${game.id}/status`);
      setLists(data || []);
    } catch {
      setLists([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchListsStatus();
      setToastMessage(null);
    }
  }, [isOpen, game.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleToggleEntry = async (list: UserListStatusItem) => {
    if (loadingListId) return;
    setLoadingListId(list.id);

    try {
      if (list.containsGame) {
        // Remover de la lista
        await apiClient(`/lists/${list.id}/entries/${game.id}`, {
          method: 'DELETE',
        });
        setLists((prev) =>
          prev.map((l) =>
            l.id === list.id
              ? { ...l, containsGame: false, entryCount: Math.max(0, l.entryCount - 1) }
              : l,
          ),
        );
        showToast(`Removido de "${list.title}"`);
      } else {
        // Añadir a la lista
        await apiClient(`/lists/${list.id}/entries`, {
          method: 'POST',
          body: JSON.stringify({ gameId: game.id }),
        });
        setLists((prev) =>
          prev.map((l) =>
            l.id === list.id
              ? { ...l, containsGame: true, entryCount: l.entryCount + 1 }
              : l,
          ),
        );
        showToast(`¡Añadido a "${list.title}"! 📋`);
      }
    } catch (err: any) {
      showToast(err.message || 'Error al actualizar la lista');
    } finally {
      setLoadingListId(null);
    }
  };

  const handleListCreated = (newList: any) => {
    setLists((prev) => [
      {
        id: newList.id,
        title: newList.title,
        isRanked: newList.isRanked,
        isPublic: newList.isPublic,
        entryCount: newList.entryCount,
        containsGame: true,
      },
      ...prev,
    ]);
    showToast(`¡Lista "${newList.title}" creada con este juego! ✨`);
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-md bg-brand-surface border border-brand-border rounded-2xl shadow-2xl p-6 text-brand-text flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header con Miniatura del Juego */}
          <div className="flex items-center justify-between pb-4 border-b border-brand-border/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-14 rounded-lg bg-brand-bg overflow-hidden relative flex-shrink-0 border border-brand-border/60 shadow-md">
                {game.coverUrl ? (
                  <Image
                    src={game.coverUrl}
                    alt={game.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-brand-muted">
                    <Bookmark className="w-4 h-4" />
                  </div>
                )}
              </div>
              <div className="truncate">
                <h3 className="text-sm font-bold text-white truncate max-w-[220px]">
                  {game.name}
                </h3>
                <p className="text-xs text-brand-muted mt-0.5">Guardar en una lista</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-brand-muted hover:text-white hover:bg-brand-bg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Feedback Toast */}
          {toastMessage && (
            <div className="my-2 p-2 rounded-lg bg-brand-accent/20 border border-brand-accent/40 text-brand-accent text-xs font-semibold text-center animate-fade-in">
              {toastMessage}
            </div>
          )}

          {/* List of user lists */}
          <div className="py-4 max-h-72 overflow-y-auto space-y-2 pr-1">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-8 text-brand-muted gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-brand-accent" />
                <span className="text-xs">Cargando tus listas...</span>
              </div>
            ) : lists.length > 0 ? (
              lists.map((list) => {
                const isItemLoading = loadingListId === list.id;
                return (
                  <button
                    key={list.id}
                    disabled={isItemLoading}
                    onClick={() => handleToggleEntry(list)}
                    className={`w-full p-3 rounded-xl border flex items-center justify-between gap-3 text-left transition-all ${
                      list.containsGame
                        ? 'bg-brand-accent/10 border-brand-accent/50 text-white'
                        : 'bg-brand-bg/60 border-brand-border/40 hover:border-brand-border hover:bg-brand-bg text-brand-muted'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      {/* Checkbox Icon */}
                      <div
                        className={`w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                          list.containsGame
                            ? 'bg-brand-accent text-brand-bg font-bold'
                            : 'border border-brand-border bg-brand-surface'
                        }`}
                      >
                        {list.containsGame && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>

                      <div className="truncate">
                        <div className="font-semibold text-xs text-white truncate flex items-center gap-1.5">
                          <span>{list.title}</span>
                          {list.isRanked && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono flex items-center gap-0.5">
                              <Hash className="w-2.5 h-2.5" /> ranked
                            </span>
                          )}
                          {!list.isPublic && (
                            <Lock className="w-2.5 h-2.5 text-purple-400" />
                          )}
                        </div>
                        <div className="text-[10px] text-brand-muted font-mono mt-0.5">
                          {list.entryCount} {list.entryCount === 1 ? 'juego' : 'juegos'}
                        </div>
                      </div>
                    </div>

                    {isItemLoading && (
                      <Loader2 className="w-4 h-4 animate-spin text-brand-accent flex-shrink-0" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="text-center py-6 px-4">
                <Layers className="w-10 h-10 text-brand-muted/40 mx-auto mb-2" />
                <p className="text-xs text-brand-muted">
                  Aún no has creado ninguna lista personalizada.
                </p>
              </div>
            )}
          </div>

          {/* Footer Action: Crear nueva lista */}
          <div className="pt-3 border-t border-brand-border/60">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-brand-accent bg-brand-accent/10 hover:bg-brand-accent/20 border border-brand-accent/30 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Crear nueva lista para este juego</span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* Modal secundario para crear lista */}
      <CreateListModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onListCreated={handleListCreated}
        initialGame={game}
      />
    </>
  );
};
