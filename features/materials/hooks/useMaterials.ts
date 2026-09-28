'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { materialsApi } from '../api/materials.api';
import type {
  MaterialCreateInput,
  MaterialUpdateInput,
  SupplierInput,
} from '../types/materials.types';

export const materialsKeys = {
  all: ['materials'] as const,
  materials: (orgId: string) => ['materials', orgId] as const,
  detail: (materialId: string) => ['materials', 'detail', materialId] as const,
  purchases: (materialId: string) => ['materials', 'purchases', materialId] as const,
  consumption: (materialId: string) => ['materials', 'consumption', materialId] as const,
  suppliers: (orgId: string) => ['suppliers', orgId] as const,
};

export function useRawMaterialsList(orgId: string) {
  return useQuery({
    queryKey: materialsKeys.materials(orgId),
    queryFn: () => materialsApi.listMaterials(orgId),
    staleTime: 5 * 60 * 1000,
    enabled: !!orgId,
  });
}

export function useMaterialDetail(materialId: string) {
  return useQuery({
    queryKey: materialsKeys.detail(materialId),
    queryFn: () => materialsApi.getMaterialDetail(materialId),
    staleTime: 2 * 60 * 1000,
    enabled: !!materialId,
  });
}

export function useMaterialPurchases(materialId: string) {
  return useQuery({
    queryKey: materialsKeys.purchases(materialId),
    queryFn: () => materialsApi.getMaterialPurchases(materialId),
    staleTime: 2 * 60 * 1000,
    enabled: !!materialId,
  });
}

export function useMaterialConsumption(materialId: string) {
  return useQuery({
    queryKey: materialsKeys.consumption(materialId),
    queryFn: () => materialsApi.getMaterialConsumption(materialId),
    staleTime: 2 * 60 * 1000,
    enabled: !!materialId,
  });
}

export function useCreateRawMaterial(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: MaterialCreateInput) => materialsApi.createMaterial(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: materialsKeys.materials(orgId) });
      qc.invalidateQueries({ queryKey: materialsKeys.suppliers(orgId) });
    },
  });
}

export function useUpdateMaterial(orgId: string, materialId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: MaterialUpdateInput) => materialsApi.updateMaterial(materialId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: materialsKeys.materials(orgId) });
      qc.invalidateQueries({ queryKey: materialsKeys.detail(materialId) });
    },
  });
}

export function useSuppliersList(orgId: string) {
  return useQuery({
    queryKey: materialsKeys.suppliers(orgId),
    queryFn: () => materialsApi.listSuppliers(orgId),
    staleTime: 5 * 60 * 1000,
    enabled: !!orgId,
  });
}

export function useCreateSupplier(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SupplierInput) => materialsApi.createSupplier(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: materialsKeys.suppliers(orgId) }),
  });
}
