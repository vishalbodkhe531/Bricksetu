'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workersApi } from '../api/workers.api';
import { queryKeys } from '@/lib/query/queryKeys';
import type {
  Worker,
  WorkerInput,
  WorkerUpdateInput,
  RateChangeInput,
  WorkerWithDetails,
  AdvanceInput,
  SettlementInput,
} from '../types/worker.types';

/**
 * useWorkers — fetch all workers for an org.
 */
export function useWorkers(orgId?: string, includeInactive = false, initialData?: Worker[]) {
  return useQuery({
    queryKey: [...queryKeys.workers.list(orgId || 'all'), { includeInactive }],
    queryFn: () => workersApi.list(orgId || '', includeInactive),
    initialData,
    staleTime: 5 * 60 * 1000, // 5 min cache
  });
}

/**
 * useWorkerDetail — fetch a single worker with full details.
 */
export function useWorkerDetail(id: string, initialData?: WorkerWithDetails) {
  return useQuery({
    queryKey: queryKeys.workers.detail(id),
    queryFn: () => workersApi.getById(id),
    initialData,
    staleTime: 5 * 60 * 1000, // 5 min cache
    enabled: !!id,
  });
}

/**
 * useCreateWorker — mutation to create a worker.
 */
export function useCreateWorker(orgId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: WorkerInput) => workersApi.create(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.workers.all, refetchType: 'all' });
    },
  });
}

/**
 * useUpdateWorker — mutation to update worker profile fields.
 */
export function useUpdateWorker(orgId?: string, workerId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: WorkerUpdateInput) => {
      if (!workerId) throw new Error('Worker ID is required for update');
      return workersApi.update(workerId, input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.workers.all, refetchType: 'all' });
    },
  });
}

/**
 * useChangeWorkerRate — mutation to change a worker's moulding pay rate with effective date.
 */
export function useChangeWorkerRate(orgId?: string, workerId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: RateChangeInput) => {
      const id = workerId || input.worker_id;
      if (!id) throw new Error('Worker ID is required for rate change');
      return workersApi.changeRate(id, input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.workers.all, refetchType: 'all' });
    },
  });
}

/**
 * useDeactivateWorker — soft-deactivate a worker (sets status to inactive).
 */
export function useDeactivateWorker(orgId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (workerId: string) => workersApi.deactivate(workerId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.workers.all, refetchType: 'all' });
    },
  });
}

/** Alias for backward compatibility */
export const useDeleteWorker = useDeactivateWorker;

/**
 * useRecordAdvance — record an advance payment.
 */
export function useRecordAdvance(orgId?: string, workerId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AdvanceInput) => workersApi.recordAdvance(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.workers.all, refetchType: 'all' });
    },
  });
}

/**
 * useCreateSettlement — create a wage settlement.
 */
export function useCreateSettlement(orgId?: string, workerId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SettlementInput) => workersApi.createSettlement(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.workers.all, refetchType: 'all' });
    },
  });
}

/**
 * useSettlements — fetch all settlements for an org.
 */
export function useSettlements(orgId?: string) {
  return useQuery({
    queryKey: queryKeys.workers.settlements(orgId || 'all'),
    queryFn: () => workersApi.getSettlements(orgId || ''),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * useDailyWorkLogs — fetch daily work logs with optional filters.
 */
export function useDailyWorkLogs(params?: { workerId?: string; category?: string; startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: queryKeys.workers.dailyWork(params),
    queryFn: () => workersApi.getDailyWorkLogs(params),
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * useDailyWorkSummary — fetch today's summary metrics.
 */
export function useDailyWorkSummary(date?: string) {
  return useQuery({
    queryKey: queryKeys.workers.todaySummary(date),
    queryFn: () => workersApi.getTodaySummary(date),
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * useRecordDailyWork — mutation to log daily work for a single worker.
 */
export function useRecordDailyWork(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: any) => workersApi.recordDailyWork(input),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: queryKeys.workers.all });
      if (variables.worker_id) {
        qc.invalidateQueries({ queryKey: queryKeys.workers.detail(variables.worker_id) });
      }
    },
  });
}

/**
 * useRecordBulkDailyWork — mutation to log daily work in bulk.
 */
export function useRecordBulkDailyWork(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: any) => workersApi.recordBulkDailyWork(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.workers.all });
    },
  });
}

/**
 * useDeleteDailyWorkLog — mutation to delete a daily work log.
 */
export function useDeleteDailyWorkLog(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => workersApi.deleteDailyWorkLog(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.workers.all });
    },
  });
}

