import { query } from '@/lib/db/pool';
import { requireSession } from '@/lib/auth/require-session';
import { safeBigInt } from '@/lib/utils';

export async function getSales() {
  const user = await requireSession();
  const { rows } = await query(
    `SELECT s.*, cust.name as customer_name, bt.name as brick_type_name, bg.name as brick_grade_name,
            c.status as payment_status, c.allocated_amount_paise, v.registration_number as vehicle_reg
     FROM sales.records s
     JOIN parties.customers cust ON cust.id = s.customer_id
     JOIN core.brick_types bt ON bt.id = s.brick_type_id
     JOIN core.brick_grades bg ON bg.id = s.brick_grade_id
     LEFT JOIN finance.charges c ON c.id = s.charge_id
     LEFT JOIN transport.vehicles v ON v.id = s.vehicle_id
     WHERE s.business_unit_id = $1
     ORDER BY s.sale_date DESC`,
    [user.business_unit_id]
  );
  return rows.map((r) => ({
    ...r,
    quantity: parseInt(r.quantity || '0', 10),
    unit_price_paise: safeBigInt(r.unit_price_paise).toString(),
    total_amount_paise: safeBigInt(r.total_amount_paise).toString(),
    cost_amount_paise: safeBigInt(r.cost_amount_paise).toString(),
    allocated_amount_paise: safeBigInt(r.allocated_amount_paise).toString(),
  }));
}

export async function getCustomers() {
  const user = await requireSession();
  const { rows } = await query(
    `SELECT cust.*,
            COALESCE(SUM(c.amount_paise - c.allocated_amount_paise), 0) as receivable_balance_paise
     FROM parties.customers cust
     LEFT JOIN finance.charges c ON c.party_id = cust.id AND c.party_type = 'CUSTOMER' AND c.status IN ('UNPAID', 'PARTIALLY_PAID')
     WHERE cust.business_unit_id = $1
     GROUP BY cust.id
     ORDER BY cust.name ASC`,
    [user.business_unit_id]
  );
  return rows.map((r) => ({
    ...r,
    receivable_balance_paise: safeBigInt(r.receivable_balance_paise).toString(),
  }));
}
