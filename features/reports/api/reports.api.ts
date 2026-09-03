import { api } from '@/lib/axios/axiosInstance';

export type ReportType =
  | 'production-summary'
  | 'worker-settlements'
  | 'inventory-stock'
  | 'sales-summary'
  | 'payment-summary';

export interface ReportParams {
  startDate?: string;
  endDate?: string;
  orgId?: string;
}

/**
 * Reports API module — client-side.
 * All calls hit /api/reports/[reportType] via Axios.
 */
export const reportsApi = {
  get: (reportType: ReportType, params?: ReportParams) =>
    api
      .get<unknown[]>(`/reports/${reportType}`, { params })
      .then((r) => r.data),
};
