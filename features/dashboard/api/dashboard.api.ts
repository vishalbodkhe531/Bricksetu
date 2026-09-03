import { api } from '@/lib/axios/axiosInstance';
import type { DashboardSummary } from '../services/dashboard.service';

/**
 * Dashboard API module — client-side.
 * Calls /api/dashboard/summary via the shared Axios instance.
 */
export const dashboardApi = {
  getSummary: () =>
    api.get<DashboardSummary>('/dashboard/summary').then((r) => r.data),
};
