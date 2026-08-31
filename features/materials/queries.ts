import { query } from '@/lib/db/pool';
import { requireSession } from '@/lib/auth/require-session';
import { safeBigInt } from '@/lib/utils';

export async function getSuppliers() {
  const user = await requireSession();
  const { rows } = await query(
    `SELECT s.*,
            COALESCE(SUM(c.amount_paise - c.allocated_amount_paise), 0) as payable_balance_paise
     FROM parties.suppliers s
     LEFT JOIN finance.charges c ON c.party_id = s.id AND c.party_type = 'SUPPLIER' AND c.status IN ('UNPAID', 'PARTIALLY_PAID')
     WHERE s.business_unit_id = $1
     GROUP BY s.id
     ORDER BY s.name ASC`,
    [user.business_unit_id]
  );
  return rows.map((r) => ({
    ...r,
    payable_balance_paise: safeBigInt(r.payable_balance_paise).toString(),
  }));
}

export async function getMaterials() {
  const user = await requireSession();
  const { rows } = await query(
    `SELECT m.*, u.name as unit_name, u.code as unit_code,
            COALESCE(SUM(ml.available_quantity), 0) as current_stock
     FROM materials.catalogue m
     JOIN core.material_units u ON u.id = m.unit_id
     LEFT JOIN materials.lots ml ON ml.material_id = m.id AND ml.business_unit_id = m.business_unit_id
     WHERE m.business_unit_id = $1
     GROUP BY m.id, u.name, u.code
     ORDER BY m.name ASC`,
    [user.business_unit_id]
  );
  return rows.map((r) => ({
    ...r,
    current_stock: parseFloat(r.current_stock || '0'),
    reorder_level: parseFloat(r.reorder_level || '0'),
  }));
}

export async function getPurchases() {
  const user = await requireSession();
  const { rows } = await query(
    `SELECT p.*, s.name as supplier_name, m.name as material_name, u.code as unit_code,
            c.status as payment_status, c.allocated_amount_paise
     FROM materials.purchases p
     JOIN parties.suppliers s ON s.id = p.supplier_id
     JOIN materials.catalogue m ON m.id = p.material_id
     JOIN core.material_units u ON u.id = m.unit_id
     LEFT JOIN finance.charges c ON c.id = p.charge_id
     WHERE p.business_unit_id = $1
     ORDER BY p.purchase_date DESC`,
    [user.business_unit_id]
  );
  return rows.map((r) => ({
    ...r,
    quantity: parseFloat(r.quantity || '0'),
    unit_price_paise: safeBigInt(r.unit_price_paise).toString(),
    total_amount_paise: safeBigInt(r.total_amount_paise).toString(),
    allocated_amount_paise: safeBigInt(r.allocated_amount_paise).toString(),
  }));
}
