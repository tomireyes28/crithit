import React from 'react';

export const NotificationSkeleton: React.FC = () => {
  return (
    <div className="p-4 rounded-xl bg-brand-card/60 border border-brand-border/40 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-xl shimmer-bg flex-shrink-0" />
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="h-3.5 shimmer-bg rounded w-3/4" />
          <div className="h-3 shimmer-bg rounded w-1/3" />
        </div>
      </div>
      <div className="w-6 h-6 shimmer-bg rounded-lg flex-shrink-0" />
    </div>
  );
};
