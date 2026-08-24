import { FastifyInstance, FastifyRequest } from 'fastify';
import { query } from '../../shared/db/pool.js';
import { AppError } from '../../shared/errors/index.js';

export async function paymentsRoutes(fastify: FastifyInstance) {
  // List Payments
  fastify.get('/payments', { preHandler: [fastify.authenticate] }, async (req: FastifyRequest) => {
    const user = (req as any).user;
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
    return { data: rows };
  });

  // Create Payment (Incoming or Outgoing)
  fastify.post('/payments', { preHandler: [fastify.authenticate] }, async (req: FastifyRequest) => {
    const user = (req as any).user;
    const { direction, party_type, party_id, payment_date, amount_paise, payment_method_id, reference_number, notes } = req.body as any;

    if (!direction || !party_type || !payment_date || !amount_paise || !payment_method_id) {
      throw new AppError('INVALID_INPUT', 'Direction, Party Type, Payment Date, Amount, and Payment Method are required.', 400);
    }

    const countRes = await query('SELECT count(*) + 1 as cnt FROM finance.payments WHERE business_unit_id = $1', [user.business_unit_id]);
    const pmtNum = 'PMT-' + payment_date.replace(/-/g, '') + '-' + String(countRes.rows[0].cnt).padStart(4, '0');

    const { rows } = await query(
      `INSERT INTO finance.payments (business_unit_id, payment_number, direction, party_type, party_id, payment_date, amount_paise, payment_method_id, reference_number, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        user.business_unit_id,
        pmtNum,
        direction,
        party_type,
        party_id || null,
        payment_date,
        amount_paise,
        payment_method_id,
        reference_number || null,
        notes || null,
        user.id,
      ]
    );

    return { data: rows[0] };
  });

  // Get Outstanding Charges for Party to Allocate
  fastify.get('/payments/unpaid-charges', { preHandler: [fastify.authenticate] }, async (req: FastifyRequest) => {
    const user = (req as any).user;
    const { party_type, party_id } = req.query as any;

    let sql = `SELECT c.*, (c.amount_paise - c.allocated_amount_paise) as remaining_unpaid_paise
               FROM finance.charges c
               WHERE c.business_unit_id = $1 AND c.status IN ('UNPAID', 'PARTIALLY_PAID')`;
    const params: any[] = [user.business_unit_id];

    if (party_type) {
      params.push(party_type);
      sql += ` AND c.party_type = $${params.length}`;
    }
    if (party_id) {
      params.push(party_id);
      sql += ` AND c.party_id = $${params.length}`;
    }

    sql += ' ORDER BY c.charge_date ASC';
    const { rows } = await query(sql, params);
    return { data: rows };
  });

  // Allocate Payment to Charges
  fastify.post('/payments/:id/allocations', { preHandler: [fastify.authenticate] }, async (req: FastifyRequest) => {
    const user = (req as any).user;
    const { id } = req.params as any;
    const { allocations } = req.body as any;

    if (!allocations || !Array.isArray(allocations) || allocations.length === 0) {
      throw new AppError('INVALID_INPUT', 'Allocations array is required.', 400);
    }

    await query('SELECT finance.allocate_payment($1, $2, $3)', [id, JSON.stringify(allocations), user.id]);
    return { data: { success: true } };
  });
}
