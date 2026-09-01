'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productionApi } from '../api/production.api';
import { queryKeys } from '@/lib/query/queryKeys';
import type { ProductionBatch, ProductionBatchInput, BrickTypeInput } from '../types/production.types';

export function useProductionBatches(orgId: string, date?: string, initialData?: ProductionBatch[]) {
  return useQuery({
    queryKey: queryKeys.production.list(orgId, date),
    queryFn: () => productionApi.listBatches(orgId, date),
    initialData,
    staleTime: 30 * 1000, // 30s — production data changes frequently
    enabled: !!orgId,
  });
}

export function useBrickTypes(orgId: string) {
  return useQuery({
    queryKey: queryKeys.production.batches(orgId),
    queryFn: () => productionApi.listBrickTypes(orgId),
    staleTime: 5 * 60 * 1000, // 5 min — brick types rarely change
    enabled: !!orgId,
  });
}

export function useCreateProductionBatch(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ProductionBatchInput) => productionApi.createBatch(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.production.all }),
  });
}

export function useUpdateProductionBatch(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<ProductionBatchInput> }) =>
      productionApi.updateBatch(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.production.all }),
  });
}

export function useCreateBrickType(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: BrickTypeInput) => productionApi.createBrickType(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.production.batches(orgId) }),
  });
}
