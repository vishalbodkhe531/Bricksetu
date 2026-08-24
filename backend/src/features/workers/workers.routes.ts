import { FastifyInstance, FastifyRequest } from 'fastify';
import { query } from '../../shared/db/pool.js';
import { AppError, NotFoundError } from '../../shared/errors/index.js';

export async function workersRoutes(fastify: FastifyInstance) {
  // List workers
  fastify.get('/workers', { preHandler: [fastify.authenticate] }, async (req: FastifyRequest) => {
    const user = (req as any).user;
    const { rows } = await query(
      `SELECT w.*, 
              (SELECT rate_per_1000_paise 
               FROM workers.rate_history 
               WHERE worker_id = w.id 
               ORDER BY effective_date DESC LIMIT 1) as current_rate_paise
       FROM workers.profiles w
       WHERE w.business_unit_id = $1
       ORDER BY w.full_name ASC`,
      [user.business_unit_id]
    );
    return { data: rows };
  });

  // Create Worker Profile with Initial Piece Rate
  fastify.post('/workers', { preHandler: [fastify.authenticate] }, async (req: FastifyRequest) => {
    const user = (req as any).user;
    const { code, full_name, phone, address, payment_type, joining_date, initial_rate_per_1000_paise } = req.body as any;

    if (!code || !full_name || !joining_date || initial_rate_per_1000_paise === undefined) {
      throw new AppError('INVALID_INPUT', 'Code, Full Name, Joining Date, and Initial Rate are required.', 400);
    }

    const client = await fastify.pgClient();
    try {
      await client.query('BEGIN');

      const workerRes = await client.query(
        `INSERT INTO workers.profiles (business_unit_id, code, full_name, phone, address, payment_type, joining_date)
         VALUES ($1, $2, $3, $4, $5, COALESCE($6, 'PIECE_RATE'), $7)
         RETURNING *`,
        [user.business_unit_id, code, full_name, phone || null, address || null, payment_type, joining_date]
      );

      const worker = workerRes.rows[0];

      // Add initial rate
      await client.query(
        `INSERT INTO workers.rate_history (worker_id, effective_date, rate_per_1000_paise, created_by)
         VALUES ($1, $2, $3, $4)`,
        [worker.id, joining_date, initial_rate_per_1000_paise, user.id]
      );

      await client.query('COMMIT');
      worker.current_rate_paise = initial_rate_per_1000_paise;
      return { data: worker };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  });

  // Get Worker Profile & Rate History
  fastify.get('/workers/:id', { preHandler: [fastify.authenticate] }, async (req: FastifyRequest) => {
    const user = (req as any).user;
    const { id } = req.params as any;

    const workerRes = await query(
      'SELECT * FROM workers.profiles WHERE id = $1 AND business_unit_id = $2',
      [id, user.business_unit_id]
    );

    if (workerRes.rows.length === 0) {
      throw new NotFoundError('Worker profile not found.');
    }

    const ratesRes = await query(
      'SELECT * FROM workers.rate_history WHERE worker_id = $1 ORDER BY effective_date DESC',
      [id]
    );

    return {
      data: {
        ...workerRes.rows[0],
        rate_history: ratesRes.rows,
      },
    };
  });

  // Add Dated Piece Rate to History
  fastify.post('/workers/:id/rates', { preHandler: [fastify.authenticate] }, async (req: FastifyRequest) => {
    const user = (req as any).user;
    const { id } = req.params as any;
    const { effective_date, rate_per_1000_paise } = req.body as any;

    if (!effective_date || rate_per_1000_paise === undefined) {
      throw new AppError('INVALID_INPUT', 'Effective date and rate per 1,000 bricks are required.', 400);
    }

    const { rows } = await query(
      `INSERT INTO workers.rate_history (worker_id, effective_date, rate_per_1000_paise, created_by)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (worker_id, effective_date) 
       DO UPDATE SET rate_per_1000_paise = EXCLUDED.rate_per_1000_paise
       RETURNING *`,
      [id, effective_date, rate_per_1000_paise, user.id]
    );

    return { data: rows[0] };
  });
}
