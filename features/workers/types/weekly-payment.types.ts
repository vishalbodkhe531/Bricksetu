import type { WeeklyPaymentInput } from "../schemas/weekly-payment.schema";

export type { WeeklyPaymentInput };

export type WeeklyPaymentMethod = "CASH" | "PHONEPAY";

export interface WeeklyPayment {
  id: string;
  business_unit_id: string;
  worker_id: string;
  payment_date: string;
  day_of_week: string;
  amount: number;
  amount_paise: string;
  paid_by: string;
  payment_method: WeeklyPaymentMethod;
  notes: string | null;
  created_at: string;
  created_by?: string | null;
}

export interface WeeklyPaymentKPIs {
  total_payment: number;
  total_decided_amount: number;
  cash_count: number;
  phonepay_count: number;
  cash_amount: number;
  phonepay_amount: number;
  remaining_amount: number;
}

export interface WeeklyPaymentData {
  payments: WeeklyPayment[];
  kpis: WeeklyPaymentKPIs;
}

export interface WeeklyPaymentGroup {
  weekKey: string;
  weekStartSaturday: string;
  weekEndFriday: string;
  totalAmount: number;
  entriesCount: number;
  payments: WeeklyPayment[];
}

