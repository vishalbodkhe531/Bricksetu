import { z } from "zod";

// Phone number regex helper (Indian 10-digit mobile numbers starting with 6-9)
export const phoneRegex = /^[6-9]\d{9}$/;

/** Create Worker Schema (includes optional initial rate & opening advance) */
export const workerInputSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(1, "Full name cannot be blank or whitespace")
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be under 100 characters"),

  phone: z
    .string()
    .trim()
    .min(1, "Primary phone number is required")
    .regex(phoneRegex, "Enter a valid 10-digit mobile number (e.g. 9876543210)"),

  alternate_phone: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine((val) => !val || phoneRegex.test(val), {
      message: "Enter a valid 10-digit mobile number",
    }),

  address: z
    .string()
    .trim()
    .min(1, "Residential address cannot be blank or whitespace")
    .min(5, "Residential address must be at least 5 characters")
    .max(255, "Address must be under 255 characters"),

  category: z.enum(["PIECE_RATE", "DAILY_WAGE", "MONTHLY_SALARY"]).default("PIECE_RATE"),

  joining_date: z
    .string()
    .trim()
    .min(1, "Joining date is required")
    .optional()
    .nullable(),

  status: z.enum(["active", "inactive"]).default("active"),

  initial_rate_amount: z
    .coerce
    .number()
    .min(0, "Rate must be a non-negative number")
    .optional()
    .nullable(),

  // Personal Identity & ID Proof
  dob: z.string().trim().optional().nullable(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional().nullable(),
  id_proof_type: z.string().trim().optional().nullable(),
  id_proof_number: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine((val) => !val || val.length >= 4, {
      message: "ID proof number must be at least 4 characters long",
    }),
  photo_url: z.string().trim().optional().nullable(),

  // Opening Advance (Peshgi given at joining)
  opening_advance_amount: z
    .coerce
    .number()
    .min(0, "Opening advance amount must be a non-negative number")
    .optional()
    .nullable(),

  opening_advance_date: z.string().trim().optional().nullable(),
  opening_advance_reason: z.string().trim().optional().nullable(),

  // Emergency Contact
  emergency_contact_name: z.string().trim().optional().nullable(),
  emergency_contact_phone: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine((val) => !val || phoneRegex.test(val), {
      message: "Enter a valid 10-digit emergency contact phone number",
    }),
  emergency_relationship: z.string().trim().optional().nullable(),
});

/** Update Worker Profile Schema */
export const workerUpdateSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(1, "Full name cannot be blank or whitespace")
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be under 100 characters")
    .optional(),

  phone: z
    .string()
    .trim()
    .min(1, "Primary phone number is required")
    .regex(phoneRegex, "Enter a valid 10-digit mobile number (e.g. 9876543210)")
    .optional(),

  alternate_phone: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine((val) => !val || phoneRegex.test(val), {
      message: "Enter a valid 10-digit mobile number",
    }),

  address: z
    .string()
    .trim()
    .min(1, "Residential address cannot be blank or whitespace")
    .min(5, "Residential address must be at least 5 characters")
    .max(255, "Address must be under 255 characters")
    .optional(),

  category: z.enum(["PIECE_RATE", "DAILY_WAGE", "MONTHLY_SALARY"]).optional(),
  joining_date: z.string().trim().optional().nullable(),
  status: z.enum(["active", "inactive"]).optional(),

  dob: z.string().trim().optional().nullable(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional().nullable(),
  id_proof_type: z.string().trim().optional().nullable(),
  id_proof_number: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine((val) => !val || val.length >= 4, {
      message: "ID proof number must be at least 4 characters long",
    }),
  photo_url: z.string().trim().optional().nullable(),

  emergency_contact_name: z.string().trim().optional().nullable(),
  emergency_contact_phone: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine((val) => !val || phoneRegex.test(val), {
      message: "Enter a valid 10-digit emergency contact phone number",
    }),
  emergency_relationship: z.string().trim().optional().nullable(),
});

/** Rate Change Schema */
export const rateChangeSchema = z.object({
  worker_id: z.string().min(1, "Worker is required"),
  rate_amount: z.coerce.number().gt(0, "Rate amount must be greater than 0"),
  rate_type: z.enum(["per_1000_bricks", "daily", "monthly"]).default("per_1000_bricks"),
  effective_date: z.string().min(1, "Effective date is required"),
});

export const wageRateInputSchema = z.object({
  rate_type: z.enum(["per_1000_bricks", "daily", "monthly"]),
  rate_amount: z.coerce.number().min(0),
  effective_from: z.string().min(1, "Effective date is required"),
  effective_to: z.string().optional().nullable(),
});

export const advanceInputSchema = z.object({
  worker_id: z.string().min(1),
  amount: z.coerce.number().gt(0, "Amount must be > 0"),
  date_given: z.string().min(1),
  reason: z.string().optional().nullable(),
});

export const settlementInputSchema = z.object({
  worker_id: z.string().min(1),
  period_start: z.string().min(1),
  period_end: z.string().min(1),
  gross_wage: z.coerce.number().min(0),
  advances_deducted: z.coerce.number().min(0).default(0),
  net_payable: z.coerce.number().min(0),
});
