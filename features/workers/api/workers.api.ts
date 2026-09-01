import { api } from '@/lib/axios/axiosInstance';
import type { Worker, WorkerInput, WorkerWithDetails, AdvanceInput, SettlementInput } from '../types/worker.types';

/**
 * Workers API module — client-side.
 * All calls hit /api/workers/* via the shared Axios instance.
 * Pages/components import hooks (useWorkers, useCreateWorker) — never this directly.
 */
export const workersApi = {
  list: (orgId: string) =>
    api.get<Worker[]>('/workers', { params: { orgId } }).then((r) => r.data),

  getById: (id: string) =>
    api.get<WorkerWithDetails>(`/workers/${id}`).then((r) => r.data),

  create: (input: WorkerInput) =>
    api.post<Worker>('/workers', input).then((r) => r.data),

  update: (id: string, input: Partial<WorkerInput>) =>
    api.patch<Worker>(`/workers/${id}`, input).then((r) => r.data),

  remove: (id: string) =>
    api.delete(`/workers/${id}`).then((r) => r.data),

  recordAdvance: (input: AdvanceInput) =>
    api.post('/workers/advances', input).then((r) => r.data),

  createSettlement: (input: SettlementInput) =>
    api.post('/workers/settlements', input).then((r) => r.data),

  getSettlements: (orgId: string) =>
    api.get('/workers/settlements', { params: { orgId } }).then((r) => r.data),
};
