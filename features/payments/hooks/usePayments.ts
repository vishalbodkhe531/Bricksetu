'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentsApi } from '../api/payments.api';
import { queryKeys } from '@/lib/query/queryKeys';
import type { Payment, PaymentInput } from '../types/payment.types';

/**
 * usePayments — fetch all payments for an org.
 */
export function usePayments(orgId: string, initialData?: Payment[]) {
  return useQuery({
    queryKey: queryKeys.payments.list(orgId),
    queryFn: () => paymentsApi.list(orgId),
    initialData,
    staleTime: 30 * 1000, // 30s — payments change frequently
    enabled: !!orgId,
  });
}

/**
 * usePaymentDetail — fetch a single payment with full details.
 */
export function usePaymentDetail(id: string, initialData?: Payment) {
  return useQuery({
    queryKey: queryKeys.payments.detail(id),
    queryFn: () => paymentsApi.getById(id),
    initialData,
    enabled: !!id,
  });
}

/**
 * useCreatePayment — mutation to record a new payment.
 * Invalidates the list query on success.
 */
export function useCreatePayment(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: PaymentInput) => paymentsApi.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.payments.list(orgId) }),
  });
}

/**
 * useUpdatePayment — mutation to update a payment.
 */
export function useUpdatePayment(orgId: string, paymentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<PaymentInput>) => paymentsApi.update(paymentId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.payments.list(orgId) });
      qc.invalidateQueries({ queryKey: queryKeys.payments.detail(paymentId) });
    },
  });
}

/**
 * useDeletePayment — mutation to delete a payment.
 */
export function useDeletePayment(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (paymentId: string) => paymentsApi.remove(paymentId),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.payments.list(orgId) }),
  });
}
