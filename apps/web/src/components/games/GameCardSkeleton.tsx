import React from 'react';

export const GameCardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col rounded-2xl bg-brand-card/60 border border-brand-border/50 overflow-hidden shadow-sm">
      {/* Aspect ratio 3:4 matching GameCard */}
      <div className="relative aspect-[3/4] w-full shimmer-bg">
        <div className="absolute top-2.5 right-2.5 w-9 h-7 rounded-lg bg-white/10" />
        <div className="absolute top-2.5 left-2.5 w-12 h-5 rounded-md bg-white/10" />
      </div>
      <div className="p-3.5 space-y-3">
        <div className="space-y-1.5">
          <div className="h-4 shimmer-bg rounded w-4/5" />
          <div className="h-3 shimmer-bg rounded w-2/3" />
        </div>
        <div className="flex gap-1">
          <div className="h-3 shimmer-bg rounded w-12" />
          <div className="h-3 shimmer-bg rounded w-10" />
        </div>
        <div className="pt-2 border-t border-brand-border/40 flex gap-1">
          <div className="h-3 shimmer-bg rounded w-8" />
          <div className="h-3 shimmer-bg rounded w-8" />
        </div>
      </div>
    </div>
  );
};
