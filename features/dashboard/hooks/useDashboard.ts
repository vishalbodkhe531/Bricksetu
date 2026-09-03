'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard.api';
import { queryKeys } from '@/lib/query/queryKeys';
import type { DashboardSummary } from '../services/dashboard.service';

/**
 * useDashboardSummary — fetch the executive summary KPIs.
 * Short staleTime since KPIs should reflect recent activity.
 */
export function useDashboardSummary(orgId: string, initialData?: DashboardSummary) {
  return useQuery({
    queryKey: queryKeys.dashboard.summary(orgId),
    queryFn: () => dashboardApi.getSummary(),
    initialData,
    staleTime: 60 * 1000, // 1 min
    refetchOnWindowFocus: true,
    enabled: !!orgId,
  });
}
