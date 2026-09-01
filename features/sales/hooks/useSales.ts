'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { salesApi } from '../api/sales.api';
import { queryKeys } from '@/lib/query/queryKeys';
import type { Customer, CustomerInput, SalesOrderInput } from '../types/sales.types';

export function useCustomers(orgId: string, initialData?: Customer[]) {
  return useQuery({
    queryKey: queryKeys.customers.list(orgId),
    queryFn: () => salesApi.listCustomers(orgId),
    initialData,
    staleTime: 5 * 60 * 1000,
    enabled: !!orgId,
  });
}

export function useCreateCustomer(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CustomerInput) => salesApi.createCustomer(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.customers.list(orgId) }),
  });
}

export function useSalesOrders(orgId: string) {
  return useQuery({
    queryKey: queryKeys.salesOrders.list(orgId),
    queryFn: () => salesApi.listOrders(orgId),
    staleTime: 60 * 1000,
    enabled: !!orgId,
  });
}

export function useCreateSalesOrder(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SalesOrderInput) => salesApi.createOrder(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.salesOrders.list(orgId) });
      qc.invalidateQueries({ queryKey: queryKeys.inventory.stock(orgId) });
    },
  });
}
