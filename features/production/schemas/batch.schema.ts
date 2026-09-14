import { z } from 'zod';

export const createBatchSchema = z.object({
  batch_name: z.string().optional().nullable(),
  brick_type_id: z.string().optional().or(z.literal('')),
  target_quantity: z.coerce.number().int().min(1, 'Target quantity must be > 0'),
  start_date: z.string().min(1, 'Start date is required'),
  expected_end_date: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const updateBatchSchema = z.object({
  target_quantity: z.coerce.number().int().min(1, 'Target quantity must be > 0').optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional().nullable(),
  status: z.enum(['IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  notes: z.string().optional().nullable(),
});

export type CreateBatchInput = z.infer<typeof createBatchSchema>;
export type UpdateBatchInput = z.infer<typeof updateBatchSchema>;
