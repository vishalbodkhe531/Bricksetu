import { z } from "zod";
import {
  workerInputSchema,
  workerUpdateSchema,
  rateChangeSchema,
  wageRateInputSchema,
  advanceInputSchema,
  settlementInputSchema,
} from "../schemas/worker.schema";

export {
  workerInputSchema,
  workerUpdateSchema,
  rateChangeSchema,
  wageRateInputSchema,
  advanceInputSchema,
  settlementInputSchema,
};

// ---------------------------------------------------------------------------
// Database types
// ---------------------------------------------------------------------------

export interface Worker {
  id: string;
  code?: string | null;
  organization_id: string;
  full_name: string;
  phone: string | null;
  alternate_phone?: string | null;
  address: string | null;
  id_proof_type?: string | null;
  id_proof_number: string | null;
  photo_url: string | null;
  dob?: string | null;
  gender?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  emergency_relationship?: string | null;
  category: string | null;
  joining_date: string | null;
  status: "active" | "inactive";
  created_at: string;
  updated_at?: string;
  // Derived fields
  current_rate_amount?: number;
  advance_balance?: number;
}

export interface WorkerWageRate {
  id: string;
  worker_id: string;
  rate_type: "per_1000_bricks" | "daily" | "monthly";
  rate_amount: number;
  effective_from: string;
  effective_to: string | null;
  created_at: string;
}

export interface WorkerAdvance {
  id: string;
  worker_id: string;
  amount: number;
  date_given: string;
  reason: string | null;
  created_at: string;
}

export interface WorkerSettlement {
  id: string;
  worker_id: string;
  period_start: string;
  period_end: string;
  gross_wage: number;
  advances_deducted: number;
  net_payable: number;
  status: "pending" | "paid";
  paid_on: string | null;
  created_at: string;
}

export interface WorkerWithDetails extends Worker {
  current_rate?: WorkerWageRate;
  worker_wage_rates?: WorkerWageRate[];
  recent_advances?: WorkerAdvance[];
  worker_settlements?: WorkerSettlement[];
  settlements?: WorkerSettlement[];
}

// ---------------------------------------------------------------------------
// Inferred TypeScript Types from Zod Schemas
// ---------------------------------------------------------------------------

export type WorkerInput = z.infer<typeof workerInputSchema>;
export type WorkerUpdateInput = z.infer<typeof workerUpdateSchema>;
export type RateChangeInput = z.infer<typeof rateChangeSchema>;
export type WageRateInput = z.infer<typeof wageRateInputSchema>;
export type AdvanceInput = z.infer<typeof advanceInputSchema>;
export type SettlementInput = z.infer<typeof settlementInputSchema>;
