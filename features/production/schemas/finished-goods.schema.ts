import { z } from 'zod';

export const createFinishedGoodsSchema = z.object({
  brick_grade_id: z.string().min(1, 'Brick grade is required'),
  quantity: z.coerce.number().int().positive('Quantity must be positive'),
  unit_cost_paise: z.coerce.number().int().min(0, 'Unit cost must be >= 0'),
});

export type CreateFinishedGoodsInput = z.infer<typeof createFinishedGoodsSchema>;
