'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { getScoreColorInfo } from '@crithit/shared';
import { AnimatedScore } from '@/components/ui/AnimatedScore';

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
    md: 'text-sm px-2.5 py-1 min-w-[40px] h-8 rounded-lg',
    lg: 'text-lg px-3.5 py-1.5 min-w-[52px] h-11 rounded-xl',
    xl: 'text-2xl px-5 py-2 min-w-[68px] h-14 rounded-2xl',
  };

  const isMasterpiece = score >= 95;

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <motion.div
        whileHover={{ scale: 1.06, y: -1 }}
        whileTap={{ scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        className={`font-mono font-black flex items-center justify-center border transition-colors duration-300 select-none ${
          sizeClasses[size]
        } ${info.bgClass} ${
          isMasterpiece
            ? 'shadow-[0_0_18px_rgba(0,210,255,0.45)] ring-1 ring-cyan-400/50'
            : ''
        }`}
        style={{ borderColor: `${info.colorHex}88` }}
      >
        <AnimatedScore value={score} animateOnMount={animate} />
      </motion.div>
      {showLabel && (
        <span className="text-xs font-medium text-brand-muted tracking-wide">
          {info.label}
        </span>
      )}
    </div>
  );
};

