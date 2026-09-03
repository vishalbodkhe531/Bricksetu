'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { materialsApi } from '../api/materials.api';
import type { RawMaterialInput, SupplierInput } from '../types/materials.types';

const materialsKeys = {
  all: ['materials'] as const,
  materials: (orgId: string) => ['materials', orgId] as const,
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

export function useCreateRawMaterial(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: RawMaterialInput) => materialsApi.createMaterial(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: materialsKeys.materials(orgId) }),
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
