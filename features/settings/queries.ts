import { query } from '@/lib/db/pool';
import { requireSession } from '@/lib/auth/require-session';

export async function getMasterData() {
  const user = await requireSession();
  const buId = user.business_unit_id;

  const [buRes, brickTypesRes, brickGradesRes, unitsRes, methodsRes, expCatRes, usersRes] = await Promise.all([
    query('SELECT * FROM core.business_units WHERE id = $1', [buId]),
    query('SELECT * FROM core.brick_types WHERE business_unit_id = $1 ORDER BY code', [buId]),
    query('SELECT * FROM core.brick_grades WHERE business_unit_id = $1 ORDER BY code', [buId]),
    query('SELECT * FROM core.material_units ORDER BY code'),
    query('SELECT * FROM core.payment_methods ORDER BY code'),
    query('SELECT * FROM core.expense_categories WHERE business_unit_id = $1 ORDER BY code', [buId]),
    query('SELECT id, username, email, full_name, role, is_active, created_at FROM app_auth.users WHERE business_unit_id = $1 ORDER BY created_at DESC', [buId]),
  ]);

  return {
    business_unit: buRes.rows[0],
    brick_types: brickTypesRes.rows,
    brick_grades: brickGradesRes.rows,
    material_units: unitsRes.rows,
    payment_methods: methodsRes.rows,
    expense_categories: expCatRes.rows,
    users: usersRes.rows,
  };
}
