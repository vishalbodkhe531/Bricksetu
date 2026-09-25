import { z } from 'zod';

export const workerCategoryEnum = z.enum(['AALYAWALE', 'KACHA_MAAL', 'PAKKA_MAAL', 'BHATKAR']);
export type WorkerCategory = z.infer<typeof workerCategoryEnum>;

export const entryModeEnum = z.enum(['DIRECT_COUNT', 'PINJRI_COUNT', 'SHIFT_COUNT']);
export type EntryMode = z.infer<typeof entryModeEnum>;

export const dailyWorkInputSchema = z
  .object({
    worker_id: z.string().min(1, 'Worker selection is required / कामगार निवडणे आवश्यक आहे'),
    work_date: z.string().min(1, 'Work date is required / कामाची तारीख निवडणे आवश्यक आहे'),
    category: workerCategoryEnum,
    entry_mode: entryModeEnum,
    input_quantity: z.number().positive('Quantity must be greater than 0 / संख्या ० पेक्षा जास्त असावी'),
    rate_per_unit: z.number().positive('Work rate must be greater than 0 / काम दर ० पेक्षा जास्त असावा'),
    aalyawala_id: z.string().uuid().optional().nullable(),
    aalyawala_ids: z.array(z.string().uuid()).optional().nullable(),
    aalyawala_entries: z
      .array(
        z.object({
          aalyawala_id: z.string().uuid('Invalid Aalyawala ID / अवैध आल्यावाला'),
          input_quantity: z.number().positive('Quantity must be greater than 0 / संख्या ० पेक्षा जास्त असावी'),
        })
      )
      .optional()
      .nullable(),
    bhatkar_id: z.string().uuid().optional().nullable(),
    bhatkar_ids: z.array(z.string().uuid()).optional().nullable(),
    bhatkar_entries: z
      .array(
        z.object({
          bhatkar_id: z.string().uuid('Invalid Bhatkar ID / अवैध भटकर'),
          input_quantity: z.number().positive('Quantity must be greater than 0 / संख्या ० पेक्षा जास्त असावी'),
        })
      )
      .optional()
      .nullable(),
    batch_id: z.string().nullable().optional(),
    reference_no: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    // 1. Work Date Validation
    if (!data.work_date || data.work_date.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['work_date'],
        message: 'Work date is required / कामाची तारीख निवडणे आवश्यक आहे',
      });
    }

    // 2. Select Bhatti Validation (Required)
    if (!data.batch_id || data.batch_id.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['batch_id'],
        message: 'Select Bhatti / भट्टी निवडणे आवश्यक आहे',
      });
    }

    // 3. Work Rate Validation (> 0)
    if (
      data.rate_per_unit === undefined ||
      data.rate_per_unit === null ||
      isNaN(data.rate_per_unit) ||
      data.rate_per_unit <= 0
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['rate_per_unit'],
        message: 'Work rate is required and must be greater than 0 / काम दर आवश्यक आहे',
      });
    }

    // 4. Select Aalyawala & Enter Quantities Validation
    const isAalyawalaRequired = data.category === 'BHATKAR' || data.category === 'KACHA_MAAL';
    if (isAalyawalaRequired) {
      const hasAalyawalaEntries =
        Array.isArray(data.aalyawala_entries) &&
        data.aalyawala_entries.length > 0 &&
        data.aalyawala_entries.some((e) => e.input_quantity > 0);

      const hasSingleAalyawala = !!data.aalyawala_id || (Array.isArray(data.aalyawala_ids) && data.aalyawala_ids.length > 0);

      if (!hasAalyawalaEntries && !hasSingleAalyawala) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['aalyawala_entries'],
          message: 'Please select at least one Aalyawala & enter quantity / किमान एका आल्यावाल्याची संख्या टाका',
        });
      }
    }

    // 5. Select Bhatkar Validation
    if (data.category === 'KACHA_MAAL') {
      const hasBhatkar =
        !!data.bhatkar_id ||
        (Array.isArray(data.bhatkar_ids) && data.bhatkar_ids.length > 0) ||
        (Array.isArray(data.bhatkar_entries) && data.bhatkar_entries.length > 0);

      if (!hasBhatkar) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['bhatkar_id'],
          message: 'Please select a Bhatkar / भटकर निवडणे आवश्यक आहे',
        });
      }

      if (data.aalyawala_id && data.worker_id === data.aalyawala_id) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['aalyawala_id'],
          message: 'A worker cannot be their own Aalyawala / कामगार स्वतःचा आल्यावाला असू शकत नाही',
        });
      }

      if (data.bhatkar_id && data.worker_id === data.bhatkar_id) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['bhatkar_id'],
          message: 'A worker cannot be their own Bhatkar / कामगार स्वतःचा भटकर असू शकत नाही',
        });
      }

      if (data.aalyawala_id && data.bhatkar_id && data.aalyawala_id === data.bhatkar_id) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['bhatkar_id'],
          message: 'Aalyawala and Bhatkar must be different workers / आल्यावाला आणि भटकर वेगवेगळे असावेत',
        });
      }
    }

    // 6. Entry Mode quantity validations
    if (data.entry_mode === 'DIRECT_COUNT') {
      if (data.input_quantity < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['input_quantity'],
          message: 'Direct count brick quantity must be at least 1 brick / किमान १ वीट टाका',
        });
      }
    } else if (data.entry_mode === 'PINJRI_COUNT') {
      if ((data.input_quantity * 2) % 1 !== 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['input_quantity'],
          message: 'Pinjri quantity must be in increments of 0.5 / पिंजरी ०.५ च्या पटीत असावी',
        });
      }
    } else if (data.entry_mode === 'SHIFT_COUNT') {
      if (data.input_quantity <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['input_quantity'],
          message: 'Shift count must be greater than 0 / शिफ्ट ० पेक्षा जास्त असावी',
        });
      }
    }
  });

export type DailyWorkInput = z.infer<typeof dailyWorkInputSchema>;

export const bulkDailyWorkInputSchema = z.object({
  work_date: z.string().min(1, 'Work date is required'),
  category: workerCategoryEnum,
  bhatkar_id: z.string().uuid().optional().nullable(),
  entries: z.array(
    z.object({
      worker_id: z.string().uuid(),
      entry_mode: entryModeEnum,
      input_quantity: z.number().positive(),
      rate_per_unit: z.number().optional(),
      aalyawala_id: z.string().uuid().optional().nullable(),
      aalyawala_ids: z.array(z.string().uuid()).optional().nullable(),
      bhatkar_id: z.string().uuid().optional().nullable(),
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
