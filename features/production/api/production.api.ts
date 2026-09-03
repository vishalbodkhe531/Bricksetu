import { api } from '@/lib/axios/axiosInstance';
import type { ProductionBatch, ProductionBatchInput, BrickType, BrickTypeInput } from '../types/production.types';

export const productionApi = {
  listBatches: (orgId: string, date?: string) =>
    api.get<ProductionBatch[]>('/production', { params: { orgId, date } }).then((r) => r.data),

  getBatch: (id: string) =>
    api.get<ProductionBatch>(`/production/${id}`).then((r) => r.data),

  createBatch: (input: ProductionBatchInput) =>
    api.post<ProductionBatch>('/production', input).then((r) => r.data),

  updateBatch: (id: string, input: Partial<ProductionBatchInput>) =>
    api.patch<ProductionBatch>(`/production/${id}`, input).then((r) => r.data),

  listBrickTypes: (orgId: string) =>
    api.get<BrickType[]>('/production/brick-types', { params: { orgId } }).then((r) => r.data),

  createBrickType: (input: BrickTypeInput) =>
    api.post<BrickType>('/production/brick-types', input).then((r) => r.data),
};
