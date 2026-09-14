import { z } from 'zod';

export const stageTransitionSchema = z.object({
  from_stage: z.enum(['MOULDING', 'DRYING', 'FIRING', 'SORTING', 'COMPLETED']),
  to_stage: z.enum(['MOULDING', 'DRYING', 'FIRING', 'SORTING', 'COMPLETED']),
  transition_date: z.string().min(1, 'Transition date is required'),
  input_quantity: z.coerce.number().int().min(0, 'Input quantity must be >= 0'),
  output_good_quantity: z.coerce.number().int().min(0, 'Output good quantity must be >= 0'),
  damaged_quantity: z.coerce.number().int().min(0, 'Damaged quantity must be >= 0'),
  notes: z.string().optional().nullable(),
});

export type StageTransitionInput = z.infer<typeof stageTransitionSchema>;
