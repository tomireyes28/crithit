import React from 'react';

export const NewsCardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col rounded-2xl bg-brand-card/60 border border-brand-border/50 overflow-hidden shadow-sm">
      {/* Header image aspect-video */}
      <div className="relative aspect-video w-full shimmer-bg">
        <div className="absolute top-3 left-3 w-16 h-5 rounded-md bg-white/10" />
      </div>

      {/* Body */}
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="h-4 shimmer-bg rounded w-4/5" />
          <div className="h-3 shimmer-bg rounded w-full" />
          <div className="h-3 shimmer-bg rounded w-3/4" />
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-brand-border/40 flex items-center justify-between">
          <div className="h-3 w-20 shimmer-bg rounded" />
          <div className="h-3 w-14 shimmer-bg rounded" />
        </div>
      </div>
    </div>
  );
};
