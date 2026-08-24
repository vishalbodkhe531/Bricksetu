import { FastifyInstance, FastifyRequest } from 'fastify';
import { query } from '../../shared/db/pool.js';
import { AppError } from '../../shared/errors/index.js';

export async function expensesRoutes(fastify: FastifyInstance) {
  // List Expenses
  fastify.get('/expenses', { preHandler: [fastify.authenticate] }, async (req: FastifyRequest) => {
    const user = (req as any).user;
    const { rows } = await query(
      `SELECT e.*, cat.name as category_name, pm.name as payment_method_name, b.batch_number
       FROM finance.expenses e
       JOIN core.expense_categories cat ON cat.id = e.category_id
       JOIN core.payment_methods pm ON pm.id = e.payment_method_id
       LEFT JOIN production.batches b ON b.id = e.batch_id
       WHERE e.business_unit_id = $1
       ORDER BY e.expense_date DESC`,
      [user.business_unit_id]
    );
    return { data: rows };
  });

  // Log Expense
  fastify.post('/expenses', { preHandler: [fastify.authenticate] }, async (req: FastifyRequest) => {
    const user = (req as any).user;
    const { category_id, batch_id, expense_date, amount_paise, payee_name, payment_method_id, notes } = req.body as any;

    if (!category_id || !expense_date || !amount_paise || !payment_method_id) {
      throw new AppError('INVALID_INPUT', 'Category, Expense Date, Amount, and Payment Method are required.', 400);
    }

    // Create Expense Charge
    const chgRes = await query(
      `INSERT INTO finance.charges (business_unit_id, party_type, charge_type, reference_id, charge_date, amount_paise, allocated_amount_paise, status, description, created_by)
       VALUES ($1, 'EXPENSE', 'DIRECT_EXPENSE', NULL, $2, $3, $3, 'PAID', 'Operating Expense', $4)
       RETURNING id`,
      [user.business_unit_id, expense_date, amount_paise, user.id]
    );
    const chargeId = chgRes.rows[0].id;

    // Create Expense Record
    const { rows } = await query(
      `INSERT INTO finance.expenses (business_unit_id, category_id, batch_id, expense_date, amount_paise, payee_name, payment_method_id, charge_id, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        user.business_unit_id,
        category_id,
        batch_id || null,
        expense_date,
        amount_paise,
        payee_name || null,
        payment_method_id,
        chargeId,
        notes || null,
        user.id,
      ]
    );

    // Update charge reference
    await query('UPDATE finance.charges SET reference_id = $1 WHERE id = $2', [rows[0].id, chargeId]);

    return { data: rows[0] };
  });
}
