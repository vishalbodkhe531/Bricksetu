'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workersApi } from '../api/workers.api';
import { queryKeys } from '@/lib/query/queryKeys';
import type { Worker, WorkerInput, WorkerWithDetails, AdvanceInput, SettlementInput } from '../types/worker.types';

/**
 * useWorkers — fetch all workers for an org.
 * Accepts initialData from a Server Component for SSR → CSR hydration.
 */
export function useWorkers(orgId: string, initialData?: Worker[]) {
  return useQuery({
    queryKey: queryKeys.workers.list(orgId),
    queryFn: () => workersApi.list(orgId),
    initialData,
    staleTime: 2 * 60 * 1000, // 2 min — worker list changes infrequently
    enabled: !!orgId,
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
 * Invalidates the list query on success.
 */
export function useCreateWorker(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: WorkerInput) => workersApi.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.workers.list(orgId) }),
  });
}

/**
 * useUpdateWorker — mutation to update a worker.
 */
export function useUpdateWorker(orgId: string, workerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<WorkerInput>) => workersApi.update(workerId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.workers.list(orgId) });
      qc.invalidateQueries({ queryKey: queryKeys.workers.detail(workerId) });
    },
  });
}

/**
 * useDeleteWorker — soft-delete a worker (sets status to inactive).
 */
export function useDeleteWorker(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (workerId: string) => workersApi.remove(workerId),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.workers.list(orgId) }),
  });
}

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
    enabled: !!orgId,
  });
}
