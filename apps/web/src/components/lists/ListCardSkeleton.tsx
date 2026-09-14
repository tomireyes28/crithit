import React from 'react';

export const ListCardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col rounded-2xl bg-brand-card/60 border border-brand-border/50 overflow-hidden shadow-sm">
      {/* 2x2 mosaic placeholder with 16:10 aspect */}
      <div className="relative aspect-[16/10] w-full grid grid-cols-2 grid-rows-2 gap-0.5 bg-brand-surface/40 p-0.5">
        <div className="shimmer-bg w-full h-full" />
        <div className="shimmer-bg w-full h-full" />
        <div className="shimmer-bg w-full h-full" />
        <div className="shimmer-bg w-full h-full" />
        {/* Badge placeholder */}
        <div className="absolute top-2.5 right-2.5 w-14 h-5 rounded-md bg-black/50" />
      </div>

      {/* Info placeholder */}
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="h-4 shimmer-bg rounded w-3/4" />
          <div className="h-3 shimmer-bg rounded w-full" />
          <div className="h-3 shimmer-bg rounded w-4/5" />
        </div>

        {/* Tags */}
        <div className="flex gap-1.5 pt-1">
          <div className="h-3.5 w-12 shimmer-bg rounded" />
          <div className="h-3.5 w-10 shimmer-bg rounded" />
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-brand-border/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full shimmer-bg" />
            <div className="h-3 w-16 shimmer-bg rounded" />
          </div>
          <div className="h-3 w-8 shimmer-bg rounded" />
        </div>
      </div>
    </div>
  );
};
