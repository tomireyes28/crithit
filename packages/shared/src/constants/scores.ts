import { ScoreColorInfo, ScoreRatingBand } from '../types/review.types.js';

export const SCORE_BANDS: ScoreRatingBand[] = [
  {
    min: 90,
    max: 100,
    label: 'Imprescindible',
    colorHex: '#00E676',
    bgClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    textClass: 'text-emerald-400',
    borderClass: 'border-emerald-500',
  },
  {
    min: 80,
    max: 89,
    label: 'Excelente',
    colorHex: '#10B981',
    bgClass: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
    textClass: 'text-teal-400',
    borderClass: 'border-teal-500',
  },
  {
    min: 70,
    max: 79,
    label: 'Muy Bueno',
    colorHex: '#84CC16',
    bgClass: 'bg-lime-500/20 text-lime-400 border-lime-500/40',
    textClass: 'text-lime-400',
    borderClass: 'border-lime-500',
  },
  {
    min: 60,
    max: 69,
    label: 'Bueno',
    colorHex: '#EAB308',
    bgClass: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
    textClass: 'text-yellow-400',
    borderClass: 'border-yellow-500',
  },
  {
    min: 50,
    max: 59,
    label: 'Regular',
    colorHex: '#F97316',
    bgClass: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
    textClass: 'text-orange-400',
    borderClass: 'border-orange-500',
  },
  {
    min: 30,
    max: 49,
    label: 'Malo',
    colorHex: '#EF4444',
    bgClass: 'bg-red-500/20 text-red-400 border-red-500/40',
    textClass: 'text-red-400',
    borderClass: 'border-red-500',
  },
  {
    min: 0,
    max: 29,
    label: 'Terrible',
    colorHex: '#DC2626',
    bgClass: 'bg-rose-950/40 text-rose-500 border-rose-800/40',
    textClass: 'text-rose-500',
    borderClass: 'border-rose-700',
  },
];

/**
 * Normaliza y devuelve la banda correspondiente al score (0-100).
 */
export function getScoreRatingBand(score: number): ScoreRatingBand {
  const normalized = Math.max(0, Math.min(100, Math.round(score)));
  const band = SCORE_BANDS.find((b) => normalized >= b.min && normalized <= b.max);
  return band ?? SCORE_BANDS[SCORE_BANDS.length - 1];
}

/**
 * Retorna la etiqueta en texto del score ("Excelente", "Bueno", etc.)
 */
export function getScoreLabel(score: number): string {
  return getScoreRatingBand(score).label;
}

/**
 * Retorna el código hexadecimal del color para el score.
 */
export function getScoreColor(score: number): string {
  return getScoreRatingBand(score).colorHex;
}

/**
 * Retorna un objeto con las clases Tailwind y metadatos de estilo del score.
 */
export function getScoreColorInfo(score: number): ScoreColorInfo {
  const band = getScoreRatingBand(score);
  return {
    colorHex: band.colorHex,
    label: band.label,
    bgClass: band.bgClass,
    textClass: band.textClass,
    borderClass: band.borderClass,
  };
}
