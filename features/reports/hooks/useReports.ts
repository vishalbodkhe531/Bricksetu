'use client';

import { useQuery } from '@tanstack/react-query';
import { reportsApi, type ReportType, type ReportParams } from '../api/reports.api';

/**
 * Centralized report query key factory (not in global queryKeys to keep reports isolated).
 */
const reportKeys = {
  all: ['reports'] as const,
  report: (type: ReportType, params?: ReportParams) =>
    [...reportKeys.all, type, params] as const,
};

/**
 * useReport — generic hook to fetch any report type.
 * Long staleTime since reports are read-heavy and rarely need real-time data.
 */
export function useReport<T = unknown[]>(
  reportType: ReportType,
  params?: ReportParams,
  options?: { enabled?: boolean; staleTime?: number }
) {
  return useQuery({
    queryKey: reportKeys.report(reportType, params),
    queryFn: () => reportsApi.get(reportType, params) as Promise<T>,
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 min default
    enabled: options?.enabled ?? true,
  });
}
