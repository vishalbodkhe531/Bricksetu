'use client';

import {
  ArrowRight,
  Flame, Package,
  Receipt,
  ShoppingCart,
  TrendingUp,
  Users
} from 'lucide-react';
import Link from 'next/link';
import { useDashboardSummary } from '../hooks/useDashboard';
import type { DashboardSummary } from '../services/dashboard.service';
import { DashboardKPIGrid } from './DashboardKPIGrid';
import { RecentPaymentsList } from './RecentPaymentsList';
import { RecentProductionTable } from './RecentProductionTable';

interface LiveDashboardClientProps {
  orgId: string;
  initialData?: DashboardSummary;
}

/**
 * LiveDashboardClient — client component that owns TanStack Query polling.
 * Receives server-prefetched initialData so first paint has no spinner.
 * After mount, React Query takes over with staleTime + refetchInterval.
 */
export function LiveDashboardClient({ orgId, initialData }: LiveDashboardClientProps) {
  const { data } = useDashboardSummary(orgId, initialData);

  return (
    <>
      {/* KPI Grid */}
      <DashboardKPIGrid data={data} />

      {/* Main Grid: Recent Activity & Quick Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentProductionTable data={data?.recent_production} />

        {/* Side panel */}
        <div className="space-y-4">
          <RecentPaymentsList data={data?.recent_payments} />

          {/* Quick Module Shortcuts */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-3">
            <div>
              <h3 className="text-sm font-bold text-foreground">Operational Modules</h3>
              <p className="text-xs text-muted-foreground">Direct access to workflow entry pages</p>
            </div>

            <div className="space-y-2">
              {[
                { title: 'Production & Batches', href: '/production', icon: Flame },
                { title: 'Workers & Wages', href: '/workers', icon: Users },
                { title: 'Inventory', href: '/inventory', icon: Package },
                { title: 'Sales & Customers', href: '/sales', icon: ShoppingCart },
                { title: 'Payments & Ledger', href: '/payments', icon: Receipt },
                { title: 'Reports', href: '/reports', icon: TrendingUp },
              ].map((m) => {
                const Icon = m.icon;
                return (
                  <Link
                    key={m.href}
                    href={m.href}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-muted/20 hover:bg-accent hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded bg-primary/10 text-primary">
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-xs font-bold text-foreground">{m.title}</span>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
