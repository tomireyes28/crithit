'use client';

import React, { useState, useEffect } from 'react';
import { ALL_PLAY_STATUSES, PlayStatus } from '@crithit/shared';
import { apiClient } from '@/lib/api';

export interface LogPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: {
    id: string;
    name: string;
    slug: string;
    coverUrl: string | null;
    platforms?: Array<{ id: string; name: string; abbreviation: string | null }>;
  };
  initialStatus?: PlayStatus | null;
  onLogSaved: (savedLog: any) => void;
}

export const LogPlayModal: React.FC<LogPlayModalProps> = ({
  isOpen,
  onClose,
  game,
  initialStatus = 'PLAYING',
  onLogSaved,
}) => {
  const [status, setStatus] = useState<PlayStatus>(initialStatus || 'PLAYING');
  const [logDate, setLogDate] = useState<string>(
    new Date().toISOString().split('T')[0],
  );
  const [platform, setPlatform] = useState<string>('');
  const [hoursPlayed, setHoursPlayed] = useState<string>('');
  const [isReplay, setIsReplay] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialStatus) {
      setStatus(initialStatus);
    }
    setLogDate(new Date().toISOString().split('T')[0]);
    setHoursPlayed('');
    setIsReplay(false);
    setNotes('');
    setErrorMessage(null);
  }, [initialStatus, isOpen]);

  // Cerrar modal con tecla Escape
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const payload: any = {
        gameId: game.id,
        status,
        logDate: new Date(logDate).toISOString(),
        platform: platform || undefined,
        hoursPlayed: hoursPlayed ? parseFloat(hoursPlayed) : undefined,
        isReplay,
        notes: notes.trim() || undefined,
      };

      const result = await apiClient('/play-logs', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      onLogSaved(result);
      onClose();
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Error al guardar en el diario. Inténtalo de nuevo.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (st: PlayStatus) => {
    switch (st) {
      case 'PLAYING':
        return '🎮';
      case 'COMPLETED':
        return '🏆';
      case 'MASTERED':
        return '👑';
      case 'BACKLOG':
        return '⏳';
      case 'SHELVED':
        return '⏸️';
      case 'DROPPED':
        return '❌';
      case 'WISHLIST':
        return '💖';
      default:
        return '📌';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-xl bg-brand-surface border border-brand-border/80 rounded-3xl shadow-2xl shadow-black overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between p-6 border-b border-brand-border/60 bg-brand-bg/40">
          <div className="flex items-center gap-4">
            {game.coverUrl ? (
              <img
                src={game.coverUrl}
                alt={game.name}
                className="w-12 h-16 object-cover rounded-lg border border-brand-border shadow"
              />
            ) : (
              <div className="w-12 h-16 rounded-lg bg-brand-surface border border-brand-border flex items-center justify-center text-xl">
                🎮
              </div>
            )}
            <div>
              <span className="text-xs uppercase font-mono tracking-wider text-brand-muted">
                Diario de Juego
              </span>
              <h3 className="text-lg sm:text-xl font-black text-brand-text line-clamp-1">
                Registrar Partida: {game.name}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-brand-surface hover:bg-brand-border/60 text-brand-muted hover:text-brand-text flex items-center justify-center transition-colors text-lg"
          >
            ✕
          </button>
        </div>

        {/* Error */}
        {errorMessage && (
          <div className="p-4 bg-rose-500/15 border-b border-rose-500/30 text-rose-400 text-xs sm:text-sm font-medium flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* 1. Selector de Estado de Juego */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-brand-muted block">
              1. Estado del juego
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ALL_PLAY_STATUSES.map((st) => {
                const isSelected = status === st.status;
                return (
                  <button
                    key={st.status}
                    type="button"
                    onClick={() => setStatus(st.status)}
                    className={`p-2.5 rounded-xl text-xs font-bold border transition-all flex flex-col items-center justify-center gap-1.5 ${
                      isSelected
                        ? `${st.badgeClass} ring-1 ring-white/20 shadow-md`
                        : 'bg-brand-bg/60 border-brand-border/40 text-brand-muted hover:text-brand-text hover:bg-brand-bg'
                    }`}
                  >
                    <span className="text-base">{getStatusIcon(st.status)}</span>
                    <span className="truncate">{st.labelEs}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Fecha y Horas Jugadas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-brand-muted block mb-1">
                Fecha de la sesión / registro
              </label>
              <input
                type="date"
                value={logDate}
                onChange={(e) => setLogDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-brand-bg border border-brand-border text-xs text-brand-text focus:border-brand-accent focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-brand-muted block mb-1">
                Horas dedicadas (opcional)
              </label>
              <input
                type="number"
                min="0"
                max="9999"
                step="0.5"
                placeholder="Ej: 3.5"
                value={hoursPlayed}
                onChange={(e) => setHoursPlayed(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-brand-bg border border-brand-border text-xs text-brand-text focus:border-brand-accent focus:outline-none"
              />
            </div>
          </div>

          {/* 3. Plataforma y Rejugada */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-brand-muted block mb-1">
                Plataforma (opcional)
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-brand-bg border border-brand-border text-xs text-brand-text focus:border-brand-accent focus:outline-none"
              >
                <option value="">Seleccionar plataforma...</option>
                {game.platforms?.map((p) => (
                  <option key={p.id} value={p.abbreviation || p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-brand-text">
                <input
                  type="checkbox"
                  checked={isReplay}
                  onChange={(e) => setIsReplay(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-accent border-brand-border bg-brand-bg"
                />
                <span>🔁 ¿Es una rejugada?</span>
              </label>
            </div>
          </div>

          {/* 4. Notas / Bitácora de la partida */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-brand-muted">
                Bitácora / Notas personales (opcional)
              </label>
              <span className="text-[11px] text-brand-muted font-mono">
                {notes.length}/2000
              </span>
            </div>
            <textarea
              rows={3}
              maxLength={2000}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Llegué a Novigrado. La misión del Barón Sanguinario me pareció brillante..."
              className="w-full px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border focus:border-brand-accent focus:outline-none text-xs text-brand-text placeholder:text-brand-muted/50 resize-y"
            />
          </div>

          {/* Botones de acción */}
          <div className="pt-4 border-t border-brand-border/60 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-brand-muted hover:text-brand-text transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-brand-accent to-emerald-500 text-brand-bg hover:brightness-110 shadow-lg shadow-brand-accent/20 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <span>Guardando...</span>
              ) : (
                <>
                  <span>📖</span>
                  <span>Guardar en el Diario</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
