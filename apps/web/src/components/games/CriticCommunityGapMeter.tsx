'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Scale, Flame, Award, Users } from 'lucide-react';
import { ScoreBadge } from '@/components/ui/ScoreBadge';

export interface CriticCommunityGapMeterProps {
  criticScore: number;
  communityScore: number;
  criticCount?: number;
  communityCount?: number;
  compact?: boolean;
  showVerdict?: boolean;
  customVerdict?: string;
}

export const CriticCommunityGapMeter: React.FC<CriticCommunityGapMeterProps> = ({
  criticScore,
  communityScore,
  criticCount,
  communityCount,
  compact = false,
  showVerdict = true,
  customVerdict,
}) => {
  const gap = Math.abs(criticScore - communityScore);
  const disparity = criticScore - communityScore;
  const isCriticHigher = disparity > 0;
  const isCommunityHigher = disparity < 0;
  const isEven = disparity === 0;

  // Normalizar posición del marcador (0% = 100% comunidad, 50% = empate, 100% = 100% crítica)
  // Escala de -50 a +50 mapeada a 0%..100%
  const clampedDisparity = Math.max(-40, Math.min(40, disparity));
  const pointerPercent = 50 + (clampedDisparity / 80) * 50;

  // Nivel de polarización
  let polarizationLevel = 'Baja';
  let badgeColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  if (gap >= 22) {
    polarizationLevel = 'Extrema';
    badgeColor = 'text-rose-400 bg-rose-500/15 border-rose-500/35 shadow-[0_0_15px_rgba(244,63,94,0.2)]';
  } else if (gap >= 12) {
    polarizationLevel = 'Alta';
    badgeColor = 'text-amber-400 bg-amber-500/15 border-amber-500/30';
  } else if (gap >= 6) {
    polarizationLevel = 'Moderada';
    badgeColor = 'text-cyan-400 bg-cyan-500/10 border-cyan-500/25';
  }

  // Veredicto automático si no se provee customVerdict
  const verdictText =
    customVerdict ||
    (isCriticHigher
      ? `La crítica especializada califica este título ${gap} puntos por encima de la comunidad. Apreciado por la prensa por su audacia artística o técnica, pero con opiniones divididas entre los jugadores.`
      : isCommunityHigher
        ? `La comunidad valora este título ${gap} puntos por encima de la prensa. Un clásico de culto ampliamente respaldado por los jugadores a pesar de análisis críticos iniciales más cautos.`
        : 'Consenso equilibrado: Tanto la crítica acreditada como la comunidad de jugadores coinciden con la misma apreciación.');

  if (compact) {
    return (
      <div className="p-3 rounded-xl bg-brand-surface/70 border border-brand-border/60 backdrop-blur-md space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-white">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Brecha Crítica vs Comunidad</span>
          </div>
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${badgeColor}`}>
            Δ {gap} pts
          </span>
        </div>

        {/* Barra de tensión compacta */}
        <div className="relative h-2 rounded-full overflow-hidden bg-brand-bg border border-brand-border/40">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-amber-400 to-cyan-400 opacity-80" />
          <motion.div
            initial={{ left: '50%' }}
            animate={{ left: `${pointerPercent}%` }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="absolute top-0 bottom-0 w-2 -ml-1 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)] z-10"
          />
        </div>

        <div className="flex items-center justify-between text-[10px] font-semibold text-brand-muted">
          <span className="flex items-center gap-1 text-emerald-400">
            <Users className="w-3 h-3" /> Jugadores ({communityScore})
          </span>
          <span className="flex items-center gap-1 text-cyan-400">
            Crítica ({criticScore}) <Award className="w-3 h-3" />
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-brand-surface/50 border border-brand-border/70 backdrop-blur-md relative overflow-hidden space-y-4">
      {/* Resplandor ambiental de polarización */}
      <div
        className={`absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-20 ${
          gap >= 18 ? 'bg-rose-500' : 'bg-amber-500'
        }`}
      />

      {/* Cabecera del Medidor */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-brand-border/40 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>El Gran Debate: Critic vs Community Gap</span>
            </h3>
            <p className="text-[11px] text-brand-muted">
              Medición de disparidad de criterios entre analistas certificados y jugadores
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className={`px-2.5 py-1 rounded-lg text-xs font-black tracking-wide border flex items-center gap-1.5 ${badgeColor}`}>
            <Flame className="w-3.5 h-3.5" />
            <span>Polarización {polarizationLevel} (Δ {gap} pts)</span>
          </span>
        </div>
      </div>

      {/* Comparador Cara a Cara */}
      <div className="grid grid-cols-2 gap-4 items-center">
        {/* Lado Comunidad */}
        <div className="p-3.5 rounded-xl bg-brand-bg/60 border border-emerald-500/20 flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 flex items-center gap-1">
              <Users className="w-3 h-3" /> Comunidad
            </span>
            <span className="text-xs text-brand-muted block">
              {communityCount ? `${communityCount.toLocaleString()} votos` : 'Opinión popular'}
            </span>
          </div>
          <ScoreBadge score={communityScore} size="md" />
        </div>

        {/* Lado Crítica */}
        <div className="p-3.5 rounded-xl bg-brand-bg/60 border border-cyan-500/20 flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400 flex items-center gap-1">
              <Award className="w-3 h-3" /> Crítica Verificada
            </span>
            <span className="text-xs text-brand-muted block">
              {criticCount ? `${criticCount} analistas` : 'Prensa acreditada'}
            </span>
          </div>
          <ScoreBadge score={criticScore} size="md" />
        </div>
      </div>

      {/* Barra de Tensión / Tug-of-War Visual */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between text-[11px] font-bold">
          <span className={isCommunityHigher ? 'text-emerald-400' : 'text-brand-muted'}>
            ◀ Inclinación Jugadores {isCommunityHigher ? `(+${gap} pts)` : ''}
          </span>
          <span className="text-brand-muted text-[10px] font-mono">
            {isEven ? 'Equilibrio perfecto' : 'Punto de Tensión'}
          </span>
          <span className={isCriticHigher ? 'text-cyan-400' : 'text-brand-muted'}>
            {isCriticHigher ? `(+${gap} pts)` : ''} Inclinación Críticos ▶
          </span>
        </div>

        <div className="relative h-3 rounded-full overflow-hidden bg-brand-bg border border-brand-border/60">
          {/* Pista de color gradiente continuo */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-amber-500/40 to-cyan-500 opacity-70" />

          {/* Línea de referencia central (empate 0) */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-brand-text/40 z-0" />

          {/* Puntero reactivo de tensión */}
          <motion.div
            initial={{ left: '50%' }}
            animate={{ left: `${pointerPercent}%` }}
            transition={{ type: 'spring', stiffness: 220, damping: 22 }}
            className="absolute top-0 bottom-0 w-3 -ml-1.5 bg-white rounded-full shadow-[0_0_12px_rgba(255,255,255,0.9)] z-10 flex items-center justify-center"
          >
            <div className="w-1 h-1 rounded-full bg-brand-bg" />
          </motion.div>
        </div>
      </div>

      {/* Veredicto de la Brecha */}
      {showVerdict && (
        <div className="p-3 rounded-xl bg-brand-surface/40 border border-brand-border/40 text-xs text-brand-muted leading-relaxed flex items-start gap-2.5">
          <Zap className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <span>{verdictText}</span>
        </div>
      )}
    </div>
  );
};
