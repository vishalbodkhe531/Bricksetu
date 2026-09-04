'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { DashboardSummary } from '../services/dashboard.service';

interface RecentPaymentsListProps {
  data: DashboardSummary['recent_payments'] | undefined;
}

export function RecentPaymentsList({ data }: RecentPaymentsListProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground">Recent Payments</h3>
        <Link href="/payments" className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1">
          All <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      {data && data.length > 0 ? (
        <ul className="divide-y divide-border">
          {data.map((p, idx) => (
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
  );
}
