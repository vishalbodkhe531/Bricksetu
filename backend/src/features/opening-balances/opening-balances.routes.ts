import { FastifyInstance, FastifyRequest } from 'fastify';
import { query } from '../../shared/db/pool.js';
import { AppError } from '../../shared/errors/index.js';

export async function openingBalancesRoutes(fastify: FastifyInstance) {
  // Record opening balance item via wizard
  fastify.post('/opening-balances', { preHandler: [fastify.authenticate] }, async (req: FastifyRequest) => {
    const user = (req as any).user;
    const { type, details } = req.body as any;

    if (!type || !details) {
      throw new AppError('INVALID_INPUT', 'Type and details are required.', 400);
    }

    await query('SELECT finance.record_opening_balance($1, $2, $3, $4)', [
      user.business_unit_id,
      type,
      JSON.stringify(details),
      user.id,
    ]);

    return { data: { success: true } };
  });
}
