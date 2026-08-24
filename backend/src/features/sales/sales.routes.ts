import { FastifyInstance, FastifyRequest } from 'fastify';
import { query } from '../../shared/db/pool.js';
import { AppError } from '../../shared/errors/index.js';

export async function salesRoutes(fastify: FastifyInstance) {
  // List Sales
  fastify.get('/sales', { preHandler: [fastify.authenticate] }, async (req: FastifyRequest) => {
    const user = (req as any).user;
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
    return { data: rows };
  });

  // Post Sale
  fastify.post('/sales', { preHandler: [fastify.authenticate] }, async (req: FastifyRequest) => {
    const user = (req as any).user;
    const { customer_id, brick_type_id, brick_grade_id, sale_date, quantity, unit_price_paise, vehicle_id, notes } = req.body as any;

    if (!customer_id || !brick_type_id || !brick_grade_id || !sale_date || !quantity || unit_price_paise === undefined) {
      throw new AppError('INVALID_INPUT', 'Customer, Brick Type, Grade, Date, Quantity, and Unit Price are required.', 400);
    }

    const { rows } = await query(
      'SELECT sales.post_sale($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) as sale_id',
      [
        user.business_unit_id,
        customer_id,
        brick_type_id,
        brick_grade_id,
        sale_date,
        quantity,
        unit_price_paise,
        vehicle_id || null,
        user.id,
        notes || null,
      ]
    );

    return { data: { id: rows[0].sale_id } };
  });
}
