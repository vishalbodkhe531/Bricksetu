'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transportApi } from '../api/transport.api';
import type { VehicleInput } from '../types/transport.types';

const transportKeys = {
  all: ['transport'] as const,
  vehicles: (orgId: string) => ['transport', 'vehicles', orgId] as const,
};

export function useVehicles(orgId: string) {
  return useQuery({
    queryKey: transportKeys.vehicles(orgId),
    queryFn: () => transportApi.listVehicles(orgId),
    staleTime: 5 * 60 * 1000,
    enabled: !!orgId,
  });
}

export function useCreateVehicle(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: VehicleInput) => transportApi.createVehicle(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: transportKeys.vehicles(orgId) }),
  });
}
