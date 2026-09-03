import React from 'react';

export default function WorkerFormLoading() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-pulse">
      {/* Header */}
      <div className="space-y-1">
        <div className="h-6 w-40 bg-muted rounded" />
        <div className="h-3 w-64 bg-muted rounded" />
      </div>

      {/* Form fields */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <div className="h-2.5 w-24 bg-muted rounded" />
            <div className="h-9 w-full bg-muted rounded-md" />
          </div>
        ))}
        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <div className="h-9 w-20 bg-muted rounded-md" />
          <div className="h-9 w-28 bg-muted rounded-md" />
        </div>
      </div>
    </div>
  );
}
