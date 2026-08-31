import { query } from '@/lib/db/pool';
import { requireSession } from '@/lib/auth/require-session';
import { idParamSchema } from '@/lib/validation/schemas';
import { safeBigInt } from '@/lib/utils';

export async function getBatches() {
  const user = await requireSession();
  const { rows } = await query(
    `SELECT b.*, bt.name as brick_type_name, bt.code as brick_type_code,
            COALESCE(SUM(l.earned_amount_paise), 0) as total_moulding_cost_paise
     FROM production.batches b
     JOIN core.brick_types bt ON bt.id = b.brick_type_id
     LEFT JOIN production.daily_moulding_logs l ON l.batch_id = b.id
     WHERE b.business_unit_id = $1
     GROUP BY b.id, bt.name, bt.code
     ORDER BY b.created_at DESC`,
    [user.business_unit_id]
  );
  return rows.map((r) => ({
    ...r,
    target_quantity: parseInt(r.target_quantity || '0', 10),
    moulded_quantity: parseInt(r.moulded_quantity || '0', 10),
    fired_good_quantity: parseInt(r.fired_good_quantity || '0', 10),
    damaged_quantity: parseInt(r.damaged_quantity || '0', 10),
    total_moulding_cost_paise: safeBigInt(r.total_moulding_cost_paise).toString(),
  }));
}

export async function getBatchDetail(id: string) {
  const user = await requireSession();

  idParamSchema.parse(id);

  const batchRes = await query(
    `SELECT b.*, bt.name as brick_type_name, bt.code as brick_type_code
     FROM production.batches b
     JOIN core.brick_types bt ON bt.id = b.brick_type_id
     WHERE b.id = $1 AND b.business_unit_id = $2`,
    [id, user.business_unit_id]
  );

  if (batchRes.rows.length === 0) {
    throw new Error('Batch not found');
  }

  const [logsRes, transitionsRes, materialsRes, expensesRes, transportRes] = await Promise.all([
    query(
      `SELECT l.*, w.full_name as worker_name, w.code as worker_code
       FROM production.daily_moulding_logs l
       JOIN workers.profiles w ON w.id = l.worker_id
       WHERE l.batch_id = $1 ORDER BY l.work_date DESC`,
      [id]
    ),
    query('SELECT * FROM production.stage_transitions WHERE batch_id = $1 ORDER BY created_at ASC', [id]),
    query(
      `SELECT c.*, m.name as material_name, u.code as unit_code
       FROM materials.consumption c
       JOIN materials.lots ml ON ml.id = c.material_lot_id
       JOIN materials.catalogue m ON m.id = ml.material_id
       JOIN core.material_units u ON u.id = m.unit_id
       WHERE c.batch_id = $1 ORDER BY c.consumption_date DESC`,
      [id]
    ),
    query(
      `SELECT e.*, cat.name as category_name
       FROM finance.expenses e
       JOIN core.expense_categories cat ON cat.id = e.category_id
       WHERE e.batch_id = $1 ORDER BY e.expense_date DESC`,
      [id]
    ),
    query(
      `SELECT t.*, v.registration_number
       FROM transport.trips t
       JOIN transport.vehicles v ON v.id = t.vehicle_id
       WHERE t.batch_id = $1 ORDER BY t.trip_date DESC`,
      [id]
    ),
  ]);

  const mouldingCost = logsRes.rows.reduce((acc, r) => acc + safeBigInt(r.earned_amount_paise), 0n);
  const materialCost = materialsRes.rows.reduce((acc, r) => acc + safeBigInt(r.cost_paise), 0n);
  const expenseCost = expensesRes.rows.reduce((acc, r) => acc + safeBigInt(r.amount_paise), 0n);
  const transportCost = transportRes.rows.reduce((acc, r) => acc + safeBigInt(r.cost_paise), 0n);
  const totalCost = mouldingCost + materialCost + expenseCost + transportCost;

  const goodQty = BigInt(batchRes.rows[0].fired_good_quantity || 0);
  const costPer1000Bricks = goodQty > 0n ? (totalCost * 1000n) / goodQty : null;

  return {
    ...batchRes.rows[0],
    moulding_logs: logsRes.rows.map((r) => ({
      ...r,
      bricks_moulded: parseInt(r.bricks_moulded || '0', 10),
      earned_amount_paise: safeBigInt(r.earned_amount_paise).toString(),
    })),
    stage_transitions: transitionsRes.rows,
    material_consumption: materialsRes.rows.map((r) => ({
      ...r,
      quantity: parseFloat(r.quantity || '0'),
      cost_paise: safeBigInt(r.cost_paise).toString(),
    })),
    expenses: expensesRes.rows.map((r) => ({
      ...r,
      amount_paise: safeBigInt(r.amount_paise).toString(),
    })),
    transport_trips: transportRes.rows.map((r) => ({
      ...r,
      cost_paise: safeBigInt(r.cost_paise).toString(),
    })),
    cost_breakdown: {
      moulding_cost_paise: mouldingCost.toString(),
      material_cost_paise: materialCost.toString(),
      expense_cost_paise: expenseCost.toString(),
      transport_cost_paise: transportCost.toString(),
      total_cost_paise: totalCost.toString(),
      cost_per_1000_paise: costPer1000Bricks ? costPer1000Bricks.toString() : null,
    },
  };
}
