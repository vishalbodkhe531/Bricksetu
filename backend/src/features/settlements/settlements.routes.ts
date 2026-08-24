import { FastifyInstance, FastifyRequest } from 'fastify';
import { query } from '../../shared/db/pool.js';
import { AppError, NotFoundError } from '../../shared/errors/index.js';

export async function settlementsRoutes(fastify: FastifyInstance) {
  // List Settlements
  fastify.get('/settlements', { preHandler: [fastify.authenticate] }, async (req: FastifyRequest) => {
    const user = (req as any).user;
    const { rows } = await query(
      `SELECT s.*, w.full_name as worker_name, w.code as worker_code,
              c.status as payment_status, c.allocated_amount_paise
       FROM finance.settlements s
       JOIN workers.profiles w ON w.id = s.worker_id
       LEFT JOIN finance.charges c ON c.id = s.charge_id
       WHERE s.business_unit_id = $1
       ORDER BY s.created_at DESC`,
      [user.business_unit_id]
    );
    return { data: rows };
  });

  // Get Un-settled Moulding Work for Worker within Date Range
  fastify.get('/settlements/unsettled-work', { preHandler: [fastify.authenticate] }, async (req: FastifyRequest) => {
    const user = (req as any).user;
    const { worker_id, start_date, end_date } = req.query as any;

    if (!worker_id || !start_date || !end_date) {
      throw new AppError('INVALID_INPUT', 'Worker ID, Start Date, and End Date are required.', 400);
    }

    const { rows } = await query(
      `SELECT l.*, b.batch_number, bt.name as brick_type_name
       FROM production.daily_moulding_logs l
       JOIN production.batches b ON b.id = l.batch_id
       JOIN core.brick_types bt ON bt.id = b.brick_type_id
       WHERE b.business_unit_id = $1
         AND l.worker_id = $2
         AND l.work_date >= $3
         AND l.work_date <= $4
         AND l.settlement_id IS NULL
       ORDER BY l.work_date ASC`,
      [user.business_unit_id, worker_id, start_date, end_date]
    );

    const totalBricks = rows.reduce((acc, r) => acc + r.bricks_moulded, 0);
    const grossAmountPaise = rows.reduce((acc, r) => acc + BigInt(r.earned_amount_paise), 0n);

    return {
      data: {
        logs: rows,
        total_bricks: totalBricks,
        gross_amount_paise: grossAmountPaise.toString(),
      },
    };
  });

  // Generate Draft Settlement
  fastify.post('/settlements/generate', { preHandler: [fastify.authenticate] }, async (req: FastifyRequest) => {
    const user = (req as any).user;
    const { worker_id, period_start_date, period_end_date, notes } = req.body as any;

    if (!worker_id || !period_start_date || !period_end_date) {
      throw new AppError('INVALID_INPUT', 'Worker ID, Period Start Date, and Period End Date are required.', 400);
    }

    const { rows } = await query(
      'SELECT finance.generate_settlement($1, $2, $3, $4, $5, $6) as settlement_id',
      [user.business_unit_id, worker_id, period_start_date, period_end_date, user.id, notes || null]
    );

    return { data: { id: rows[0].settlement_id } };
  });

  // Get Settlement Detail
  fastify.get('/settlements/:id', { preHandler: [fastify.authenticate] }, async (req: FastifyRequest) => {
    const user = (req as any).user;
    const { id } = req.params as any;

    const sRes = await query(
      `SELECT s.*, w.full_name as worker_name, w.code as worker_code,
              u_app.full_name as approved_by_name, u_void.full_name as voided_by_name
       FROM finance.settlements s
       JOIN workers.profiles w ON w.id = s.worker_id
       LEFT JOIN app_auth.users u_app ON u_app.id = s.approved_by
       LEFT JOIN app_auth.users u_void ON u_void.id = s.voided_by
       WHERE s.id = $1 AND s.business_unit_id = $2`,
      [id, user.business_unit_id]
    );

    if (sRes.rows.length === 0) {
      throw new NotFoundError('Settlement not found.');
    }

    const itemsRes = await query(
      `SELECT l.*, b.batch_number, bt.name as brick_type_name
       FROM production.daily_moulding_logs l
       JOIN production.batches b ON b.id = l.batch_id
       JOIN core.brick_types bt ON bt.id = b.brick_type_id
       WHERE l.settlement_id = $1
       ORDER BY l.work_date ASC`,
      [id]
    );

    return {
      data: {
        ...sRes.rows[0],
        moulding_items: itemsRes.rows,
      },
    };
  });

  // Approve Settlement
  fastify.post('/settlements/:id/approve', { preHandler: [fastify.authenticate] }, async (req: FastifyRequest) => {
    const user = (req as any).user;
    const { id } = req.params as any;

    const { rows } = await query(
      'SELECT finance.approve_settlement($1, $2) as charge_id',
      [id, user.id]
    );

    return { data: { charge_id: rows[0].charge_id } };
  });

  // Void Settlement
  fastify.post('/settlements/:id/void', { preHandler: [fastify.authenticate] }, async (req: FastifyRequest) => {
    const user = (req as any).user;
    const { id } = req.params as any;
    const { reason } = req.body as any;

    if (!reason) {
      throw new AppError('INVALID_INPUT', 'Void reason is required.', 400);
    }

    await query('SELECT finance.void_settlement($1, $2, $3)', [id, reason, user.id]);
    return { data: { success: true } };
  });
}
