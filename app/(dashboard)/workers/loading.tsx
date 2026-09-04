import React from 'react';

function AvatarRowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-0 animate-pulse">
      <div className="h-9 w-9 rounded-full bg-muted shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 w-36 bg-muted rounded" />
        <div className="h-2.5 w-24 bg-muted rounded" />
      </div>
      <div className="h-3 w-16 bg-muted rounded" />
      <div className="h-3 w-16 bg-muted rounded" />
      <div className="h-5 w-14 bg-muted rounded-full" />
    </div>
  );
}

export default function WorkersLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="h-7 w-32 bg-muted rounded animate-pulse" />
          <div className="h-3 w-72 bg-muted rounded animate-pulse" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-9 w-48 bg-muted rounded-md animate-pulse" />
          <div className="h-9 w-28 bg-muted rounded-md animate-pulse" />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {/* Search bar */}
        <div className="p-4 border-b border-border">
          <div className="h-9 w-72 bg-muted rounded-md animate-pulse" />
        </div>
        {/* Rows */}
        <div>
          {Array.from({ length: 8 }).map((_, i) => <AvatarRowSkeleton key={i} />)}
        </div>
      </div>
    </div>
  );
}
