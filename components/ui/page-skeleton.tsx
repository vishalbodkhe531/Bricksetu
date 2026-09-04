import React from 'react';

function RowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-border last:border-0 animate-pulse">
      {Array.from({ length: cols }).map((_, i) => (
        <div key={i} className={`h-3 bg-muted rounded ${i === 0 ? 'w-32' : i === cols - 1 ? 'w-16 ml-auto' : 'w-24'}`} />
      ))}
    </div>
  );
}

export default function GenericPageLoading() {
  return (
    <div className="space-y-6">
      {/* Page header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <div className="h-7 w-48 bg-muted rounded animate-pulse" />
          <div className="h-3 w-72 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-9 w-28 bg-muted rounded-md animate-pulse" />
      </div>

      {/* Filter / search bar skeleton */}
      <div className="flex items-center gap-3">
        <div className="h-9 flex-1 max-w-xs bg-muted rounded-md animate-pulse" />
        <div className="h-9 w-24 bg-muted rounded-md animate-pulse" />
        <div className="h-9 w-24 bg-muted rounded-md animate-pulse" />
      </div>

      {/* Table skeleton */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {/* Table header */}
        <div className="flex items-center gap-4 px-4 py-2.5 border-b border-border bg-muted/50">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={`h-2.5 bg-muted rounded ${i === 0 ? 'w-24' : i === 4 ? 'w-16 ml-auto' : 'w-16'}`} />
          ))}
        </div>
        {/* Table rows */}
        {Array.from({ length: 8 }).map((_, i) => <RowSkeleton key={i} />)}
      </div>
    </div>
  );
}
