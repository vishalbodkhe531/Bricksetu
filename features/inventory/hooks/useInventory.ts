'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from '../api/inventory.api';
import { queryKeys } from '@/lib/query/queryKeys';
import type { InventoryTransactionInput, RawMaterialInput } from '../types/inventory.types';

export function useInventoryTransactions(orgId: string) {
  return useQuery({
    queryKey: queryKeys.inventory.transactions(orgId),
    queryFn: () => inventoryApi.listTransactions(orgId),
    enabled: !!orgId,
  });
}

export function useStockSummary(orgId: string) {
  return useQuery({
    queryKey: queryKeys.inventory.stock(orgId),
    queryFn: () => inventoryApi.getStock(orgId),
    staleTime: 60 * 1000,
    enabled: !!orgId,
  });
}

export function useRawMaterials(orgId: string) {
  return useQuery({
    queryKey: queryKeys.inventory.list(orgId),
    queryFn: () => inventoryApi.listRawMaterials(orgId),
    staleTime: 5 * 60 * 1000,
    enabled: !!orgId,
  });
}

export function useCreateInventoryTransaction(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: InventoryTransactionInput) => inventoryApi.createTransaction(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.inventory.transactions(orgId) });
      qc.invalidateQueries({ queryKey: queryKeys.inventory.stock(orgId) });
    },
  });
}

export function useCreateRawMaterial(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: RawMaterialInput) => inventoryApi.createRawMaterial(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.inventory.list(orgId) }),
  });
}
