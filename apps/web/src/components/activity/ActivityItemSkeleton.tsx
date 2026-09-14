import React from 'react';

export const ActivityItemSkeleton: React.FC = () => {
  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-brand-card/60 border border-brand-border/50 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl shimmer-bg" />
          <div className="space-y-1.5">
            <div className="h-3.5 w-28 shimmer-bg rounded" />
            <div className="h-3 w-20 shimmer-bg rounded" />
          </div>
        </div>
        <div className="h-3 w-16 shimmer-bg rounded" />
      </div>

      {/* Content box */}
      <div className="flex gap-4 p-3 rounded-xl bg-brand-surface/40 border border-brand-border/30">
        <div className="w-16 sm:w-20 aspect-[3/4] shimmer-bg rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-2 py-1">
          <div className="h-4 w-48 shimmer-bg rounded" />
          <div className="h-3 w-full shimmer-bg rounded" />
          <div className="h-3 w-5/6 shimmer-bg rounded" />
          <div className="flex gap-2 pt-1">
            <div className="h-5 w-10 shimmer-bg rounded" />
            <div className="h-5 w-16 shimmer-bg rounded" />
          </div>
        </div>
      </div>
    </div>
  );
};
