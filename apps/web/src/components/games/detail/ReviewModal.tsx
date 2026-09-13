'use client';

import React, { useState, useEffect } from 'react';
import { ScoreSlider } from '@/components/ui/ScoreSlider';
import { apiClient } from '@/lib/api';

export interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: {
    id: string;
    name: string;
    slug: string;
    coverUrl: string | null;
    platforms?: Array<{ id: string; name: string; abbreviation: string | null }>;
  };
  existingReview?: {
    id: string;
    score: number;
    title: string | null;
    body: string | null;
    platform: string | null;
    playtimeAtReview: number | null;
    containsSpoilers: boolean;
    recommends: boolean | null;
  } | null;
  onReviewSaved: (review: any) => void;
  onReviewDeleted?: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  game,
  existingReview,
  onReviewSaved,
  onReviewDeleted,
}) => {
  const [score, setScore] = useState<number>(existingReview?.score ?? 80);
  const [title, setTitle] = useState<string>(existingReview?.title ?? '');
  const [body, setBody] = useState<string>(existingReview?.body ?? '');
  const [platform, setPlatform] = useState<string>(existingReview?.platform ?? '');
  const [playtime, setPlaytime] = useState<string>(
    existingReview?.playtimeAtReview ? String(existingReview.playtimeAtReview) : '',
  );
  const [containsSpoilers, setContainsSpoilers] = useState<boolean>(
    existingReview?.containsSpoilers ?? false,
  );
  const [recommends, setRecommends] = useState<boolean | null>(
    existingReview?.recommends ?? null,
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sincronizar campos al abrir o cambiar existingReview
  useEffect(() => {
    if (existingReview) {
      setScore(existingReview.score);
      setTitle(existingReview.title ?? '');
      setBody(existingReview.body ?? '');
      setPlatform(existingReview.platform ?? '');
      setPlaytime(
        existingReview.playtimeAtReview ? String(existingReview.playtimeAtReview) : '',
      );
      setContainsSpoilers(existingReview.containsSpoilers);
      setRecommends(existingReview.recommends ?? null);
    } else {
      setScore(80);
      setTitle('');
      setBody('');
      setPlatform('');
      setPlaytime('');
      setContainsSpoilers(false);
      setRecommends(null);
    }
    setErrorMessage(null);
  }, [existingReview, isOpen]);

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
        score: Math.round(score),
        title: title.trim() || undefined,
        body: body.trim() || undefined,
        platform: platform || undefined,
        playtimeAtReview: playtime ? parseFloat(playtime) : undefined,
        containsSpoilers,
        recommends: recommends !== null ? recommends : undefined,
      };

      const savedReview = await apiClient('/reviews', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      onReviewSaved(savedReview);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al guardar la reseña. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!existingReview) return;
    const confirmDelete = window.confirm(
      '¿Estás seguro de que deseas eliminar tu reseña y calificación?',
    );
    if (!confirmDelete) return;

    setIsDeleting(true);
    setErrorMessage(null);

    try {
      await apiClient(`/reviews/${existingReview.id}`, {
        method: 'DELETE',
      });
      onReviewDeleted?.();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al eliminar la reseña.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-fade-in">
      {/* Contenedor del Modal */}
      <div
        className="relative w-full max-w-2xl bg-brand-surface border border-brand-border/80 rounded-3xl shadow-2xl shadow-black overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del Modal */}
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
                {existingReview ? 'Editar Calificación' : 'Puntuar & Reseñar'}
              </span>
              <h3 className="text-lg sm:text-xl font-black text-brand-text line-clamp-1">
                {game.name}
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

        {/* Mensaje de Error */}
        {errorMessage && (
          <div className="p-4 bg-rose-500/15 border-b border-rose-500/30 text-rose-400 text-xs sm:text-sm font-medium flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* 1. Score Slider Interactivo (0-100) */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-brand-muted block">
              1. Puntuación (0 al 100)
            </label>
            <ScoreSlider
              value={score}
              onChange={(val) => setScore(val)}
              disabled={isSubmitting}
            />
          </div>

          {/* 2. Título de la Reseña */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">
                2. Título (Opcional)
              </label>
              <span className="text-[11px] text-brand-muted font-mono">
                {title.length}/120
              </span>
            </div>
            <input
              type="text"
              maxLength={120}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Una obra maestra imprescindible..."
              className="w-full px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border focus:border-brand-accent focus:outline-none text-sm text-brand-text transition-colors placeholder:text-brand-muted/60"
            />
          </div>

          {/* 3. Análisis / Opinión Escrita */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">
                3. Reseña u Opinión (Opcional)
              </label>
              <span className="text-[11px] text-brand-muted font-mono">
                {body.length}/10,000
              </span>
            </div>
            <textarea
              rows={5}
              maxLength={10000}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="¿Qué te pareció la jugabilidad, historia, banda sonora y diseño de niveles? Cuéntale a la comunidad..."
              className="w-full px-4 py-3 rounded-xl bg-brand-bg border border-brand-border focus:border-brand-accent focus:outline-none text-sm text-brand-text transition-colors placeholder:text-brand-muted/60 resize-y"
            />
          </div>

          {/* 4. Metadatos Opcionales: Plataforma, Horas, Recomendación */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-brand-border/40">
            {/* Selector de Plataforma */}
            <div>
              <label className="text-xs font-bold text-brand-muted block mb-1">
                Plataforma jugada
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-brand-bg border border-brand-border text-xs text-brand-text focus:border-brand-accent focus:outline-none"
              >
                <option value="">Seleccionar...</option>
                {game.platforms?.map((p) => (
                  <option key={p.id} value={p.abbreviation || p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Horas Jugadas */}
            <div>
              <label className="text-xs font-bold text-brand-muted block mb-1">
                Horas de juego
              </label>
              <input
                type="number"
                min={0}
                max={9999}
                step="0.5"
                value={playtime}
                onChange={(e) => setPlaytime(e.target.value)}
                placeholder="Ej: 45"
                className="w-full px-3 py-2 rounded-xl bg-brand-bg border border-brand-border text-xs text-brand-text focus:border-brand-accent focus:outline-none"
              >
              </input>
            </div>

            {/* ¿Lo recomiendas? */}
            <div>
              <label className="text-xs font-bold text-brand-muted block mb-1">
                ¿Lo recomiendas?
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRecommends(recommends === true ? null : true)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1 ${
                    recommends === true
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                      : 'bg-brand-bg border-brand-border text-brand-muted hover:text-brand-text'
                  }`}
                >
                  <span>👍</span>
                  <span>Sí</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRecommends(recommends === false ? null : false)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1 ${
                    recommends === false
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/50'
                      : 'bg-brand-bg border-brand-border text-brand-muted hover:text-brand-text'
                  }`}
                >
                  <span>👎</span>
                  <span>No</span>
                </button>
              </div>
            </div>
          </div>

          {/* 5. Alerta de Spoilers */}
          <div className="pt-2">
            <label className="flex items-center gap-3 p-3 rounded-xl bg-brand-bg/60 border border-brand-border/50 cursor-pointer hover:bg-brand-bg transition-colors">
              <input
                type="checkbox"
                checked={containsSpoilers}
                onChange={(e) => setContainsSpoilers(e.target.checked)}
                className="w-4 h-4 rounded text-brand-accent border-brand-border focus:ring-0 focus:ring-offset-0 bg-brand-surface cursor-pointer"
              />
              <div className="flex items-center gap-2 text-xs">
                <span>⚠️</span>
                <span className="font-semibold text-brand-text">
                  Esta reseña contiene spoilers de la trama
                </span>
                <span className="text-brand-muted hidden sm:inline">
                  (el texto se ocultará por defecto)
                </span>
              </div>
            </label>
          </div>

          {/* Botones de Acción */}
          <div className="pt-4 border-t border-brand-border/60 flex items-center justify-between gap-3">
            {existingReview ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting || isSubmitting}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/15 border border-rose-500/30 transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Eliminando...' : '🗑️ Eliminar reseña'}
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting || isDeleting}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-brand-muted hover:text-brand-text transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isDeleting}
                className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-brand-accent to-emerald-500 text-brand-bg hover:brightness-110 shadow-lg shadow-brand-accent/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <span>Guardando...</span>
                ) : (
                  <>
                    <span>💾</span>
                    <span>{existingReview ? 'Guardar Cambios' : 'Publicar Reseña'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
