'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap } from 'lucide-react';

interface ScoreSliderProps {
  initialValue?: number;
  value?: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
}

// Interpolador de color continuo (0 a 100)
function interpolateScoreColor(score: number): { hex: string; rgba: (a: number) => string } {
  const stops = [
    { score: 0, r: 239, g: 68, b: 68 },     // #EF4444 (Rojo)
    { score: 35, r: 249, g: 115, b: 22 },   // #F97316 (Naranja)
    { score: 60, r: 245, g: 158, b: 11 },   // #F59E0B (Ámbar dorado)
    { score: 75, r: 16, g: 185, b: 129 },   // #10B981 (Verde esmeralda)
    { score: 90, r: 0, g: 210, b: 255 },    // #00D2FF (Cian eléctrico)
    { score: 100, r: 168, g: 85, b: 247 },  // #A855F7 (Violeta obra maestra)
  ];

  const clamped = Math.max(0, Math.min(100, score));

  let lower = stops[0];
  let upper = stops[stops.length - 1];

  for (let i = 0; i < stops.length - 1; i++) {
    if (clamped >= stops[i].score && clamped <= stops[i + 1].score) {
      lower = stops[i];
      upper = stops[i + 1];
      break;
    }
  }

  const range = upper.score - lower.score;
  const t = range === 0 ? 0 : (clamped - lower.score) / range;

  // Easing suave cuadrático para la mezcla cromática
  const easedT = t * t * (3 - 2 * t);

  const r = Math.round(lower.r + (upper.r - lower.r) * easedT);
  const g = Math.round(lower.g + (upper.g - lower.g) * easedT);
  const b = Math.round(lower.b + (upper.b - lower.b) * easedT);

  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;

  return {
    hex,
    rgba: (a: number) => `rgba(${r}, ${g}, ${b}, ${a})`,
  };
}

function getTierLabel(score: number): { label: string; icon?: string } {
  if (score >= 95) return { label: 'Obra Maestra Imprescindible' };
  if (score >= 90) return { label: 'Excelente / Joya' };
  if (score >= 80) return { label: 'Muy Bueno' };
  if (score >= 70) return { label: 'Recomendable' };
  if (score >= 60) return { label: 'Aceptable / Decente' };
  if (score >= 50) return { label: 'Mediocre' };
  if (score >= 35) return { label: 'Decepcionante' };
  return { label: 'Deficiente / Injugable' };
}

export const ScoreSlider: React.FC<ScoreSliderProps> = ({
  initialValue = 85,
  value,
  onChange,
  disabled = false,
}) => {
  const [score, setScore] = useState<number>(value ?? initialValue);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (value !== undefined) {
      setScore(value);
    }
  }, [value]);

  const colorInfo = useMemo(() => interpolateScoreColor(score), [score]);
  const tier = useMemo(() => getTierLabel(score), [score]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setScore(val);
    onChange?.(val);
  };

  const setPreset = (val: number) => {
    setScore(val);
    onChange?.(val);
  };

  const isMasterpiece = score >= 95;

  return (
    <div
      className="w-full bg-brand-card/90 backdrop-blur-xl border rounded-3xl p-6 shadow-2xl space-y-6 transition-all duration-300 relative overflow-hidden"
      style={{
        borderColor: colorInfo.rgba(0.25),
        boxShadow: `0 10px 40px -10px ${colorInfo.rgba(0.18)}`,
      }}
    >
      {/* Dynamic Ambient Background Glow */}
      <div
        className="absolute -top-24 -right-24 w-60 h-60 rounded-full filter blur-3xl opacity-20 pointer-events-none transition-colors duration-300"
        style={{ backgroundColor: colorInfo.hex }}
      />

      {/* Cabecera con puntaje y badge elástico */}
      <div className="flex items-center justify-between relative z-10">
        <div>
          <span className="text-[11px] uppercase tracking-widest text-brand-muted font-mono font-bold block mb-1">
            Puntuación CritHit (0 al 100)
          </span>
          <div className="flex items-center gap-2">
            <h4 className="text-lg sm:text-xl font-bold text-brand-text">
              Tu Calificación:
            </h4>
            <span
              className="text-2xl font-black font-mono transition-colors duration-150"
              style={{ color: colorInfo.hex }}
            >
              {score}/100
            </span>
          </div>
        </div>

        {/* Badge Dinámico con rebote y resplandor */}
        <motion.div
          key={Math.floor(score / 5)}
          initial={{ scale: 0.94 }}
          animate={{ scale: isDragging ? 1.1 : 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          className="font-mono font-black text-2xl sm:text-3xl h-14 min-w-[72px] px-4 rounded-2xl border flex items-center justify-center transition-colors duration-150 select-none shadow-xl"
          style={{
            backgroundColor: colorInfo.rgba(0.15),
            borderColor: colorInfo.rgba(0.6),
            color: colorInfo.hex,
            boxShadow: `0 0 25px -4px ${colorInfo.rgba(0.4)}`,
          }}
        >
          <span>{score}</span>
          {isMasterpiece && (
            <Sparkles className="w-4 h-4 ml-1 text-cyan-300 animate-spin" style={{ animationDuration: '6s' }} />
          )}
        </motion.div>
      </div>

      {/* Slider Interactivo con Barra Líquida */}
      <div className="space-y-3 relative z-10">
        {/* Track de progreso animado */}
        <div className="relative h-3.5 bg-brand-surface/80 rounded-full overflow-hidden border border-brand-border/60 shadow-inner">
          <motion.div
            className="h-full rounded-full"
            style={{
              width: `${score}%`,
              background: `linear-gradient(90deg, ${interpolateScoreColor(0).hex} 0%, ${colorInfo.hex} 100%)`,
              boxShadow: `0 0 16px ${colorInfo.rgba(0.7)}`,
            }}
          />
        </div>

        {/* Input de rango nativo estilizado */}
        <div className="relative -mt-4">
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={score}
            onChange={handleSliderChange}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onTouchStart={() => setIsDragging(true)}
            onTouchEnd={() => setIsDragging(false)}
            disabled={disabled}
            className="w-full cursor-pointer appearance-none bg-transparent focus:outline-none disabled:opacity-50 h-5 relative z-20"
            style={{ accentColor: colorInfo.hex }}
          />
        </div>
      </div>

      {/* Etiqueta de Rango Dinámica con animación pop al cambiar de tier */}
      <div className="flex items-center justify-between text-xs text-brand-muted relative z-10 pt-1">
        <span className="text-rose-400 font-medium">0 - Deficiente</span>

        <AnimatePresence mode="wait">
          <motion.span
            key={tier.label}
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="font-bold text-xs sm:text-sm tracking-wide px-3.5 py-1 rounded-full border shadow-sm flex items-center gap-1.5"
            style={{
              color: colorInfo.hex,
              borderColor: colorInfo.rgba(0.4),
              backgroundColor: colorInfo.rgba(0.12),
            }}
          >
            {isMasterpiece && <Zap className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />}
            {tier.label}
          </motion.span>
        </AnimatePresence>

        <span className="text-purple-400 font-medium">100 - Obra Maestra</span>
      </div>

      {/* Presets Rápidos con física táctil */}
      <div className="pt-3 border-t border-brand-border/40 flex items-center justify-between gap-1.5 overflow-x-auto text-xs relative z-10">
        {[
          { label: '25', val: 25 },
          { label: '50', val: 50 },
          { label: '70', val: 70 },
          { label: '80', val: 80 },
          { label: '90', val: 90 },
          { label: '95', val: 95 },
          { label: '100', val: 100 },
        ].map((item) => {
          const isSelected = score === item.val;
          const itemColor = interpolateScoreColor(item.val);
          return (
            <motion.button
              key={item.val}
              type="button"
              whileHover={{ scale: 1.08, y: -1 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => setPreset(item.val)}
              className={`flex-1 py-1.5 rounded-xl font-mono text-xs font-bold transition-all border ${
                isSelected
                  ? 'text-brand-bg shadow-md'
                  : 'bg-brand-surface/40 hover:bg-brand-surface text-brand-muted hover:text-brand-text border-brand-border/60'
              }`}
              style={
                isSelected
                  ? {
                      backgroundColor: itemColor.hex,
                      borderColor: itemColor.hex,
                      boxShadow: `0 0 12px ${itemColor.rgba(0.4)}`,
                    }
                  : {}
              }
            >
              {item.label}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
