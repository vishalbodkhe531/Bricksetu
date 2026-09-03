import { z } from 'zod';

export interface Payment {
  id: string;
  organization_id: string;
  customer_id: string;
  sales_order_id: string | null;
  amount: number;
  payment_mode: 'cash' | 'upi' | 'bank' | 'cheque' | null;
  reference_number: string | null;
  payment_date: string;
  created_by: string | null;
  created_at: string;
  // Joined
  customer?: { id: string; name: string };
}

export const paymentInputSchema = z.object({
  customer_id: z.string().min(1, 'Customer is required'),
  sales_order_id: z.string().optional().nullable(),
  amount: z.coerce.number().gt(0, 'Amount must be > 0'),
  payment_mode: z.enum(['cash', 'upi', 'bank', 'cheque']).optional().nullable(),
  reference_number: z.string().optional().nullable(),
  payment_date: z.string().min(1, 'Payment date is required'),
});

export type PaymentInput = z.infer<typeof paymentInputSchema>;
