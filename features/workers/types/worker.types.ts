import { z } from 'zod';

// ---------------------------------------------------------------------------
// Database types
// ---------------------------------------------------------------------------

export interface Worker {
  id: string;
  organization_id: string;
  full_name: string;
  phone: string | null;
  address: string | null;
  id_proof_number: string | null;
  photo_url: string | null;
  category: string | null;
  joining_date: string | null;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at?: string;
  // Derived fields
  current_rate_amount?: number;
  advance_balance?: number;
}

export interface WorkerWageRate {
  id: string;
  worker_id: string;
  rate_type: 'per_1000_bricks' | 'daily' | 'monthly';
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
  status: 'pending' | 'paid';
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
// Zod validation schemas
// ---------------------------------------------------------------------------

/** Create Worker Schema (includes optional initial moulding rate) */
export const workerInputSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  category: z.enum(['PIECE_RATE', 'DAILY_WAGE', 'MONTHLY_SALARY']).default('PIECE_RATE'),
  joining_date: z.string().optional().nullable(),
  status: z.enum(['active', 'inactive']).default('active'),
  initial_rate_amount: z.coerce.number().min(0, 'Rate must be positive').optional().nullable(),
});

/** Update Worker Profile Schema (EXCLUDES wage rates - rate changes use rateChangeSchema) */
export const workerUpdateSchema = z.object({
  full_name: z.string().min(1, 'Full name is required').optional(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  category: z.enum(['PIECE_RATE', 'DAILY_WAGE', 'MONTHLY_SALARY']).optional(),
  joining_date: z.string().optional().nullable(),
  status: z.enum(['active', 'inactive']).optional(),
});

/** Rate Change Schema (distinct business action) */
export const rateChangeSchema = z.object({
  worker_id: z.string().min(1, 'Worker is required'),
  rate_amount: z.coerce.number().gt(0, 'Rate amount must be greater than 0'),
  rate_type: z.enum(['per_1000_bricks', 'daily', 'monthly']).default('per_1000_bricks'),
  effective_date: z.string().min(1, 'Effective date is required'),
});

export const wageRateInputSchema = z.object({
  rate_type: z.enum(['per_1000_bricks', 'daily', 'monthly']),
  rate_amount: z.coerce.number().min(0),
  effective_from: z.string().min(1, 'Effective date is required'),
  effective_to: z.string().optional().nullable(),
});

export const advanceInputSchema = z.object({
  worker_id: z.string().min(1),
  amount: z.coerce.number().gt(0, 'Amount must be > 0'),
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

export type WorkerInput = z.infer<typeof workerInputSchema>;
export type WorkerUpdateInput = z.infer<typeof workerUpdateSchema>;
export type RateChangeInput = z.infer<typeof rateChangeSchema>;
export type WageRateInput = z.infer<typeof wageRateInputSchema>;
export type AdvanceInput = z.infer<typeof advanceInputSchema>;
export type SettlementInput = z.infer<typeof settlementInputSchema>;
