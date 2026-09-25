export type BatchStage = 'MOULDING' | 'DRYING' | 'FIRING' | 'SORTING' | 'COMPLETED';
export type BatchStatus = 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface BrickType {
  id: string;
  organization_id: string;
  code: string;
  name: string;
  dimensions: string | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export interface BrickGrade {
  id: string;
  organization_id: string;
  code: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Batch {
  id: string;
  organization_id: string;
  batch_number: string;
  brick_type_id: string;
  stage: BatchStage;
  target_quantity: number;
  moulded_quantity: number;
  dried_quantity: number;
  fired_good_quantity: number;
  damaged_quantity: number;
  start_date: string;
  end_date: string | null;
  status: BatchStatus;
  notes: string | null;
  created_at: string;
  created_by: string | null;
  // Joined / Calculated fields
  brick_type?: BrickType;
  created_by_name?: string;
  total_consumption_cost_paise?: number;
  total_expense_cost_paise?: number;
  total_moulding_cost_paise?: number;
  stage_transition_count?: number;
  moulding_log_count?: number;
}

export type ProductionBatch = Batch;

export interface StageTransition {
  id: string;
  batch_id: string;
  from_stage: BatchStage;
  to_stage: BatchStage;
  transition_date: string;
  input_quantity: number;
  output_good_quantity: number;
  damaged_quantity: number;
  notes: string | null;
  created_at: string;
  created_by?: string | null;
  created_by_name?: string;
}

export interface MaterialConsumption {
  id: string;
  batch_id: string;
  material_lot_id: string;
  consumption_date: string;
  quantity: number;
  cost_paise: number;
  notes: string | null;
  created_at: string;
  // Joined fields
  material_name?: string;
  material_unit?: string;
  lot_number?: string;
}

export interface MouldingLog {
  id: string;
  batch_id: string;
  worker_id: string;
  work_date: string;
  bricks_moulded: number;
  rate_per_1000_paise: number;
  earned_amount_paise: number;
  settlement_id: string | null;
  notes: string | null;
  created_at: string;
  // Joined fields
  worker_name?: string;
}

export interface BatchExpense {
  id: string;
  category_name: string;
  expense_date: string;
  amount_paise: number;
  payee_name: string | null;
  payment_method_name: string;
  notes: string | null;
  created_at: string;
}

export interface FinishedLotOutput {
  id: string;
  batch_id: string;
  brick_type_id: string;
  brick_grade_id: string;
  lot_number: string;
  initial_quantity: number;
  available_quantity: number;
  unit_cost_paise: number;
  created_at: string;
  brick_type_name?: string;
  brick_grade_name?: string;
}

export interface BatchKPIs {
  target_quantity: number;
  moulded_quantity: number;
  dried_quantity: number;
  fired_good_quantity: number;
  damaged_quantity: number;
  yield_percentage: number;
  wastage_percentage: number;
  total_material_cost_paise: number;
  total_expense_cost_paise: number;
  total_moulding_labour_cost_paise: number;
  total_production_cost_paise: number;
  cost_per_brick_paise: number;
  days_in_production: number;
}

export interface BatchBrickSupplyStats {
  raw_bricks_supplied: number;
  raw_bricks_supplied_direct: number;
  raw_bricks_supplied_inferred: number;
  raw_bricks_linked_count: number;
  finished_bricks_produced: number;
  finished_bricks_linked_count: number;
  has_unlinked_ambiguity: boolean;
}

export interface ProductionAnalytics {
  total_batches: number;
  active_batches: number;
  completed_batches: number;
  total_bricks_moulded: number;
  total_fired_good: number;
  total_damaged: number;
  avg_yield_percentage: number;
  avg_wastage_percentage: number;
  total_production_cost_paise: number;
  avg_cost_per_brick_paise: number;
  stage_distribution: Record<BatchStage, number>;
}

