import { FastifyInstance, FastifyRequest } from 'fastify';
import { query } from '../../shared/db/pool.js';
import { AppError } from '../../shared/errors/index.js';

export async function customersRoutes(fastify: FastifyInstance) {
  // List Customers with outstanding receivables
  fastify.get('/customers', { preHandler: [fastify.authenticate] }, async (req: FastifyRequest) => {
    const user = (req as any).user;
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
    return { data: rows };
  });

  // Create Customer
  fastify.post('/customers', { preHandler: [fastify.authenticate] }, async (req: FastifyRequest) => {
    const user = (req as any).user;
    const { code, name, phone, address } = req.body as any;
    if (!code || !name) throw new AppError('INVALID_INPUT', 'Customer Code and Name are required.', 400);

    const { rows } = await query(
      `INSERT INTO parties.customers (business_unit_id, code, name, phone, address)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [user.business_unit_id, code, name, phone || null, address || null]
    );
    return { data: rows[0] };
  });
}
