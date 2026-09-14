import { z } from 'zod';

export const createConsumptionSchema = z.object({
  material_lot_id: z.string().min(1, 'Material lot is required'),
  consumption_date: z.string().min(1, 'Consumption date is required'),
  quantity: z.coerce.number().positive('Quantity must be positive'),
  notes: z.string().optional().nullable(),
});

export type CreateConsumptionInput = z.infer<typeof createConsumptionSchema>;
