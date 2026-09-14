'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';

interface MotionLikeButtonProps {
  liked: boolean;
  count: number;
  onToggle: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export const MotionLikeButton: React.FC<MotionLikeButtonProps> = ({
  liked,
  count,
  onToggle,
  disabled = false,
  size = 'md',
  className = '',
}) => {
  const [isSparkling, setIsSparkling] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;

    if (!liked) {
      setIsSparkling(true);
      setTimeout(() => setIsSparkling(false), 700);
    }
    onToggle();
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      type="button"
      className={`relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all duration-200 select-none ${
        liked
          ? 'bg-rose-500/15 border-rose-500/40 text-rose-400 hover:bg-rose-500/25'
          : 'bg-brand-surface/60 border-brand-border/60 text-brand-muted hover:text-white hover:border-brand-border hover:bg-brand-surface'
      } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
    >
      <motion.div
        animate={liked ? { scale: [1, 1.45, 0.88, 1.12, 1] } : { scale: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="relative"
      >
        <Heart
          className={`${iconSizes[size]} ${
            liked ? 'fill-rose-500 text-rose-500' : 'text-current'
          } transition-colors`}
        />

        {/* Burst sparkle particles */}
        <AnimatePresence>
          {isSparkling && (
            <>
              {[...Array(6)].map((_, i) => {
                const angle = (i * 60 * Math.PI) / 180;
                const distance = 16;
                const x = Math.cos(angle) * distance;
                const y = Math.sin(angle) * distance;
                return (
                  <motion.span
                    key={i}
                    initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
                    animate={{ opacity: 0, scale: 1.2, x, y }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.55, ease: 'easeOut' }}
                    className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full bg-rose-400 pointer-events-none -translate-x-1/2 -translate-y-1/2"
                  />
                );
              })}
            </>
          )}
        </AnimatePresence>
      </motion.div>

      <span className={`font-mono font-medium ${textSizes[size]}`}>
        {count}
      </span>
    </button>
  );
};
