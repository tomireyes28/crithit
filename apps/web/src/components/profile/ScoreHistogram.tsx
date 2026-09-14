'use client';

import React, { useState } from 'react';
import { ScoreBadge } from '@/components/ui/ScoreBadge';
import { motion } from 'framer-motion';

export interface ScoreHistogramBucket {
  range: string;
  min: number;
  max: number;
  count: number;
}

export interface ScoreHistogramProps {
  distribution: ScoreHistogramBucket[];
  averageScore: number | null;
  totalReviews: number;
}

export const ScoreHistogram: React.FC<ScoreHistogramProps> = ({
  distribution,
  averageScore,
  totalReviews,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const maxCount = Math.max(...distribution.map((d) => d.count), 1);

  // Colores reactivos para cada uno de los 10 intervalos
  const barColors = [
    '#EF4444', // 0-10
    '#F87171', // 11-20
    '#FB7185', // 21-30
    '#FB923C', // 31-40
    '#FBBF24', // 41-50
    '#FACC15', // 51-60
    '#A3E635', // 61-70
    '#34D399', // 71-80
    '#38BDF8', // 81-90
    '#00F5A0', // 91-100 (CritHit Emerald/Cyan)
  ];

  return (
    <div className="p-6 rounded-3xl bg-brand-surface/40 border border-brand-border/60 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-brand-text flex items-center gap-2">
            <span>📊</span>
            <span>Criterio de Calificación</span>
          </h3>
          <p className="text-xs text-brand-muted mt-0.5">
            Distribución de notas otorgadas (escala 0-100)
          </p>
        </div>

        {averageScore !== null && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-brand-muted font-medium">Nota media:</span>
            <ScoreBadge score={averageScore} size="sm" />
          </div>
        )}
      </div>

      {totalReviews === 0 ? (
        <div className="py-8 text-center text-xs text-brand-muted">
          El usuario aún no ha emitido calificaciones ni reseñas.
        </div>
      ) : (
        <div className="space-y-2">
          {/* Contenedor de Barras */}
          <div className="h-32 flex items-end justify-between gap-1.5 sm:gap-2 pt-6 px-1 relative">
            {distribution.map((b, idx) => {
              const heightPercent =
                b.count > 0 ? Math.max(12, (b.count / maxCount) * 100) : 4;
              const isHovered = hoveredIndex === idx;
              const color = barColors[idx] || '#38BDF8';

              return (
                <div
                  key={b.range}
                  className="flex-1 flex flex-col items-center justify-end h-full relative group cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {/* Tooltip flotante */}
                  {isHovered && (
                    <div className="absolute -top-9 z-20 px-2 py-1 rounded-md bg-brand-card border border-brand-border text-[11px] font-mono font-bold text-white shadow-xl whitespace-nowrap animate-fade-in pointer-events-none">
                      {b.range}: {b.count} {b.count === 1 ? 'juego' : 'juegos'}
                    </div>
                  )}

                  {/* Barra */}
                  <motion.div
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 0.45, delay: idx * 0.03, ease: 'easeOut' }}
                    className="w-full rounded-t-md origin-bottom transition-all duration-300"
                    style={{
                      height: `${heightPercent}%`,
                      backgroundColor: isHovered ? color : `${color}cc`,
                      boxShadow: isHovered ? `0 0 14px ${color}90` : undefined,
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* Eje horizontal de etiquetas */}
          <div className="flex items-center justify-between text-[10px] font-mono text-brand-muted pt-1 border-t border-brand-border/40 px-1">
            <span>0</span>
            <span>20</span>
            <span>40</span>
            <span>60</span>
            <span>80</span>
            <span>100</span>
          </div>
        </div>
      )}
    </div>
  );
};
