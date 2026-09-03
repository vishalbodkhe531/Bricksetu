import { z } from 'zod';

export interface RawMaterial {
  id: string;
  organization_id: string;
  name: string;
  unit: string;
}

export interface InventoryTransaction {
  id: string;
  organization_id: string;
  item_type: 'raw_material' | 'finished_goods';
  item_id: string;
  transaction_type: 'in' | 'out';
  quantity: number;
  reference_type: string | null;
  reference_id: string | null;
  transaction_date: string;
  created_by: string | null;
  created_at: string;
}

export interface StockSummary {
  item_id: string;
  item_name: string;
  item_type: 'raw_material' | 'finished_goods';
  unit: string;
  stock: number;
}

export const inventoryTransactionInputSchema = z.object({
  item_type: z.enum(['raw_material', 'finished_goods']),
  item_id: z.string().min(1, 'Item is required'),
  transaction_type: z.enum(['in', 'out']),
  quantity: z.coerce.number().gt(0, 'Quantity must be > 0'),
  reference_type: z.string().optional().nullable(),
  reference_id: z.string().optional().nullable(),
  transaction_date: z.string().min(1, 'Date is required'),
});

export const rawMaterialInputSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  unit: z.string().min(1, 'Unit is required'),
});

export type InventoryTransactionInput = z.infer<typeof inventoryTransactionInputSchema>;
export type RawMaterialInput = z.infer<typeof rawMaterialInputSchema>;
