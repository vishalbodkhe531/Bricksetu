import { FastifyInstance, FastifyRequest } from 'fastify';
import { query } from '../../shared/db/pool.js';
import { AppError, NotFoundError } from '../../shared/errors/index.js';

export async function productionRoutes(fastify: FastifyInstance) {
  // List Batches
  fastify.get('/batches', { preHandler: [fastify.authenticate] }, async (req: FastifyRequest) => {
    const user = (req as any).user;
    const { rows } = await query(
      `SELECT b.*, bt.name as brick_type_name, bt.code as brick_type_code,
              COALESCE(SUM(l.earned_amount_paise), 0) as total_moulding_cost_paise
       FROM production.batches b
       JOIN core.brick_types bt ON bt.id = b.brick_type_id
       LEFT JOIN production.daily_moulding_logs l ON l.batch_id = b.id
       WHERE b.business_unit_id = $1
       GROUP BY b.id, bt.name, bt.code
       ORDER BY b.created_at DESC`,
      [user.business_unit_id]
    );
    return { data: rows };
  });

  // Create Batch
  fastify.post('/batches', { preHandler: [fastify.authenticate] }, async (req: FastifyRequest) => {
    const user = (req as any).user;
    const { batch_number, brick_type_id, target_quantity, start_date, notes } = req.body as any;

    if (!batch_number || !brick_type_id || !start_date) {
      throw new AppError('INVALID_INPUT', 'Batch Number, Brick Type, and Start Date are required.', 400);
    }

    const { rows } = await query(
      `INSERT INTO production.batches (business_unit_id, batch_number, brick_type_id, target_quantity, start_date, notes, created_by)
       VALUES ($1, $2, $3, COALESCE($4, 0), $5, $6, $7)
       RETURNING *`,
      [user.business_unit_id, batch_number, brick_type_id, target_quantity, start_date, notes || null, user.id]
    );

    return { data: rows[0] };
  });

  // Get Batch Detail (moulding logs, stage transitions, cost breakdown)
  fastify.get('/batches/:id', { preHandler: [fastify.authenticate] }, async (req: FastifyRequest) => {
    const user = (req as any).user;
    const { id } = req.params as any;

    const batchRes = await query(
      `SELECT b.*, bt.name as brick_type_name, bt.code as brick_type_code
       FROM production.batches b
       JOIN core.brick_types bt ON bt.id = b.brick_type_id
       WHERE b.id = $1 AND b.business_unit_id = $2`,
      [id, user.business_unit_id]
    );

    if (batchRes.rows.length === 0) {
      throw new NotFoundError('Batch not found.');
    }

    const [logsRes, transitionsRes, materialsRes, expensesRes, transportRes] = await Promise.all([
      query(
        `SELECT l.*, w.full_name as worker_name, w.code as worker_code
         FROM production.daily_moulding_logs l
         JOIN workers.profiles w ON w.id = l.worker_id
         WHERE l.batch_id = $1 ORDER BY l.work_date DESC`,
        [id]
      ),
      query('SELECT * FROM production.stage_transitions WHERE batch_id = $1 ORDER BY created_at ASC', [id]),
      query(
        `SELECT c.*, m.name as material_name, u.code as unit_code
         FROM materials.consumption c
         JOIN materials.lots ml ON ml.id = c.material_lot_id
         JOIN materials.catalogue m ON m.id = ml.material_id
         JOIN core.material_units u ON u.id = m.unit_id
         WHERE c.batch_id = $1 ORDER BY c.consumption_date DESC`,
        [id]
      ),
      query(
        `SELECT e.*, cat.name as category_name
         FROM finance.expenses e
         JOIN core.expense_categories cat ON cat.id = e.category_id
         WHERE e.batch_id = $1 ORDER BY e.expense_date DESC`,
        [id]
      ),
      query(
        `SELECT t.*, v.registration_number
         FROM transport.trips t
         JOIN transport.vehicles v ON v.id = t.vehicle_id
         WHERE t.batch_id = $1 ORDER BY t.trip_date DESC`,
        [id]
      ),
    ]);

    const mouldingCost = logsRes.rows.reduce((acc, r) => acc + BigInt(r.earned_amount_paise), 0n);
    const materialCost = materialsRes.rows.reduce((acc, r) => acc + BigInt(r.cost_paise), 0n);
    const expenseCost = expensesRes.rows.reduce((acc, r) => acc + BigInt(r.amount_paise), 0n);
    const transportCost = transportRes.rows.reduce((acc, r) => acc + BigInt(r.cost_paise), 0n);
    const totalCost = mouldingCost + materialCost + expenseCost + transportCost;

    const goodQty = batchRes.rows[0].fired_good_quantity;
    const costPer1000Bricks = goodQty > 0 ? (totalCost * 1000n) / BigInt(goodQty) : null;

    return {
      data: {
        ...batchRes.rows[0],
        moulding_logs: logsRes.rows,
        stage_transitions: transitionsRes.rows,
        material_consumption: materialsRes.rows,
        expenses: expensesRes.rows,
        transport_trips: transportRes.rows,
        cost_breakdown: {
          moulding_cost_paise: mouldingCost.toString(),
          material_cost_paise: materialCost.toString(),
          expense_cost_paise: expenseCost.toString(),
          transport_cost_paise: transportCost.toString(),
          total_cost_paise: totalCost.toString(),
          cost_per_1000_paise: costPer1000Bricks ? costPer1000Bricks.toString() : null,
        },
      },
    };
  });

  // Record Daily Moulding Output (Worker piece work)
  fastify.post('/production/moulding-logs', { preHandler: [fastify.authenticate] }, async (req: FastifyRequest) => {
    const user = (req as any).user;
    const { batch_id, worker_id, work_date, bricks_moulded, notes } = req.body as any;

    if (!batch_id || !worker_id || !work_date || !bricks_moulded) {
      throw new AppError('INVALID_INPUT', 'Batch ID, Worker ID, Work Date, and Bricks Moulded count are required.', 400);
    }

    const { rows } = await query(
      'SELECT production.record_daily_moulding($1, $2, $3, $4, $5, $6) as log_id',
      [batch_id, worker_id, work_date, bricks_moulded, user.id, notes || null]
    );

    return { data: { id: rows[0].log_id } };
  });

  // Execute Batch Stage Transition
  fastify.post('/batches/:id/transitions', { preHandler: [fastify.authenticate] }, async (req: FastifyRequest) => {
    const user = (req as any).user;
    const { id } = req.params as any;
    const { to_stage, transition_date, input_quantity, output_good_quantity, damaged_quantity, grade_allocations, notes } = req.body as any;

    if (!to_stage || !transition_date || input_quantity === undefined) {
      throw new AppError('INVALID_INPUT', 'Target stage, transition date, and input quantity are required.', 400);
    }

    const { rows } = await query(
      'SELECT production.transition_stage($1, $2, $3, $4, $5, $6, $7, $8, $9) as transition_id',
      [
        id,
        to_stage,
        transition_date,
        input_quantity,
        output_good_quantity || 0,
        damaged_quantity || 0,
        user.id,
        grade_allocations ? JSON.stringify(grade_allocations) : null,
        notes || null,
      ]
    );

    return { data: { id: rows[0].transition_id } };
  });
}
