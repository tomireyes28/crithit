'use client';

import React, { useState, useEffect } from 'react';
import { ALL_PLAY_STATUSES, PlayStatus } from '@crithit/shared';
import { apiClient } from '@/lib/api';
import { motion } from 'framer-motion';
import {
  X,
  AlertTriangle,
  Gamepad2,
  Trophy,
  Crown,
  Bookmark,
  PauseCircle,
  XCircle,
  Heart,
  Clock,
  Calendar,
  Repeat,
  Save,
} from 'lucide-react';

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

  const renderStatusIcon = (st: PlayStatus) => {
    switch (st) {
      case 'PLAYING':
        return <Gamepad2 className="w-4 h-4 text-brand-secondary" />;
      case 'COMPLETED':
        return <Trophy className="w-4 h-4 text-emerald-400" />;
      case 'MASTERED':
        return <Crown className="w-4 h-4 text-amber-400" />;
      case 'BACKLOG':
        return <Bookmark className="w-4 h-4 text-brand-tertiary" />;
      case 'SHELVED':
        return <PauseCircle className="w-4 h-4 text-amber-300" />;
      case 'DROPPED':
        return <XCircle className="w-4 h-4 text-rose-400" />;
      case 'WISHLIST':
        return <Heart className="w-4 h-4 text-rose-400" />;
      default:
        return <Bookmark className="w-4 h-4" />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
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
              <div className="w-12 h-16 rounded-lg bg-brand-surface border border-brand-border flex items-center justify-center text-brand-muted">
                <Gamepad2 className="w-6 h-6" />
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
            className="w-9 h-9 rounded-full bg-brand-surface hover:bg-brand-border/60 text-brand-muted hover:text-brand-text flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error */}
        {errorMessage && (
          <div className="p-4 bg-rose-500/15 border-b border-rose-500/30 text-rose-400 text-xs sm:text-sm font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
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
                        : 'bg-brand-bg/60 border-brand-border text-brand-muted hover:text-brand-text hover:bg-brand-bg'
                    }`}
                  >
                    <span>{renderStatusIcon(st.status)}</span>
                    <span className="text-[11px]">{st.labelEs}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Fecha y Plataforma */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-brand-muted block mb-1">
                Fecha del registro
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-brand-bg border border-brand-border focus:border-brand-secondary focus:outline-none text-xs text-brand-text"
                />
                <Calendar className="w-3.5 h-3.5 text-brand-muted absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-brand-muted block mb-1">
                Plataforma
              </label>
              {game.platforms && game.platforms.length > 0 ? (
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-brand-bg border border-brand-border focus:border-brand-secondary focus:outline-none text-xs text-brand-text"
                >
                  <option value="">Seleccionar plataforma</option>
                  {game.platforms.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  placeholder="Ej: PC, PS5, Steam Deck..."
                  className="w-full px-3 py-2 rounded-xl bg-brand-bg border border-brand-border focus:border-brand-secondary focus:outline-none text-xs text-brand-text"
                />
              )}
            </div>
          </div>

          {/* 3. Horas y Rejugado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div>
              <label className="text-xs font-bold text-brand-muted block mb-1">
                Horas dedicadas (esta sesión)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="999"
                  step="0.5"
                  value={hoursPlayed}
                  onChange={(e) => setHoursPlayed(e.target.value)}
                  placeholder="Ej: 3.5"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-brand-bg border border-brand-border focus:border-brand-secondary focus:outline-none text-xs text-brand-text"
                />
                <Clock className="w-3.5 h-3.5 text-brand-muted absolute left-3 top-2.5" />
              </div>
            </div>

            <div className="pt-5">
              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-brand-bg/60 border border-brand-border/50 cursor-pointer hover:bg-brand-bg transition-colors">
                <input
                  type="checkbox"
                  checked={isReplay}
                  onChange={(e) => setIsReplay(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-secondary border-brand-border focus:ring-0 bg-brand-surface cursor-pointer"
                />
                <span className="text-xs font-semibold text-brand-text flex items-center gap-1.5">
                  <Repeat className="w-3.5 h-3.5 text-brand-secondary" />
                  ¿Es una rejugada?
                </span>
              </label>
            </div>
          </div>

          {/* 4. Notas / Bitácora */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-brand-muted">
                Notas personales / Bitácora (Opcional)
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
              placeholder="¿Qué parte pasaste hoy? ¿Derrotaste a un boss? Notas sobre tu experiencia..."
              className="w-full px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border focus:border-brand-secondary focus:outline-none text-xs text-brand-text resize-y leading-relaxed"
            />
          </div>

          {/* Botones */}
          <div className="pt-4 border-t border-brand-border/60 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-brand-muted hover:text-brand-text transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-brand-secondary to-emerald-500 text-brand-bg hover:brightness-110 shadow-lg shadow-brand-secondary/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <span>Guardando...</span>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Guardar en el Diario</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
