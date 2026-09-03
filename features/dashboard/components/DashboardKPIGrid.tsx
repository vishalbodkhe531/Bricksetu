'use client';

import { Flame, ShoppingCart, Users, Wallet } from 'lucide-react';
import type { DashboardSummary } from '../services/dashboard.service';

interface KpiGridProps {
  data: DashboardSummary | undefined;
}

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

export function DashboardKPIGrid({ data }: KpiGridProps) {
  const kpis = [
    {
      label: 'Active Workers',
      value: data?.total_workers ?? 0,
      suffix: 'Workers',
      icon: Users,
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    },
    {
      label: "Today's Production",
      value: (data?.total_production_today ?? 0).toLocaleString(),
      suffix: 'Bricks',
      icon: Flame,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    },
    {
      label: 'Pending Orders',
      value: data?.total_sales_pending ?? 0,
      suffix: 'Orders',
      icon: ShoppingCart,
      color: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
    },
    {
      label: 'Payments Received',
      value: `₹${((data?.total_payments_received ?? 0) / 1).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
      suffix: 'Total',
      icon: Wallet,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    },
  ];

  if (!data) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <KpiCardSkeleton key={i} />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <div key={idx} className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{kpi.label}</span>
              <div className={`p-2 rounded-lg border ${kpi.color}`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-foreground">{kpi.value}</span>
              <span className="text-xs font-medium text-muted-foreground">{kpi.suffix}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
