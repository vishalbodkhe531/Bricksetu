'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productionApi } from '../api/production.api';
import { queryKeys } from '@/lib/query/queryKeys';
import type { CreateBatchInput, UpdateBatchInput } from '../schemas/batch.schema';
import type { StageTransitionInput } from '../schemas/stage-transition.schema';
import type { CreateConsumptionInput } from '../schemas/consumption.schema';
import type { CreateFinishedGoodsInput } from '../schemas/finished-goods.schema';

export function useProductionBatches(
  orgId: string,
  filters?: { stage?: string; status?: string; startDate?: string; endDate?: string }
) {
  return useQuery({
    queryKey: queryKeys.production.list(orgId, filters),
    queryFn: () => productionApi.listBatches(filters),
    staleTime: 30 * 1000,
  });
}

export function useBatchDetail(batchId: string, orgId: string) {
  return useQuery({
    queryKey: queryKeys.production.detail(batchId),
    queryFn: () => productionApi.getBatchDetail(batchId),
    staleTime: 15 * 1000,
    enabled: !!batchId,
  });
}

export function useBrickTypes(orgId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.production.brickTypes(orgId),
    queryFn: () => productionApi.listBrickTypes(),
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled !== undefined ? options.enabled : true,
  });
}

export function useBrickGrades(orgId: string) {
  return useQuery({
    queryKey: queryKeys.production.brickGrades(orgId),
    queryFn: () => productionApi.listBrickGrades(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useProductionAnalytics(orgId: string) {
  return useQuery({
    queryKey: queryKeys.production.analytics(orgId),
    queryFn: () => productionApi.getAnalytics(),
    staleTime: 60 * 1000,
  });
}

export function useCreateProductionBatch(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateBatchInput) => productionApi.createBatch(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['production'] });
      qc.refetchQueries({ queryKey: ['production'] });
    },
  });
}

export function useUpdateProductionBatch(orgId: string, batchId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateBatchInput) => productionApi.updateBatch(batchId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.production.detail(batchId) });
      qc.invalidateQueries({ queryKey: queryKeys.production.list(orgId) });
    },
  });
}

export function useStageTransitions(batchId: string, orgId: string) {
  return useQuery({
    queryKey: queryKeys.production.stages(batchId),
    queryFn: () => productionApi.listStageTransitions(batchId),
    staleTime: 15 * 1000,
    enabled: !!batchId,
  });
}

export function useCreateStageTransition(batchId: string, orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: StageTransitionInput) =>
      productionApi.createStageTransition(batchId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.production.detail(batchId) });
      qc.invalidateQueries({ queryKey: queryKeys.production.stages(batchId) });
      qc.invalidateQueries({ queryKey: queryKeys.production.list(orgId) });
    },
  });
}

export function useBatchConsumption(batchId: string, orgId: string) {
  return useQuery({
    queryKey: queryKeys.production.consumption(batchId),
    queryFn: () => productionApi.listConsumption(batchId),
    staleTime: 15 * 1000,
    enabled: !!batchId,
  });
}

export function useCreateBatchConsumption(batchId: string, orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateConsumptionInput) =>
      productionApi.createConsumption(batchId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.production.detail(batchId) });
      qc.invalidateQueries({ queryKey: queryKeys.production.consumption(batchId) });
      qc.invalidateQueries({ queryKey: queryKeys.inventory.all });
    },
  });
}

export function useBatchMouldingLogs(batchId: string, orgId: string) {
  return useQuery({
    queryKey: queryKeys.production.mouldingLogs(batchId),
    queryFn: () => productionApi.listMouldingLogs(batchId),
    staleTime: 15 * 1000,
    enabled: !!batchId,
  });
}

export function useCreateBatchMouldingLog(batchId: string, orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      worker_id: string;
      work_date: string;
      bricks_moulded: number;
      rate_per_1000_paise: number;
      notes?: string | null;
    }) => productionApi.createMouldingLog(batchId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.production.detail(batchId) });
      qc.invalidateQueries({ queryKey: queryKeys.production.mouldingLogs(batchId) });
      qc.invalidateQueries({ queryKey: queryKeys.workers.all });
    },
  });
}

export function useBatchExpenses(batchId: string, orgId: string) {
  return useQuery({
    queryKey: queryKeys.production.expenses(batchId),
    queryFn: () => productionApi.listExpenses(batchId),
    staleTime: 15 * 1000,
    enabled: !!batchId,
  });
}

export function useBatchFinishedGoods(batchId: string, orgId: string) {
  return useQuery({
    queryKey: queryKeys.production.finishedGoods(batchId),
    queryFn: () => productionApi.listFinishedGoods(batchId),
    staleTime: 15 * 1000,
    enabled: !!batchId,
  });
}

export function useCreateFinishedGoods(batchId: string, orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateFinishedGoodsInput) =>
      productionApi.createFinishedGoods(batchId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.production.detail(batchId) });
      qc.invalidateQueries({ queryKey: queryKeys.production.finishedGoods(batchId) });
      qc.invalidateQueries({ queryKey: queryKeys.inventory.all });
    },
  });
}
