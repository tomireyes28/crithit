'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

export interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    displayName: string;
    bio: string | null;
    location: string | null;
    website: string | null;
  };
  onProfileSaved: (updatedUser: any) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onProfileSaved,
}) => {
  const [displayName, setDisplayName] = useState(user.displayName || '');
  const [bio, setBio] = useState(user.bio || '');
  const [location, setLocation] = useState(user.location || '');
  const [website, setWebsite] = useState(user.website || '');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setDisplayName(user.displayName || '');
    setBio(user.bio || '');
    setLocation(user.location || '');
    setWebsite(user.website || '');
    setErrorMessage(null);
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const updated = await apiClient('/users/profile', {
        method: 'PUT',
        body: JSON.stringify({
          displayName: displayName.trim() || undefined,
          bio: bio.trim() || undefined,
          location: location.trim() || undefined,
          website: website.trim() || undefined,
        }),
      });

      onProfileSaved(updated);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al actualizar el perfil.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-lg bg-brand-surface border border-brand-border/80 rounded-3xl shadow-2xl shadow-black overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-brand-border/60 bg-brand-bg/40">
          <h3 className="text-xl font-black text-brand-text">Editar Perfil</h3>
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-brand-muted block mb-1.5">
              Nombre para mostrar
            </label>
            <input
              type="text"
              maxLength={60}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border focus:border-brand-accent focus:outline-none text-xs sm:text-sm text-brand-text"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-brand-muted block mb-1.5">
              Biografía
            </label>
            <textarea
              rows={3}
              maxLength={1000}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Cuéntale a la comunidad qué tipo de juegos te apasionan..."
              className="w-full px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border focus:border-brand-accent focus:outline-none text-xs text-brand-text resize-y"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-brand-muted block mb-1.5">
                Ubicación
              </label>
              <input
                type="text"
                maxLength={100}
                placeholder="Ej: Buenos Aires, Argentina"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border focus:border-brand-accent focus:outline-none text-xs text-brand-text"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-brand-muted block mb-1.5">
                Sitio web / Redes
              </label>
              <input
                type="text"
                maxLength={200}
                placeholder="https://..."
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border focus:border-brand-accent focus:outline-none text-xs text-brand-text"
              />
            </div>
          </div>

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
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-brand-accent to-emerald-500 text-brand-bg hover:brightness-110 shadow-lg shadow-brand-accent/25 transition-all disabled:opacity-50"
            >
              {isSaving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
