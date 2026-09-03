import { api } from '@/lib/axios/axiosInstance';
import type {
  Worker,
  WorkerInput,
  WorkerUpdateInput,
  RateChangeInput,
  WorkerWithDetails,
  WorkerWageRate,
  AdvanceInput,
  SettlementInput,
} from '../types/worker.types';

/**
 * Helper to unwrap payload from standard API response wrapper { success: true, data: T }
 */
function extractData<T>(resData: any): T {
  if (resData && typeof resData === 'object' && 'data' in resData && resData.data !== undefined) {
    return resData.data as T;
  }
  return resData as T;
}

/**
 * Workers API module — client-side.
 * All calls hit /api/workers/* via the shared Axios instance.
 */
export const workersApi = {
  list: (orgId: string, includeInactive = false) =>
    api.get<Worker[]>('/workers', { params: { orgId, includeInactive } }).then((r) => extractData<Worker[]>(r.data)),

  getById: (id: string) =>
    api.get<WorkerWithDetails>(`/workers/${id}`).then((r) => extractData<WorkerWithDetails>(r.data)),

  create: (input: WorkerInput) =>
    api.post<Worker>('/workers', input).then((r) => extractData<Worker>(r.data)),

  update: (id: string, input: WorkerUpdateInput) =>
    api.patch<Worker>(`/workers/${id}`, input).then((r) => extractData<Worker>(r.data)),

  changeRate: (id: string, input: RateChangeInput) =>
    api.post<WorkerWageRate>(`/workers/${id}/rate`, input).then((r) => extractData<WorkerWageRate>(r.data)),

  deactivate: (id: string) =>
    api.delete<{ id: string; status: 'inactive'; advance_balance: number }>(`/workers/${id}`).then((r) => extractData<{ id: string; status: 'inactive'; advance_balance: number }>(r.data)),

  recordAdvance: (input: AdvanceInput) =>
    api.post('/workers/advances', input).then((r) => extractData<any>(r.data)),

  createSettlement: (input: SettlementInput) =>
    api.post('/workers/settlements', input).then((r) => extractData<any>(r.data)),

  getSettlements: (orgId: string) =>
    api.get('/workers/settlements', { params: { orgId } }).then((r) => extractData<any>(r.data)),
};
