import React from 'react';

export const CardSkeleton = () => (
  <div className="bg-surface-elevated border border-hairline rounded-card p-5 animate-pulse space-y-4">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-surface-recessed" />
      <div className="space-y-2 flex-1">
        <div className="h-4 bg-surface-recessed rounded w-1/3" />
        <div className="h-3 bg-surface-recessed rounded w-1/4" />
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-4 bg-surface-recessed rounded w-3/4" />
      <div className="h-4 bg-surface-recessed rounded w-full" />
      <div className="h-4 bg-surface-recessed rounded w-2/3" />
    </div>
  </div>
);

export const ProfileSkeleton = () => (
  <div className="bg-surface-elevated border border-hairline rounded-card p-6 animate-pulse space-y-6">
    <div className="flex items-center gap-5">
      <div className="w-20 h-20 rounded-full bg-surface-recessed" />
      <div className="space-y-3 flex-1">
        <div className="h-6 bg-surface-recessed rounded w-1/2" />
        <div className="h-4 bg-surface-recessed rounded w-1/3" />
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-4 bg-surface-recessed rounded w-full" />
      <div className="h-4 bg-surface-recessed rounded w-4/5" />
    </div>
  </div>
);
