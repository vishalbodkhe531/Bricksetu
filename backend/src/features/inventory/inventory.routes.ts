import { FastifyInstance, FastifyRequest } from 'fastify';
import { query } from '../../shared/db/pool.js';
import { AppError } from '../../shared/errors/index.js';

export async function inventoryRoutes(fastify: FastifyInstance) {
  // Stock Summary by Brick Type & Grade
  fastify.get('/stock/summary', { preHandler: [fastify.authenticate] }, async (req: FastifyRequest) => {
    const user = (req as any).user;
    const { rows } = await query(
      `SELECT bt.id as brick_type_id, bt.name as brick_type_name, bt.code as brick_type_code,
              bg.id as brick_grade_id, bg.name as brick_grade_name, bg.code as brick_grade_code,
              COALESCE(SUM(fl.available_quantity), 0) as total_available_quantity,
              COALESCE(SUM(fl.initial_quantity), 0) as total_initial_quantity
       FROM core.brick_types bt
       CROSS JOIN core.brick_grades bg
       LEFT JOIN inventory.finished_lots fl ON fl.brick_type_id = bt.id AND fl.brick_grade_id = bg.id AND fl.business_unit_id = bt.business_unit_id
       WHERE bt.business_unit_id = $1 AND bg.business_unit_id = $1
       GROUP BY bt.id, bt.name, bt.code, bg.id, bg.name, bg.code
       ORDER BY bt.code, bg.code`,
      [user.business_unit_id]
    );
    return { data: rows };
  });

  // Finished Stock Lots List
  fastify.get('/stock/lots', { preHandler: [fastify.authenticate] }, async (req: FastifyRequest) => {
    const user = (req as any).user;
    const { rows } = await query(
      `SELECT fl.*, bt.name as brick_type_name, bg.name as brick_grade_name, b.batch_number
       FROM inventory.finished_lots fl
       JOIN core.brick_types bt ON bt.id = fl.brick_type_id
       JOIN core.brick_grades bg ON bg.id = fl.brick_grade_id
       LEFT JOIN production.batches b ON b.id = fl.batch_id
       WHERE fl.business_unit_id = $1
       ORDER BY fl.created_at DESC`,
      [user.business_unit_id]
    );
    return { data: rows };
  });

  // Stock Movement Ledger
  fastify.get('/stock/ledger', { preHandler: [fastify.authenticate] }, async (req: FastifyRequest) => {
    const user = (req as any).user;
    const { rows } = await query(
      `SELECT sl.*, bt.name as brick_type_name, bg.name as brick_grade_name
       FROM inventory.stock_ledger sl
       JOIN core.brick_types bt ON bt.id = sl.brick_type_id
       LEFT JOIN core.brick_grades bg ON bg.id = sl.brick_grade_id
       WHERE sl.business_unit_id = $1
       ORDER BY sl.created_at DESC LIMIT 200`,
      [user.business_unit_id]
    );
    return { data: rows };
  });

  // Perform Manual Stock Adjustment
  fastify.post('/stock/adjustments', { preHandler: [fastify.authenticate] }, async (req: FastifyRequest) => {
    const user = (req as any).user;
    const { finished_lot_id, adjustment_type, quantity_change, reason, adjustment_date } = req.body as any;

    if (!finished_lot_id || !adjustment_type || quantity_change === undefined || !reason || !adjustment_date) {
      throw new AppError('INVALID_INPUT', 'All fields (lot, adjustment_type, quantity_change, reason, date) are required.', 400);
    }

    const { rows } = await query(
      'SELECT inventory.post_adjustment($1, $2, $3, $4, $5, $6, $7) as adjustment_id',
      [user.business_unit_id, finished_lot_id, adjustment_type, quantity_change, reason, adjustment_date, user.id]
    );

    return { data: { id: rows[0].adjustment_id } };
  });
}
