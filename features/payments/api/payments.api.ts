import { api } from '@/lib/axios/axiosInstance';
import type { Payment, PaymentInput } from '../types/payment.types';

/**
 * Payments API module — client-side.
 * All calls hit /api/payments/* via the shared Axios instance.
 * Pages/components import hooks (usePayments, useCreatePayment) — never this directly.
 */
export const paymentsApi = {
  list: (orgId: string) =>
    api.get<Payment[]>('/payments', { params: { orgId } }).then((r) => r.data),

  getById: (id: string) =>
    api.get<Payment>(`/payments/${id}`).then((r) => r.data),

  create: (input: PaymentInput) =>
    api.post<Payment>('/payments', input).then((r) => r.data),

  update: (id: string, input: Partial<PaymentInput>) =>
    api.patch<Payment>(`/payments/${id}`, input).then((r) => r.data),

  remove: (id: string) =>
    api.delete(`/payments/${id}`).then((r) => r.data),
};
