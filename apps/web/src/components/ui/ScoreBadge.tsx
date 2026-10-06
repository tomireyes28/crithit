'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { getScoreColorInfo } from '@crithit/shared';
import { AnimatedScore } from '@/components/ui/AnimatedScore';
import { SPRING_BOUNCY } from '@/components/ui/MotionWrapper';

interface ScoreBadgeProps {
  score: number | null | undefined;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
  animate?: boolean;
  className?: string;
}

export const ScoreBadge: React.FC<ScoreBadgeProps> = ({
  score,
  size = 'md',
  showLabel = false,
  animate = true,
  className = '',
}) => {
  if (score === null || score === undefined || isNaN(score)) {
    return (
      <span className="inline-flex items-center justify-center font-mono font-bold text-brand-muted bg-brand-surface border border-brand-border rounded-lg px-2 py-1 text-xs">
        N/A
      </span>
    );
  }

  const info = getScoreColorInfo(score);

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 min-w-[32px] h-6 rounded',
    md: 'text-sm px-2.5 py-1 min-w-[42px] h-8 rounded-lg',
    lg: 'text-lg px-3.5 py-1.5 min-w-[54px] h-11 rounded-xl',
    xl: 'text-2xl px-5 py-2 min-w-[70px] h-14 rounded-2xl',
  };

  const isMasterpiece = score >= 95;

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <motion.div
        whileHover={{
          scale: 1.08,
          y: -2,
          boxShadow: `0 0 22px ${info.colorHex}77`,
        }}
        whileTap={{ scale: 0.94 }}
        transition={SPRING_BOUNCY}
        className={`relative font-mono font-black flex items-center justify-center border transition-all duration-300 select-none ${
          sizeClasses[size]
        } ${info.bgClass} ${
          isMasterpiece
            ? 'shadow-[0_0_20px_rgba(0,210,255,0.45)] ring-1 ring-cyan-400/60'
            : 'shadow-md'
        }`}
        style={{ borderColor: `${info.colorHex}88` }}
      >
        <AnimatedScore value={score} animateOnMount={animate} />

        {isMasterpiece && size !== 'sm' && (
          <Sparkles className="w-3 h-3 ml-1 text-cyan-300 animate-pulse" />
        )}
      </motion.div>
      {showLabel && (
        <span className="text-xs font-semibold text-brand-muted tracking-wide">
          {info.label}
        </span>
      )}
    </div>
  );
};
