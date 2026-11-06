"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { workersApi } from "../api/workers.api";
import { queryKeys } from "@/lib/query/queryKeys";
import type {
  WeeklyPaymentData,
  WeeklyPaymentInput,
  WeeklyPayment,
} from "../types/weekly-payment.types";

/**
 * Hook to fetch weekly payments and summary KPIs for a worker
 */
export function useWeeklyPayments(workerId: string) {
  return useQuery<WeeklyPaymentData>({
    queryKey: queryKeys.workers.weeklyPayments(workerId),
    queryFn: () => workersApi.getWeeklyPayments(workerId),
    enabled: !!workerId,
    staleTime: 60 * 1000, // 1 min cache
  });
}

/**
 * Mutation hook to record a weekly payment
 */
export function useRecordWeeklyPayment(workerId: string) {
  const qc = useQueryClient();

  return useMutation<WeeklyPayment, Error, WeeklyPaymentInput>({
    mutationFn: (input: WeeklyPaymentInput) =>
      workersApi.recordWeeklyPayment(workerId, input),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: queryKeys.workers.weeklyPayments(workerId),
      });
      qc.invalidateQueries({
        queryKey: queryKeys.workers.detail(workerId),
      });
      qc.invalidateQueries({
        queryKey: queryKeys.workers.all,
      });
    },
  });
}

/**
 * Mutation hook to soft-delete a weekly payment
 */
export function useDeleteWeeklyPayment(workerId: string) {
  const qc = useQueryClient();

  return useMutation<{ id: string; success: boolean }, Error, string>({
    mutationFn: (paymentId: string) =>
      workersApi.deleteWeeklyPayment(paymentId),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: queryKeys.workers.weeklyPayments(workerId),
      });
      qc.invalidateQueries({
        queryKey: queryKeys.workers.detail(workerId),
      });
    },
  });
}

