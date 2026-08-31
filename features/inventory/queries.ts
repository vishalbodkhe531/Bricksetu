import { query } from '@/lib/db/pool';
import { requireSession } from '@/lib/auth/require-session';
import { safeBigInt } from '@/lib/utils';

export async function getStockSummary() {
  const user = await requireSession();
  const { rows } = await query(
    `SELECT bt.id as brick_type_id, bt.name as brick_type_name, bt.code as brick_type_code,
            bg.id as brick_grade_id, bg.name as brick_grade_name, bg.code as brick_grade_code,
            COALESCE(SUM(fl.available_quantity), 0) as total_available_quantity,
            COALESCE(SUM(fl.initial_quantity), 0) as total_initial_quantity
     FROM core.brick_types bt
     CROSS JOIN core.brick_grades bg
     LEFT JOIN inventory.finished_lots fl ON fl.brick_type_id = bt.id AND fl.brick_grade_id = bg.id AND fl.business_unit_id = bt.business_unit_id
     WHERE bt.business_unit_id = $1 AND bg.business_unit_id = $1
     GROUP BY bt.id, bt.name, bt.code, bg.id, bg.name, bg.code
     ORDER BY bt.code, bg.code`,
    [user.business_unit_id]
  );
  return rows.map((r) => ({
    ...r,
    total_available_quantity: parseInt(r.total_available_quantity || '0', 10),
    total_initial_quantity: parseInt(r.total_initial_quantity || '0', 10),
  }));
}

export async function getStockLots() {
  const user = await requireSession();
  const { rows } = await query(
    `SELECT fl.*, bt.name as brick_type_name, bg.name as brick_grade_name, b.batch_number
     FROM inventory.finished_lots fl
     JOIN core.brick_types bt ON bt.id = fl.brick_type_id
     JOIN core.brick_grades bg ON bg.id = fl.brick_grade_id
     LEFT JOIN production.batches b ON b.id = fl.batch_id
     WHERE fl.business_unit_id = $1
     ORDER BY fl.created_at DESC`,
    [user.business_unit_id]
  );
  return rows.map((r) => ({
    ...r,
    available_quantity: parseInt(r.available_quantity || '0', 10),
    initial_quantity: parseInt(r.initial_quantity || '0', 10),
  }));
}

export async function getStockLedger(limit: number = 200) {
  const user = await requireSession();
  const { rows } = await query(
    `SELECT sl.*, bt.name as brick_type_name, bg.name as brick_grade_name
     FROM inventory.stock_ledger sl
     JOIN core.brick_types bt ON bt.id = sl.brick_type_id
     LEFT JOIN core.brick_grades bg ON bg.id = sl.brick_grade_id
     WHERE sl.business_unit_id = $1
     ORDER BY sl.created_at DESC LIMIT $2`,
    [user.business_unit_id, limit]
  );
  return rows.map((r) => ({
    ...r,
    quantity_change: parseInt(r.quantity_change || '0', 10),
    balance_after: parseInt(r.balance_after || '0', 10),
  }));
}
