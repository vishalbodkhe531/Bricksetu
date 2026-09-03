import { z } from 'zod';

export interface BrickType {
  id: string;
  organization_id: string;
  name: string;
  dimensions: string | null;
  created_at: string;
}

export interface ProductionBatch {
  id: string;
  organization_id: string;
  worker_id: string | null;
  brick_type_id: string;
  production_date: string;
  bricks_moulded: number;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  // Joined fields
  brick_type?: BrickType;
  worker_name?: string;
}

export const productionBatchInputSchema = z.object({
  worker_id: z.string().optional().nullable(),
  brick_type_id: z.string().min(1, 'Brick type is required'),
  production_date: z.string().min(1, 'Production date is required'),
  bricks_moulded: z.coerce.number().int().min(0, 'Must be >= 0'),
  notes: z.string().optional().nullable(),
});

export const brickTypeInputSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  dimensions: z.string().optional().nullable(),
});

export type ProductionBatchInput = z.infer<typeof productionBatchInputSchema>;
export type BrickTypeInput = z.infer<typeof brickTypeInputSchema>;
