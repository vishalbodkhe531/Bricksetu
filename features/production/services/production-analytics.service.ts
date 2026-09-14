import { prisma } from '@/lib/prisma';
import type { BatchStage, ProductionAnalytics } from '../types/production.types';

export async function getProductionAnalytics(organizationId: string): Promise<ProductionAnalytics> {
  const batches = await prisma.batches.findMany({
    where: { business_unit_id: organizationId },
    include: {
      consumption: { select: { cost_paise: true } },
      expenses: { select: { amount_paise: true } },
      daily_moulding_logs: { select: { earned_amount_paise: true } },
    },
  });

  const total_batches = batches.length;
  let active_batches = 0;
  let completed_batches = 0;
  let total_bricks_moulded = 0;
  let total_fired_good = 0;
  let total_damaged = 0;
  let total_material_cost_paise = 0;
  let total_expense_cost_paise = 0;
  let total_moulding_labour_cost_paise = 0;

  const stage_distribution: Record<BatchStage, number> = {
    MOULDING: 0,
    DRYING: 0,
    FIRING: 0,
    SORTING: 0,
    COMPLETED: 0,
  };

  batches.forEach((b) => {
    if (b.status === 'IN_PROGRESS') active_batches++;
    if (b.status === 'COMPLETED') completed_batches++;

    const stage = b.stage as BatchStage;
    if (stage_distribution[stage] !== undefined) {
      stage_distribution[stage]++;
    }

    total_bricks_moulded += b.moulded_quantity;
    total_fired_good += b.fired_good_quantity;
    total_damaged += b.damaged_quantity;

    b.consumption.forEach((c) => {
      total_material_cost_paise += Number(c.cost_paise || 0);
    });

    b.expenses.forEach((e) => {
      total_expense_cost_paise += Number(e.amount_paise || 0);
    });

    b.daily_moulding_logs.forEach((m) => {
      total_moulding_labour_cost_paise += Number(m.earned_amount_paise || 0);
    });
  });

  const baseQty = total_bricks_moulded > 0 ? total_bricks_moulded : 1;
  const avg_yield_percentage =
    total_bricks_moulded > 0
      ? Math.round(((total_fired_good || total_bricks_moulded) / baseQty) * 1000) / 10
      : 0;

  const avg_wastage_percentage =
    total_bricks_moulded > 0 ? Math.round((total_damaged / baseQty) * 1000) / 10 : 0;

  const total_production_cost_paise =
    total_material_cost_paise + total_expense_cost_paise + total_moulding_labour_cost_paise;

  const goodQty = total_fired_good > 0 ? total_fired_good : total_bricks_moulded;
  const avg_cost_per_brick_paise =
    goodQty > 0 ? Math.round(total_production_cost_paise / goodQty) : 0;

  return {
    total_batches,
    active_batches,
    completed_batches,
    total_bricks_moulded,
    total_fired_good,
    total_damaged,
    avg_yield_percentage,
    avg_wastage_percentage,
    total_production_cost_paise,
    avg_cost_per_brick_paise,
    stage_distribution,
  };
}
