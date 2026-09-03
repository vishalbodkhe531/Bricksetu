import { api } from '@/lib/axios/axiosInstance';
import type { Customer, CustomerInput, SalesOrder, SalesOrderInput } from '../types/sales.types';

export const salesApi = {
  listCustomers: (orgId: string) =>
    api.get<Customer[]>('/customers', { params: { orgId } }).then((r) => r.data),

  createCustomer: (input: CustomerInput) =>
    api.post<Customer>('/customers', input).then((r) => r.data),

  updateCustomer: (id: string, input: Partial<CustomerInput>) =>
    api.patch<Customer>(`/customers/${id}`, input).then((r) => r.data),

  listOrders: (orgId: string) =>
    api.get<SalesOrder[]>('/sales-orders', { params: { orgId } }).then((r) => r.data),

  getOrder: (id: string) =>
    api.get<SalesOrder>(`/sales-orders/${id}`).then((r) => r.data),

  createOrder: (input: SalesOrderInput) =>
    api.post<SalesOrder>('/sales-orders', input).then((r) => r.data),
};
