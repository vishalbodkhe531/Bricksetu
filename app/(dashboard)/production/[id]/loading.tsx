import React from 'react';

export default function BatchDetailLoading() {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-4 w-32 bg-muted animate-pulse rounded" />
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-9 w-36 bg-muted animate-pulse rounded-lg" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="h-20 bg-muted/60 animate-pulse rounded-xl" />
        ))}
      </div>

      <div className="h-10 w-full bg-muted/40 animate-pulse rounded-lg" />

      <div className="h-64 w-full bg-muted/30 animate-pulse rounded-xl" />
    </div>
  );
}
