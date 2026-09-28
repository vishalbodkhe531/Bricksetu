import { z } from "zod";

export const phoneRegex = /^[6-9]\d{9}$/;
export const gstinRegex = /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/;

export const materialCreateSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Material name is required")
      .min(2, "Material name must be at least 2 characters")
      .max(100, "Material name must be under 100 characters"),

    unit: z.string().min(1, "Unit of measure is required"),

    reorder_level: z
      .coerce
      .number()
      .min(0, "Reorder level must be a non-negative number")
      .optional()
      .nullable(),

    description: z
      .string()
      .trim()
      .max(255, "Description must be under 255 characters")
      .optional()
      .nullable(),

    supplier_mode: z.enum(["none", "existing", "new"]).default("none"),

    supplier_id: z.string().optional().nullable(),

    new_supplier_name: z
      .string()
      .trim()
      .max(255, "Supplier name must be under 255 characters")
      .optional()
      .nullable(),

    new_supplier_contact_person: z
      .string()
      .trim()
      .max(255, "Contact person must be under 255 characters")
      .optional()
      .nullable(),

    new_supplier_phone: z
      .string()
      .trim()
      .optional()
      .nullable()
      .refine((val) => !val || phoneRegex.test(val), {
        message: "Enter a valid 10-digit mobile number (e.g. 9876543210)",
      }),

    new_supplier_address: z
      .string()
      .trim()
      .max(500, "Address must be under 500 characters")
      .optional()
      .nullable(),

    new_supplier_gst: z
      .string()
      .trim()
      .transform((val) => val?.toUpperCase())
      .optional()
      .nullable()
      .refine((val) => !val || gstinRegex.test(val), {
        message: "Enter a valid 15-character GSTIN (e.g. 27AAAAA0000A1Z5)",
      }),
  })
  .superRefine((data, ctx) => {
    if (data.supplier_mode === "existing" && !data.supplier_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please select an existing supplier",
        path: ["supplier_id"],
      });
    }

    if (data.supplier_mode === "new") {
      if (!data.new_supplier_name || data.new_supplier_name.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Supplier name is required when registering a new supplier",
          path: ["new_supplier_name"],
        });
      }
    }
  });

export const materialUpdateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Material name is required")
    .min(2, "Material name must be at least 2 characters")
    .max(100, "Material name must be under 100 characters")
    .optional(),

  unit: z.string().min(1, "Unit of measure is required").optional(),

  reorder_level: z
    .coerce
    .number()
    .min(0, "Reorder level must be a non-negative number")
    .optional()
    .nullable(),

  description: z
    .string()
    .trim()
    .max(255, "Description must be under 255 characters")
    .optional()
    .nullable(),

  is_active: z.boolean().optional(),
});
