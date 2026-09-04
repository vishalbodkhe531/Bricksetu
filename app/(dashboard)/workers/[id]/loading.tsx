import React from 'react';

export default function WorkerDetailLoading() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-pulse">
      {/* Back button + header */}
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 bg-muted rounded-md" />
        <div className="space-y-1">
          <div className="h-6 w-48 bg-muted rounded" />
          <div className="h-3 w-32 bg-muted rounded" />
        </div>
      </div>

      {/* Profile card */}
      <div className="bg-card border border-border rounded-xl p-6 flex items-center gap-5">
        <div className="h-16 w-16 rounded-full bg-muted shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-40 bg-muted rounded" />
          <div className="h-3 w-24 bg-muted rounded" />
          <div className="h-3 w-32 bg-muted rounded" />
        </div>
        <div className="h-8 w-20 bg-muted rounded-md" />
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4 space-y-2">
            <div className="h-2.5 w-20 bg-muted rounded" />
            <div className="h-6 w-16 bg-muted rounded" />
          </div>
        ))}
      </div>

      {/* Ledger table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="h-4 w-32 bg-muted rounded" />
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex gap-4 px-4 py-3 border-b border-border last:border-0">
            <div className="h-3 w-20 bg-muted rounded" />
            <div className="h-3 w-28 bg-muted rounded" />
            <div className="h-3 w-16 bg-muted rounded ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
