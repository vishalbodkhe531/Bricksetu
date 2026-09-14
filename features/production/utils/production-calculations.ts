import { BatchKPIs } from '../types/production.types';

export function calculateBatchKPIs(params: {
  target_quantity: number;
  moulded_quantity: number;
  dried_quantity: number;
  fired_good_quantity: number;
  damaged_quantity: number;
  total_material_cost_paise: number;
  total_expense_cost_paise: number;
  total_moulding_labour_cost_paise: number;
  start_date: string;
  end_date?: string | null;
}): BatchKPIs {
  const {
    target_quantity,
    moulded_quantity,
    dried_quantity,
    fired_good_quantity,
    damaged_quantity,
    total_material_cost_paise,
    total_expense_cost_paise,
    total_moulding_labour_cost_paise,
    start_date,
    end_date,
  } = params;

  // Base quantity for percentage calculations is moulded_quantity if > 0, else target_quantity
  const baseQty = moulded_quantity > 0 ? moulded_quantity : target_quantity;

  const yield_percentage =
    baseQty > 0
      ? Math.round(((fired_good_quantity || moulded_quantity || 0) / baseQty) * 1000) / 10
      : 0;

  const wastage_percentage =
    baseQty > 0 ? Math.round((damaged_quantity / baseQty) * 1000) / 10 : 0;

  const total_production_cost_paise =
    total_material_cost_paise + total_expense_cost_paise + total_moulding_labour_cost_paise;

  const effectiveGoodQty = fired_good_quantity > 0 ? fired_good_quantity : moulded_quantity;

  const cost_per_brick_paise =
    effectiveGoodQty > 0 ? Math.round(total_production_cost_paise / effectiveGoodQty) : 0;

  const start = new Date(start_date);
  const end = end_date ? new Date(end_date) : new Date();
  const diffTime = Math.max(0, end.getTime() - start.getTime());
  const days_in_production = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

  return {
    target_quantity,
    moulded_quantity,
    dried_quantity,
    fired_good_quantity,
    damaged_quantity,
    yield_percentage,
    wastage_percentage,
    total_material_cost_paise,
    total_expense_cost_paise,
    total_moulding_labour_cost_paise,
    total_production_cost_paise,
    cost_per_brick_paise,
    days_in_production,
  };
}

export function formatPaiseToRupees(paise: number): string {
  const rupees = paise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(rupees);
}

export function formatCostPerBrick(paise: number): string {
  const rupees = paise / 100;
  return `₹${rupees.toFixed(2)}`;
}
