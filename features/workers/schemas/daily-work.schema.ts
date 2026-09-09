import { z } from 'zod';

export const workerCategoryEnum = z.enum(['AALYAWALE', 'KACHA_MAAL', 'PAKKA_MAAL', 'BHATKAR']);
export type WorkerCategory = z.infer<typeof workerCategoryEnum>;

export const entryModeEnum = z.enum(['DIRECT_COUNT', 'PINJRI_COUNT', 'SHIFT_COUNT']);
export type EntryMode = z.infer<typeof entryModeEnum>;

export const dailyWorkInputSchema = z
  .object({
    worker_id: z.string().uuid('Invalid worker ID'),
    work_date: z.string().min(1, 'Work date is required'),
    category: workerCategoryEnum,
    entry_mode: entryModeEnum,
    input_quantity: z.number().positive('Quantity must be greater than 0'),
    rate_per_unit: z.number().nonnegative('Rate cannot be negative').optional(),
    aalyawala_id: z.string().uuid().optional().nullable(),
    aalyawala_ids: z.array(z.string().uuid()).optional().nullable(),
    aalyawala_entries: z
      .array(
        z.object({
          aalyawala_id: z.string().uuid('Invalid Aalyawala ID'),
          input_quantity: z.number().positive('Quantity must be greater than 0'),
        })
      )
      .optional()
      .nullable(),
    batch_id: z.string().uuid().optional().nullable(),
    reference_no: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.entry_mode === 'DIRECT_COUNT') {
      if (data.input_quantity < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['input_quantity'],
          message: 'Direct count brick quantity must be at least 1 brick',
        });
      }
    } else if (data.entry_mode === 'PINJRI_COUNT') {
      // Allow increments of 0.5 for half-pinjri
      if ((data.input_quantity * 2) % 1 !== 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['input_quantity'],
          message: 'Pinjri quantity must be in increments of 0.5 (e.g. 45 or 45.5)',
        });
      }
    } else if (data.entry_mode === 'SHIFT_COUNT') {
      if (data.input_quantity <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['input_quantity'],
          message: 'Shift count must be greater than 0',
        });
      }
    }
  });

export type DailyWorkInput = z.infer<typeof dailyWorkInputSchema>;

export const bulkDailyWorkInputSchema = z.object({
  work_date: z.string().min(1, 'Work date is required'),
  category: workerCategoryEnum,
  entries: z.array(
    z.object({
      worker_id: z.string().uuid(),
      entry_mode: entryModeEnum,
      input_quantity: z.number().positive(),
      rate_per_unit: z.number().optional(),
      aalyawala_id: z.string().uuid().optional().nullable(),
      aalyawala_ids: z.array(z.string().uuid()).optional().nullable(),
      batch_id: z.string().uuid().optional().nullable(),
      reference_no: z.string().optional().nullable(),
      notes: z.string().optional().nullable(),
    })
  ).min(1, 'At least one entry is required'),
});

export type BulkDailyWorkInput = z.infer<typeof bulkDailyWorkInputSchema>;

export const workUnitConversionSchema = z.object({
  category: z.string().default('KACHA_MAAL'),
  unit_name: z.string().default('PINJRI'),
  physical_count_per_unit: z.number().int().positive().default(22),
  billable_count_per_unit: z.number().int().positive().default(20),
  effective_from: z.string().optional(),
});

export type WorkUnitConversionInput = z.infer<typeof workUnitConversionSchema>;
