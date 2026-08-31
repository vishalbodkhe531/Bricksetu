import React from 'react';
import Link from 'next/link';
import {
  LayoutDashboard, Flame, Layers, ShoppingCart, Wallet,
  ArrowRight, Users, Package, Truck, Receipt
} from 'lucide-react';
import { getDashboardSummary } from '@/features/dashboard/queries';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const data = await getDashboardSummary();

  const kpis = [
    {
      label: 'Active Batches',
      value: data?.active_batches || 0,
      suffix: 'In Kiln',
      icon: Flame,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    },
    {
      label: 'Finished Stock',
      value: (data?.finished_stock_total || 0).toLocaleString(),
      suffix: 'Bricks',
      icon: Layers,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      label: 'Customer Receivables',
      value: `₹${(parseInt(data?.customer_receivables_paise || '0', 10) / 100).toLocaleString('en-IN')}`,
      suffix: 'Due',
      icon: ShoppingCart,
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    },
    {
      label: 'Supplier Payables',
      value: `₹${(parseInt(data?.supplier_payables_paise || '0', 10) / 100).toLocaleString('en-IN')}`,
      suffix: 'Payable',
      icon: Wallet,
      color: 'text-destructive bg-destructive/10 border-destructive/20',
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

      {/* Main Grid: Stock Ledger & Quick Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Finished Stock Table */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground">Finished Brick Stock by Grade</h3>
              <p className="text-xs text-muted-foreground">Current yard inventory available for sales dispatch</p>
            </div>
            <Link
              href="/inventory"
              className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
            >
              Full Inventory <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/50 text-muted-foreground uppercase font-bold border-b border-border">
                <tr>
                  <th className="px-4 py-2.5">Brick Type</th>
                  <th className="px-4 py-2.5">Grade</th>
                  <th className="px-4 py-2.5 text-right">Available Qty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data?.stock_breakdown?.length > 0 ? (
                  data.stock_breakdown.map((st: any, idx: number) => (
                    <tr key={idx} className="hover:bg-muted/30">
                      <td className="px-4 py-3 font-semibold text-foreground">{st.brick_type_name}</td>
                      <td className="px-4 py-3">
                        <span className="rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 text-[10px] font-bold">
                          {st.brick_grade_name}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        {st.quantity.toLocaleString()} Bricks
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                      No finished stock lots recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Module Shortcuts */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-foreground">Operational Modules</h3>
            <p className="text-xs text-muted-foreground">Direct access to workflow entry pages</p>
          </div>

          <div className="space-y-2">
            {[
              { title: 'Production & Batches', href: '/production', icon: Flame, desc: 'Moulding, firing, & stage tracking' },
              { title: 'Workers & Wages', href: '/workers', icon: Users, desc: 'Piece rate, advances, & settlements' },
              { title: 'Materials & Procurement', href: '/materials', icon: Package, desc: 'Coal, clay, & supplier ledgers' },
              { title: 'Sales & Customers', href: '/sales', icon: ShoppingCart, desc: 'Sales dispatches & receivables' },
              { title: 'Payments & Ledger', href: '/payments', icon: Receipt, desc: 'Cash flow & allocations' },
              { title: 'Transport & Fleet', href: '/transport', icon: Truck, desc: 'Vehicles & trip freight logs' },
            ].map((m) => {
              const Icon = m.icon;
              return (
                <Link
                  key={m.href}
                  href={m.href}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-muted/20 hover:bg-accent hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-foreground">{m.title}</div>
                      <div className="text-[10px] text-muted-foreground">{m.desc}</div>
                    </div>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
