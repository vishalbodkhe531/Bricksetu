import { query } from '@/lib/db/pool';
import { requireSession } from '@/lib/auth/require-session';
import { safeBigInt } from '@/lib/utils';

export interface DashboardSummary {
  active_batches: number;
  finished_stock_total: number;
  customer_receivables_paise: string;
  supplier_payables_paise: string;
  stock_breakdown: Array<{
    brick_type_name: string;
    brick_grade_name: string;
    quantity: number;
  }>;
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const user = await requireSession();
  const buId = user.business_unit_id;

  const [activeBatchesRes, stockTotalRes, custRecRes, suppPayRes, stockBreakdownRes] = await Promise.all([
    query("SELECT COUNT(*) as cnt FROM production.batches WHERE business_unit_id = $1 AND status = 'ACTIVE'", [buId]),
    query("SELECT COALESCE(SUM(available_quantity), 0) as total FROM inventory.finished_lots WHERE business_unit_id = $1", [buId]),
    query(
      `SELECT COALESCE(SUM(amount_paise - allocated_amount_paise), 0) as total
       FROM finance.charges WHERE business_unit_id = $1 AND party_type = 'CUSTOMER' AND status IN ('UNPAID', 'PARTIALLY_PAID')`,
      [buId]
    ),
    query(
      `SELECT COALESCE(SUM(amount_paise - allocated_amount_paise), 0) as total
       FROM finance.charges WHERE business_unit_id = $1 AND party_type = 'SUPPLIER' AND status IN ('UNPAID', 'PARTIALLY_PAID')`,
      [buId]
    ),
    query(
      `SELECT bt.name as brick_type_name, bg.name as brick_grade_name,
              COALESCE(SUM(fl.available_quantity), 0) as quantity
       FROM inventory.finished_lots fl
       JOIN core.brick_types bt ON bt.id = fl.brick_type_id
       JOIN core.brick_grades bg ON bg.id = fl.brick_grade_id
       WHERE fl.business_unit_id = $1
       GROUP BY bt.id, bt.name, bg.id, bg.name
       ORDER BY bt.name, bg.name`,
      [buId]
    ),
  ]);

  return {
    active_batches: parseInt(activeBatchesRes.rows[0]?.cnt || '0', 10),
    finished_stock_total: parseInt(stockTotalRes.rows[0]?.total || '0', 10),
    customer_receivables_paise: safeBigInt(custRecRes.rows[0]?.total).toString(),
    supplier_payables_paise: safeBigInt(suppPayRes.rows[0]?.total).toString(),
    stock_breakdown: (stockBreakdownRes.rows || []).map((row) => ({
      brick_type_name: row.brick_type_name,
      brick_grade_name: row.brick_grade_name,
      quantity: parseInt(row.quantity || '0', 10),
    })),
  };
}
