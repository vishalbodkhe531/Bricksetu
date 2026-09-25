import { api } from '@/lib/axios/axiosInstance';
import type {
  Batch,
  BatchKPIs,
  BatchBrickSupplyStats,
  StageTransition,
  MaterialConsumption,
  MouldingLog,
  BatchExpense,
  FinishedLotOutput,
  BrickType,
  BrickGrade,
  ProductionAnalytics,
} from '../types/production.types';
import type { CreateBatchInput, UpdateBatchInput } from '../schemas/batch.schema';
import type { StageTransitionInput } from '../schemas/stage-transition.schema';
import type { CreateConsumptionInput } from '../schemas/consumption.schema';
import type { CreateFinishedGoodsInput } from '../schemas/finished-goods.schema';

export const productionApi = {
  // Batches
  listBatches: (filters?: { stage?: string; status?: string; startDate?: string; endDate?: string }) =>
    api.get<Batch[]>('/production', { params: filters }).then((r) => r.data),

  getBatchDetail: (id: string) =>
    api.get<{ batch: Batch; kpis: BatchKPIs; brick_supply_stats: BatchBrickSupplyStats }>(`/production/${id}`).then((r) => r.data),

  createBatch: (input: CreateBatchInput) =>
    api.post<Batch>('/production', input).then((r) => r.data),

  updateBatch: (id: string, input: UpdateBatchInput) =>
    api.patch<Batch>(`/production/${id}`, input).then((r) => r.data),

  // Stage Transitions
  listStageTransitions: (batchId: string) =>
    api.get<StageTransition[]>(`/production/${batchId}/stage-transitions`).then((r) => r.data),

  createStageTransition: (batchId: string, input: StageTransitionInput) =>
    api.post<StageTransition>(`/production/${batchId}/stage-transitions`, input).then((r) => r.data),

  // Material Consumption
  listConsumption: (batchId: string) =>
    api.get<MaterialConsumption[]>(`/production/${batchId}/consumption`).then((r) => r.data),

  createConsumption: (batchId: string, input: CreateConsumptionInput) =>
    api.post<MaterialConsumption>(`/production/${batchId}/consumption`, input).then((r) => r.data),

  // Moulding Logs
  listMouldingLogs: (batchId: string) =>
    api.get<MouldingLog[]>(`/production/${batchId}/moulding-logs`).then((r) => r.data),

  createMouldingLog: (
    batchId: string,
    input: {
      worker_id: string;
      work_date: string;
      bricks_moulded: number;
      rate_per_1000_paise: number;
      notes?: string | null;
    }
  ) => api.post<MouldingLog>(`/production/${batchId}/moulding-logs`, input).then((r) => r.data),

  // Expenses
  listExpenses: (batchId: string) =>
    api.get<BatchExpense[]>(`/production/${batchId}/expenses`).then((r) => r.data),

  // Finished Goods Output
  listFinishedGoods: (batchId: string) =>
    api.get<FinishedLotOutput[]>(`/production/${batchId}/finished-goods`).then((r) => r.data),

  createFinishedGoods: (batchId: string, input: CreateFinishedGoodsInput) =>
    api.post<FinishedLotOutput>(`/production/${batchId}/finished-goods`, input).then((r) => r.data),

  // Lookups & Analytics
  listBrickTypes: () => api.get<BrickType[]>('/production/brick-types').then((r) => r.data),

  listBrickGrades: () => api.get<BrickGrade[]>('/production/brick-grades').then((r) => r.data),

  getAnalytics: () => api.get<ProductionAnalytics>('/production/analytics').then((r) => r.data),
};
