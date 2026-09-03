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
export function useWorkers(orgId: string, includeInactive = false, initialData?: Worker[]) {
  return useQuery({
    queryKey: [...queryKeys.workers.list(orgId), { includeInactive }],
    queryFn: () => workersApi.list(orgId, includeInactive),
    initialData,
    staleTime: 2 * 60 * 1000,
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
    enabled: !!id,
  });
}

/**
 * useCreateWorker — mutation to create a worker.
 */
export function useCreateWorker(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: WorkerInput) => workersApi.create(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.workers.list(orgId) });
    },
  });
}

/**
 * useUpdateWorker — mutation to update worker profile fields.
 */
export function useUpdateWorker(orgId: string, workerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: WorkerUpdateInput) => workersApi.update(workerId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.workers.list(orgId) });
      qc.invalidateQueries({ queryKey: queryKeys.workers.detail(workerId) });
    },
  });
}

/**
 * useChangeWorkerRate — mutation to change a worker's moulding pay rate with effective date.
 */
export function useChangeWorkerRate(orgId: string, workerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: RateChangeInput) => workersApi.changeRate(workerId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.workers.list(orgId) });
      qc.invalidateQueries({ queryKey: queryKeys.workers.detail(workerId) });
    },
  });
}

/**
 * useDeactivateWorker — soft-deactivate a worker (sets status to inactive).
 */
export function useDeactivateWorker(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (workerId: string) => workersApi.deactivate(workerId),
    onSuccess: (_, workerId) => {
      qc.invalidateQueries({ queryKey: queryKeys.workers.list(orgId) });
      qc.invalidateQueries({ queryKey: queryKeys.workers.detail(workerId) });
    },
  });
}

/** Alias for backward compatibility */
export const useDeleteWorker = useDeactivateWorker;

/**
 * useRecordAdvance — record an advance payment.
 */
export function useRecordAdvance(orgId: string, workerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AdvanceInput) => workersApi.recordAdvance(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.workers.detail(workerId) });
      qc.invalidateQueries({ queryKey: queryKeys.workers.list(orgId) });
    },
  });
}

/**
 * useCreateSettlement — create a wage settlement.
 */
export function useCreateSettlement(orgId: string, workerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SettlementInput) => workersApi.createSettlement(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.workers.detail(workerId) });
      qc.invalidateQueries({ queryKey: queryKeys.workers.settlements(orgId) });
    },
  });
}

/**
 * useSettlements — fetch all settlements for an org.
 */
export function useSettlements(orgId: string) {
  return useQuery({
    queryKey: queryKeys.workers.settlements(orgId),
    queryFn: () => workersApi.getSettlements(orgId),
  });
}
