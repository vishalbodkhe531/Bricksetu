'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard.api';
import { queryKeys } from '@/lib/query/queryKeys';
import type { DashboardSummary } from '../services/dashboard.service';

/**
 * useDashboardSummary — fetch the executive summary KPIs via the Route Handler GET.
 * - staleTime 30s: don't refetch if data is fresh
 * - refetchInterval 30s: background poll every 30s for "live" feel
 * - gcTime 5min: keep cache warm after unmount
 */
export function useDashboardSummary(orgId: string, initialData?: DashboardSummary) {
  return useQuery({
    queryKey: queryKeys.dashboard.summary(orgId),
    queryFn: () => dashboardApi.getSummary(),
    initialData,
    staleTime: 30_000,          // 30 sec — don't refetch if data is <30s old
    gcTime: 5 * 60_000,         // 5 min garbage collect after unmount
    refetchInterval: 30_000,    // poll every 30s for live feel
    refetchOnWindowFocus: true,
    enabled: !!orgId,
  });
}

