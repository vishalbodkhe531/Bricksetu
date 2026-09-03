'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { DashboardSummary } from '../services/dashboard.service';

interface RecentProductionTableProps {
  data: DashboardSummary['recent_production'] | undefined;
}

export function RecentProductionTable({ data }: RecentProductionTableProps) {
  return (
    <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground">Recent Production</h3>
          <p className="text-xs text-muted-foreground">Latest production batches across all workers</p>
        </div>
        <Link
          href="/production"
          className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
        >
          All Production <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="bg-muted/50 text-muted-foreground uppercase font-bold border-b border-border">
            <tr>
              <th className="px-4 py-2.5">Date</th>
              <th className="px-4 py-2.5">Brick Type</th>
              <th className="px-4 py-2.5">Worker</th>
              <th className="px-4 py-2.5 text-right">Bricks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data && data.length > 0 ? (
              data.map((row, idx) => (
                <tr key={idx} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-muted-foreground">{row.production_date}</td>
                  <td className="px-4 py-3 font-semibold text-foreground">{row.brick_type_name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.worker_name ?? '—'}</td>
                  <td className="px-4 py-3 text-right font-bold font-mono text-foreground">
                    {row.bricks_moulded.toLocaleString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  No production batches recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
