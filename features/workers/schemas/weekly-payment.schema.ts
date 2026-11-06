import { z } from "zod";

export const weeklyPaymentMethodEnum = z.enum(["CASH", "PHONEPAY"], {
  message: "कृपया पेमेंट पद्धत निवडा (रोख किंवा फोनपे)",
});

export const weeklyPaymentInputSchema = z.object({
  worker_id: z.string().uuid("वैध कामगार आयडी आवश्यक आहे"),
  payment_date: z
    .string()
    .min(1, "तारीख आवश्यक आहे")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "तारीख YYYY-MM-DD स्वरूपात असावी"),
  day_of_week: z.string().optional(),
  amount: z
    .coerce
    .number({
      message: "कृपया वैध रक्कम प्रविष्ट करा",
    })
    .positive("रक्कम शून्य किंवा त्याहून अधिक असावी"),
  paid_by: z
    .string()
    .trim()
    .min(1, "पैसे देणाऱ्याचे नाव आवश्यक आहे")
    .max(255, "नाव २५५ अक्षरांपेक्षा लहान असावे"),
  payment_method: weeklyPaymentMethodEnum,
  notes: z.string().max(500, "टीप ५०० अक्षरांपेक्षा लहान असावी").optional().nullable(),
});

export type WeeklyPaymentInput = z.infer<typeof weeklyPaymentInputSchema>;

