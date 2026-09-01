import React from 'react';
import Link from 'next/link';
import {
  LayoutDashboard, Flame, Package, ShoppingCart, Wallet,
  ArrowRight, Users, Receipt, TrendingUp
} from 'lucide-react';
import { getDashboardSummary } from '@/features/dashboard/services/dashboard.service';
import { getSessionUser } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const user = await getSessionUser();
  const data = user ? await getDashboardSummary(user.organization_id) : null;

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <LayoutDashboard className="h-6 w-6 text-primary" /> Kiln Operations Executive Summary
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Real-time metrics, active kiln rounds, finished brick stock, and financial accounts overview
        </p>
      </div>

      {/* KPI Grid */}
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

      {/* Main Grid: Recent Activity & Quick Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Production */}
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
                {data?.recent_production && data.recent_production.length > 0 ? (
                  data.recent_production.map((row, idx) => (
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

        {/* Quick Module Shortcuts + Recent Payments */}
        <div className="space-y-4">
          {/* Recent Payments */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">Recent Payments</h3>
              <Link href="/payments" className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1">
                All <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            {data?.recent_payments && data.recent_payments.length > 0 ? (
              <ul className="divide-y divide-border">
                {data.recent_payments.map((p, idx) => (
                  <li key={idx} className="py-2.5 flex justify-between items-center">
                    <div>
                      <div className="text-xs font-semibold text-foreground">{p.customer_name}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">{p.payment_date} · {p.payment_mode ?? 'N/A'}</div>
                    </div>
                    <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">
                      ₹{p.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-4">No recent payments.</p>
            )}
          </div>

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
    </div>
  );
}
