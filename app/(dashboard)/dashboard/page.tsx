import React from 'react';
import { LayoutDashboard } from 'lucide-react';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { getDashboardSummary } from '@/features/dashboard/services/dashboard.service';
import { getSessionUser } from '@/lib/auth/session';
import { queryKeys } from '@/lib/query/queryKeys';
import { LiveDashboardClient } from '@/features/dashboard/components/LiveDashboardClient';

export const dynamic = 'force-dynamic';

/**
 * DashboardPage — server component.
 *
 * Architecture (per performance plan §4):
 *  1. Prefetch dashboard data server-side → no client-side loading spinner on first visit.
 *  2. Dehydrate the QueryClient → HydrationBoundary sends serialized cache to the client.
 *  3. LiveDashboardClient (client component) calls useQuery — finds cache already warm,
 *     renders immediately, then polls every 30s for live updates.
 *
 * Server Actions are NOT used here — they're for mutations only.
 * Reads go through Route Handler (/api/dashboard/summary) + TanStack Query.
 */
export default async function DashboardPage() {
  const user = await getSessionUser();
  const orgId = user?.organization_id ?? '';

  // Server-side prefetch: warm the query cache before sending HTML
  const queryClient = new QueryClient();
  if (orgId) {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.dashboard.summary(orgId),
      queryFn: () => getDashboardSummary(orgId),
    });
  }

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

      {/* Hydration boundary — ships server-prefetched cache to client */}
      <HydrationBoundary state={dehydrate(queryClient)}>
        <LiveDashboardClient orgId={orgId} />
      </HydrationBoundary>
    </div>
  );
}

