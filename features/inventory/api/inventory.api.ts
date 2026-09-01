import { api } from '@/lib/axios/axiosInstance';
import type {
  InventoryTransaction,
  InventoryTransactionInput,
  RawMaterial,
  RawMaterialInput,
  StockSummary,
} from '../types/inventory.types';

export const inventoryApi = {
  listTransactions: (orgId: string) =>
    api.get<InventoryTransaction[]>('/inventory', { params: { orgId } }).then((r) => r.data),

  createTransaction: (input: InventoryTransactionInput) =>
    api.post<InventoryTransaction>('/inventory', input).then((r) => r.data),

  listRawMaterials: (orgId: string) =>
    api.get<RawMaterial[]>('/inventory/raw-materials', { params: { orgId } }).then((r) => r.data),

  createRawMaterial: (input: RawMaterialInput) =>
    api.post<RawMaterial>('/inventory/raw-materials', input).then((r) => r.data),

  getStock: (orgId: string) =>
    api.get<StockSummary[]>('/inventory/stock', { params: { orgId } }).then((r) => r.data),
};
