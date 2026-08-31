import { query } from '@/lib/db/pool';
import { requireSession } from '@/lib/auth/require-session';
import { safeBigInt } from '@/lib/utils';

export async function getPayments() {
  const user = await requireSession();
  const { rows } = await query(
    `SELECT p.*, pm.name as payment_method_name,
            CASE
              WHEN p.party_type = 'CUSTOMER' THEN (SELECT name FROM parties.customers WHERE id = p.party_id)
              WHEN p.party_type = 'SUPPLIER' THEN (SELECT name FROM parties.suppliers WHERE id = p.party_id)
              WHEN p.party_type = 'WORKER' THEN (SELECT full_name FROM workers.profiles WHERE id = p.party_id)
              ELSE 'General'
            END as party_name
     FROM finance.payments p
     JOIN core.payment_methods pm ON pm.id = p.payment_method_id
     WHERE p.business_unit_id = $1
     ORDER BY p.payment_date DESC`,
    [user.business_unit_id]
  );
  return rows.map((r) => ({
    ...r,
    amount_paise: safeBigInt(r.amount_paise).toString(),
  }));
}

export async function getUnpaidCharges(partyType?: string, partyId?: string) {
  const user = await requireSession();
  let sql = `SELECT c.*, (c.amount_paise - c.allocated_amount_paise) as remaining_unpaid_paise
             FROM finance.charges c
             WHERE c.business_unit_id = $1 AND c.status IN ('UNPAID', 'PARTIALLY_PAID')`;
  const params: any[] = [user.business_unit_id];

  if (partyType) {
    params.push(partyType);
    sql += ` AND c.party_type = $${params.length}`;
  }
  if (partyId) {
    params.push(partyId);
    sql += ` AND c.party_id = $${params.length}`;
  }

  sql += ' ORDER BY c.charge_date ASC';
  const { rows } = await query(sql, params);
  return rows.map((r) => ({
    ...r,
    amount_paise: safeBigInt(r.amount_paise).toString(),
    allocated_amount_paise: safeBigInt(r.allocated_amount_paise).toString(),
    remaining_unpaid_paise: safeBigInt(r.remaining_unpaid_paise).toString(),
  }));
}
