'use client';

import React, { useState } from 'react';
import { ScoreBadge } from '@/components/ui/ScoreBadge';
import { motion, AnimatePresence } from 'framer-motion';
import { SPRING_BOUNCY } from '@/components/ui/MotionWrapper';

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
    <div className="p-6 rounded-3xl glass-card-v2 border border-white/[0.08] relative overflow-hidden space-y-6 shadow-xl">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
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
                  {/* Tooltip flotante con resorte elástico */}
                  <AnimatePresence>
                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.95 }}
                        transition={SPRING_BOUNCY}
                        className="absolute -top-10 z-30 px-2.5 py-1 rounded-lg bg-brand-surface/95 border border-brand-accent/40 backdrop-blur-md text-[11px] font-mono font-bold text-white shadow-[0_4px_16px_rgba(0,0,0,0.5)] whitespace-nowrap pointer-events-none"
                      >
                        {b.range}: <span className="text-brand-accent">{b.count}</span> {b.count === 1 ? 'juego' : 'juegos'}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Barra con entrada elástica y cap luminoso */}
                  <motion.div
                    initial={{ scaleY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      type: 'spring',
                      stiffness: 240,
                      damping: 18,
                      delay: idx * 0.035,
                    }}
                    className="w-full rounded-t-md origin-bottom relative overflow-hidden transition-all duration-300"
                    style={{
                      height: `${heightPercent}%`,
                      backgroundColor: isHovered ? color : `${color}cc`,
                      boxShadow: isHovered
                        ? `0 0 16px ${color}aa, inset 0 1px 0 rgba(255,255,255,0.4)`
                        : `inset 0 1px 0 rgba(255,255,255,0.2)`,
                    }}
                  >
                    {/* Borde superior luminoso 2px */}
                    <div
                      className="absolute top-0 left-0 right-0 h-0.5"
                      style={{
                        backgroundColor: '#ffffff',
                        opacity: isHovered ? 0.9 : 0.4,
                      }}
                    />
                  </motion.div>
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

