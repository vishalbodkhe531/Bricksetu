import { z } from 'zod';

export interface Customer {
  id: string;
  organization_id: string;
  name: string;
  phone: string | null;
  address: string | null;
  gst_number: string | null;
  created_at: string;
}

export interface SalesOrder {
  id: string;
  organization_id: string;
  customer_id: string;
  order_date: string;
  delivery_date: string | null;
  status: 'pending' | 'partial' | 'delivered' | 'cancelled';
  total_amount: number;
  created_by: string | null;
  created_at: string;
  // Joined
  customer?: Customer;
  items?: SalesOrderItem[];
}

export interface SalesOrderItem {
  id: string;
  sales_order_id: string;
  brick_type_id: string;
  quantity: number;
  rate_per_unit: number;
  amount: number;
}

export const customerInputSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  gst_number: z.string().optional().nullable(),
});

export const salesOrderInputSchema = z.object({
  customer_id: z.string().min(1, 'Customer is required'),
  order_date: z.string().min(1, 'Order date is required'),
  delivery_date: z.string().optional().nullable(),
  status: z.enum(['pending', 'partial', 'delivered', 'cancelled']).default('pending'),
  items: z.array(z.object({
    brick_type_id: z.string().min(1),
    quantity: z.coerce.number().int().gt(0),
    rate_per_unit: z.coerce.number().gt(0),
  })).min(1, 'At least one item is required'),
});

export type CustomerInput = z.infer<typeof customerInputSchema>;
export type SalesOrderInput = z.infer<typeof salesOrderInputSchema>;
