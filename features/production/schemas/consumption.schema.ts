import { z } from 'zod';

export const createConsumptionSchema = z.object({
  material_lot_id: z.string().optional().nullable(),
  material_id: z.string().optional().nullable(),
  material_name: z.string().optional().nullable(),
  material_unit: z.string().optional().nullable(),
  unit_cost_rupees: z.coerce.number().optional().nullable(),
  consumption_date: z.string().min(1, 'Consumption date is required'),
  quantity: z.coerce.number().positive('Quantity must be positive'),
  notes: z.string().optional().nullable(),
});

export type CreateConsumptionInput = z.infer<typeof createConsumptionSchema>;
