import React from 'react';

function KpiCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-3 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-2.5 w-24 bg-muted rounded" />
        <div className="h-8 w-8 bg-muted rounded-lg" />
      </div>
      <div className="flex items-baseline justify-between">
        <div className="h-7 w-20 bg-muted rounded" />
        <div className="h-2.5 w-12 bg-muted rounded" />
      </div>
    </div>
  );
}

function TableRowSkeleton() {
  return (
    <tr>
      <td className="px-4 py-3"><div className="h-3 w-20 bg-muted rounded animate-pulse" /></td>
      <td className="px-4 py-3"><div className="h-3 w-28 bg-muted rounded animate-pulse" /></td>
      <td className="px-4 py-3"><div className="h-3 w-24 bg-muted rounded animate-pulse" /></td>
      <td className="px-4 py-3 text-right"><div className="h-3 w-16 bg-muted rounded animate-pulse ml-auto" /></td>
    </tr>
  );
}

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="space-y-1">
        <div className="h-7 w-72 bg-muted rounded animate-pulse" />
        <div className="h-3 w-96 bg-muted rounded animate-pulse" />
      </div>

      {/* KPI Grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <KpiCardSkeleton key={i} />)}
      </div>

      {/* Main grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Production table skeleton */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="h-4 w-40 bg-muted rounded animate-pulse" />
              <div className="h-3 w-56 bg-muted rounded animate-pulse" />
            </div>
            <div className="h-3 w-20 bg-muted rounded animate-pulse" />
          </div>
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  {['Date', 'Brick Type', 'Worker', 'Bricks'].map(h => (
                    <th key={h} className="px-4 py-2.5">
                      <div className="h-2.5 w-12 bg-muted rounded animate-pulse" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} />)}
              </tbody>
            </table>
          </div>
        </div>

        {/* Side panel skeleton */}
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-5 space-y-3">
            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex justify-between py-2 border-b border-border">
                <div className="space-y-1">
                  <div className="h-3 w-28 bg-muted rounded animate-pulse" />
                  <div className="h-2.5 w-20 bg-muted rounded animate-pulse" />
                </div>
                <div className="h-3 w-16 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
