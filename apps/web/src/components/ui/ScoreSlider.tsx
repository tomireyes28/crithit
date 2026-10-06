'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, Flame, Award, AlertTriangle } from 'lucide-react';
import { SPRING_BOUNCY, SPRING_SNAPPY } from './MotionWrapper';

interface ScoreSliderProps {
  initialValue?: number;
  value?: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
  className?: string;
}

// Interpolador de color continuo de alta fidelidad (0 a 100)
function interpolateScoreColor(score: number): { hex: string; rgba: (a: number) => string; tierName: string } {
  const stops = [
    { score: 0, r: 239, g: 68, b: 68, name: 'Deficiente' },       // #EF4444 (Rojo)
    { score: 35, r: 249, g: 115, b: 22, name: 'Decepcionante' },  // #F97316 (Naranja)
    { score: 60, r: 245, g: 158, b: 11, name: 'Aceptable' },      // #F59E0B (Ámbar dorado)
    { score: 75, r: 16, g: 185, b: 129, name: 'Recomendable' },   // #10B981 (Verde esmeralda)
    { score: 90, r: 0, g: 210, b: 255, name: 'Excelente' },       // #00D2FF (Cian eléctrico)
    { score: 100, r: 168, g: 85, b: 247, name: 'Obra Maestra' },  // #A855F7 (Violeta místico)
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

  // Curva de mezcla cúbica suave
  const easedT = t * t * (3 - 2 * t);

  const r = Math.round(lower.r + (upper.r - lower.r) * easedT);
  const g = Math.round(lower.g + (upper.g - lower.g) * easedT);
  const b = Math.round(lower.b + (upper.b - lower.b) * easedT);

  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;

  return {
    hex,
    rgba: (a: number) => `rgba(${r}, ${g}, ${b}, ${a})`,
    tierName: clamped >= 95 ? 'Obra Maestra' : upper.name,
  };
}

function getTierDetails(score: number): { label: string; badge: string; icon: React.ReactNode } {
  if (score >= 95)
    return {
      label: 'Obra Maestra Imprescindible',
      badge: 'MASTERPIECE',
      icon: <Sparkles className="w-4 h-4 text-cyan-300" />,
    };
  if (score >= 90)
    return {
      label: 'Joya / Excelente',
      badge: 'EXCELLENT',
      icon: <Award className="w-4 h-4 text-cyan-400" />,
    };
  if (score >= 80)
    return {
      label: 'Muy Bueno',
      badge: 'GREAT',
      icon: <Zap className="w-4 h-4 text-emerald-400" />,
    };
  if (score >= 70)
    return {
      label: 'Recomendable',
      badge: 'GOOD',
      icon: <Zap className="w-4 h-4 text-emerald-400" />,
    };
  if (score >= 60)
    return {
      label: 'Aceptable / Decente',
      badge: 'FAIR',
      icon: <Flame className="w-4 h-4 text-amber-400" />,
    };
  if (score >= 50)
    return {
      label: 'Mediocre',
      badge: 'MEDIOCRE',
      icon: <Flame className="w-4 h-4 text-amber-400" />,
    };
  if (score >= 35)
    return {
      label: 'Decepcionante',
      badge: 'POOR',
      icon: <AlertTriangle className="w-4 h-4 text-orange-400" />,
    };
  return {
    label: 'Deficiente / Injugable',
    badge: 'BAD',
    icon: <AlertTriangle className="w-4 h-4 text-rose-400" />,
  };
}

const MILESTONES = [25, 50, 75, 90, 100];

export const ScoreSlider: React.FC<ScoreSliderProps> = ({
  initialValue = 85,
  value,
  onChange,
  disabled = false,
  className = '',
}) => {
  const [score, setScore] = useState<number>(value ?? initialValue);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value !== undefined) {
      setScore(value);
    }
  }, [value]);

  const colorInfo = useMemo(() => interpolateScoreColor(score), [score]);
  const tier = useMemo(() => getTierDetails(score), [score]);

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
  const isCriticalLow = score <= 35;

  return (
    <div
      className={`w-full glass-card-v2 rounded-3xl p-6 sm:p-7 space-y-6 transition-all duration-300 relative overflow-hidden ${
        isCriticalLow ? 'border-rose-500/30' : ''
      } ${className}`}
      style={{
        borderColor: colorInfo.rgba(isDragging ? 0.6 : 0.28),
        boxShadow: isDragging
          ? `0 16px 50px -10px ${colorInfo.rgba(0.35)}, 0 0 25px ${colorInfo.rgba(0.2)}`
          : `0 10px 40px -12px ${colorInfo.rgba(0.18)}`,
      }}
    >
      {/* Dynamic Reactive Back-Light Ambient Halo */}
      <motion.div
        animate={{
          scale: isDragging ? [1, 1.15, 1.08] : 1,
          opacity: isDragging ? 0.45 : isMasterpiece ? 0.35 : 0.18,
        }}
        transition={{ duration: 0.4 }}
        className="absolute -top-28 -right-28 w-72 h-72 rounded-full filter blur-3xl pointer-events-none transition-colors duration-300 -z-10"
        style={{ backgroundColor: colorInfo.hex }}
      />

      {/* Partículas de destellos de obra maestra (≥95) */}
      {isMasterpiece && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30, scale: 0.5 }}
              animate={{
                opacity: [0, 0.8, 0],
                y: [-10, -50],
                x: [0, (i % 2 === 0 ? 1 : -1) * 15],
                scale: [0.5, 1.2, 0.4],
              }}
              transition={{
                duration: 2.2 + (i % 3) * 0.4,
                repeat: Infinity,
                delay: i * 0.35,
                ease: 'easeOut',
              }}
              className="absolute w-2 h-2 rounded-full"
              style={{
                left: `${15 + i * 14}%`,
                bottom: '20%',
                backgroundColor: i % 2 === 0 ? '#00D2FF' : '#A855F7',
                boxShadow: `0 0 8px ${i % 2 === 0 ? '#00D2FF' : '#A855F7'}`,
              }}
            />
          ))}
        </div>
      )}

      {/* Cabecera con número grande reactivo y badge elástico */}
      <div className="flex items-center justify-between relative z-10 gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-widest text-brand-muted font-mono font-bold">
              Puntuación CritHit
            </span>
            <span
              className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md border"
              style={{
                color: colorInfo.hex,
                borderColor: colorInfo.rgba(0.4),
                backgroundColor: colorInfo.rgba(0.12),
              }}
            >
              {tier.badge}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <h4 className="text-base sm:text-lg font-bold text-white/90">
              Tu Calificación:
            </h4>
            <motion.span
              animate={{ scale: isDragging ? 1.08 : 1 }}
              transition={SPRING_BOUNCY}
              className="text-2xl sm:text-3xl font-black font-mono transition-colors duration-150"
              style={{ color: colorInfo.hex }}
            >
              {score}
              <span className="text-xs sm:text-sm font-sans text-brand-muted font-normal ml-1">
                /100
              </span>
            </motion.span>
          </div>
        </div>

        {/* Badge Dinámico con rebote y anillo de energía */}
        <motion.div
          animate={{
            scale: isDragging ? 1.12 : 1,
            rotate: isDragging ? [-1, 1, 0] : 0,
          }}
          transition={SPRING_BOUNCY}
          className="relative font-mono font-black text-2xl sm:text-3xl h-14 min-w-[76px] px-4 rounded-2xl border flex items-center justify-center select-none shadow-2xl overflow-hidden"
          style={{
            backgroundColor: colorInfo.rgba(0.18),
            borderColor: colorInfo.rgba(0.65),
            color: colorInfo.hex,
            boxShadow: `0 0 30px -4px ${colorInfo.rgba(0.45)}`,
          }}
        >
          {/* Shimmer sweep en obra maestra */}
          {isMasterpiece && (
            <motion.div
              animate={{ x: ['-100%', '200%'] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: 'linear' }}
              className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 pointer-events-none"
            />
          )}

          <span>{score}</span>
          {isMasterpiece && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              className="ml-1 text-cyan-300"
            >
              <Sparkles className="w-4 h-4 fill-cyan-300/40" />
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Slider Interactivo con Barra Líquida y Micro-landmarks */}
      <div className="space-y-3 relative z-10 pt-2">
        {/* Track de progreso animado */}
        <div className="relative h-4 bg-brand-surface/90 rounded-full overflow-hidden border border-brand-border/80 shadow-inner">
          {/* Relleno de gradiente continuo */}
          <motion.div
            className="h-full rounded-full relative"
            style={{
              width: `${score}%`,
              background: `linear-gradient(90deg, ${interpolateScoreColor(0).hex} 0%, ${colorInfo.hex} 100%)`,
              boxShadow: `0 0 20px ${colorInfo.rgba(0.8)}`,
            }}
          >
            {/* Punta de luz líquida brillante en el borde del avance */}
            <div
              className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-lg pointer-events-none"
              style={{
                boxShadow: `0 0 10px 2px #fff, 0 0 18px 4px ${colorInfo.hex}`,
              }}
            />
          </motion.div>

          {/* Marcadores de hitos (25, 50, 75, 90) */}
          <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
            {MILESTONES.slice(0, -1).map((m) => (
              <div
                key={m}
                className="w-1 h-2 rounded-full transition-colors duration-200"
                style={{
                  backgroundColor: score >= m ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.1)',
                }}
              />
            ))}
          </div>
        </div>

        {/* Input de rango nativo oculto pero completamente accesible y táctil */}
        <div className="relative -mt-4">
          <input
            ref={sliderRef}
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
            className="w-full cursor-pointer appearance-none bg-transparent focus:outline-none disabled:opacity-50 h-6 relative z-20"
            style={{ accentColor: colorInfo.hex }}
            aria-label="Calificación de 0 a 100"
          />
        </div>
      </div>

      {/* Etiqueta de Rango Dinámica con animación pop al cambiar de tier */}
      <div className="flex items-center justify-between text-xs text-brand-muted relative z-10 pt-1">
        <span className="text-rose-400 font-medium font-mono text-[11px]">0 Deficiente</span>

        <AnimatePresence mode="wait">
          <motion.div
            key={tier.label}
            initial={{ opacity: 0, y: 6, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.92 }}
            transition={SPRING_BOUNCY}
            className="font-bold text-xs sm:text-sm tracking-wide px-4 py-1.5 rounded-full border shadow-md flex items-center gap-1.5"
            style={{
              color: colorInfo.hex,
              borderColor: colorInfo.rgba(0.45),
              backgroundColor: colorInfo.rgba(0.14),
              boxShadow: `0 0 16px ${colorInfo.rgba(0.25)}`,
            }}
          >
            {tier.icon}
            <span>{tier.label}</span>
          </motion.div>
        </AnimatePresence>

        <span className="text-purple-400 font-medium font-mono text-[11px]">100 Masterpiece</span>
      </div>

      {/* Presets Rápidos con micro-física elástica */}
      <div className="pt-3 border-t border-brand-border/40 flex items-center justify-between gap-1.5 overflow-x-auto text-xs relative z-10 no-scrollbar">
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
              whileTap={{ scale: 0.92 }}
              transition={SPRING_SNAPPY}
              onClick={() => setPreset(item.val)}
              className={`flex-1 py-1.5 px-2 rounded-xl font-mono text-xs font-bold transition-all border ${
                isSelected
                  ? 'text-brand-bg shadow-lg font-black'
                  : 'bg-brand-surface/40 hover:bg-brand-surface text-brand-muted hover:text-brand-text border-brand-border/60'
              }`}
              style={
                isSelected
                  ? {
                      backgroundColor: itemColor.hex,
                      borderColor: itemColor.hex,
                      boxShadow: `0 0 14px ${itemColor.rgba(0.5)}`,
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
