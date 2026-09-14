'use client';

import React from 'react';
import { getScoreColorInfo } from '@crithit/shared';

interface ScoreBadgeProps {
  score: number | null | undefined;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
  className?: string;
}

export const ScoreBadge: React.FC<ScoreBadgeProps> = ({
  score,
  size = 'md',
  showLabel = false,
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
      <div
        className={`font-mono font-black flex items-center justify-center border transition-all duration-200 select-none hover:scale-105 ${
          sizeClasses[size]
        } ${info.bgClass} ${
          isMasterpiece
            ? 'shadow-[0_0_14px_rgba(0,230,118,0.45)] ring-1 ring-emerald-400/50'
            : ''
        }`}
        style={{ borderColor: `${info.colorHex}88` }}
      >
        <span>{Math.round(score)}</span>
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-brand-muted tracking-wide">
          {info.label}
        </span>
      )}
    </div>
  );
};
