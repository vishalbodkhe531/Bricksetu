import { FastifyInstance, FastifyRequest } from 'fastify';
import { query } from '../../shared/db/pool.js';
import { AppError } from '../../shared/errors/index.js';

export async function settingsRoutes(fastify: FastifyInstance) {
  // Get all master data lookup configurations
  fastify.get('/settings/master-data', { preHandler: [fastify.authenticate] }, async (req: FastifyRequest) => {
    const user = (req as any).user;
    const buId = user.business_unit_id;

    const [buRes, brickTypesRes, brickGradesRes, unitsRes, methodsRes, expCatRes] = await Promise.all([
      query('SELECT * FROM core.business_units WHERE id = $1', [buId]),
      query('SELECT * FROM core.brick_types WHERE business_unit_id = $1 ORDER BY code', [buId]),
      query('SELECT * FROM core.brick_grades WHERE business_unit_id = $1 ORDER BY code', [buId]),
      query('SELECT * FROM core.material_units ORDER BY code'),
      query('SELECT * FROM core.payment_methods ORDER BY code'),
      query('SELECT * FROM core.expense_categories WHERE business_unit_id = $1 ORDER BY code', [buId]),
    ]);

    return {
      data: {
        business_unit: buRes.rows[0],
        brick_types: brickTypesRes.rows,
        brick_grades: brickGradesRes.rows,
        material_units: unitsRes.rows,
        payment_methods: methodsRes.rows,
        expense_categories: expCatRes.rows,
      },
    };
  });

  // Create Brick Type
  fastify.post('/settings/brick-types', { preHandler: [fastify.authenticate] }, async (req: FastifyRequest) => {
    const user = (req as any).user;
    const { code, name, dimensions, description } = req.body as any;
    if (!code || !name) throw new AppError('INVALID_INPUT', 'Code and Name are required.', 400);

    const { rows } = await query(
      `INSERT INTO core.brick_types (business_unit_id, code, name, dimensions, description)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [user.business_unit_id, code, name, dimensions || null, description || null]
    );
    return { data: rows[0] };
  });

  // Create Brick Grade
  fastify.post('/settings/brick-grades', { preHandler: [fastify.authenticate] }, async (req: FastifyRequest) => {
    const user = (req as any).user;
    const { code, name, description } = req.body as any;
    if (!code || !name) throw new AppError('INVALID_INPUT', 'Code and Name are required.', 400);

    const { rows } = await query(
      `INSERT INTO core.brick_grades (business_unit_id, code, name, description)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [user.business_unit_id, code, name, description || null]
    );
    return { data: rows[0] };
  });

  // Create Expense Category
  fastify.post('/settings/expense-categories', { preHandler: [fastify.authenticate] }, async (req: FastifyRequest) => {
    const user = (req as any).user;
    const { code, name, description } = req.body as any;
    if (!code || !name) throw new AppError('INVALID_INPUT', 'Code and Name are required.', 400);

    const { rows } = await query(
      `INSERT INTO core.expense_categories (business_unit_id, code, name, description)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [user.business_unit_id, code, name, description || null]
    );
    return { data: rows[0] };
  });
}
