import { FastifyInstance, FastifyRequest } from 'fastify';
import { query } from '../../shared/db/pool.js';
import { AppError, NotFoundError } from '../../shared/errors/index.js';

export async function materialsRoutes(fastify: FastifyInstance) {
  // --- SUPPLIERS ---
  fastify.get('/suppliers', { preHandler: [fastify.authenticate] }, async (req: FastifyRequest) => {
    const user = (req as any).user;
    const { rows } = await query(
      `SELECT s.*,
              COALESCE(SUM(c.amount_paise - c.allocated_amount_paise), 0) as payable_balance_paise
       FROM parties.suppliers s
       LEFT JOIN finance.charges c ON c.party_id = s.id AND c.party_type = 'SUPPLIER' AND c.status IN ('UNPAID', 'PARTIALLY_PAID')
       WHERE s.business_unit_id = $1
       GROUP BY s.id
       ORDER BY s.name ASC`,
      [user.business_unit_id]
    );
    return { data: rows };
  });

  fastify.post('/suppliers', { preHandler: [fastify.authenticate] }, async (req: FastifyRequest) => {
    const user = (req as any).user;
    const { code, name, contact_person, phone, address } = req.body as any;
    if (!code || !name) throw new AppError('INVALID_INPUT', 'Supplier Code and Name are required.', 400);

    const { rows } = await query(
      `INSERT INTO parties.suppliers (business_unit_id, code, name, contact_person, phone, address)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [user.business_unit_id, code, name, contact_person || null, phone || null, address || null]
    );
    return { data: rows[0] };
  });

  // --- MATERIALS CATALOGUE ---
  fastify.get('/materials', { preHandler: [fastify.authenticate] }, async (req: FastifyRequest) => {
    const user = (req as any).user;
    const { rows } = await query(
      `SELECT m.*, u.name as unit_name, u.code as unit_code,
              COALESCE(SUM(ml.available_quantity), 0) as current_stock
       FROM materials.catalogue m
       JOIN core.material_units u ON u.id = m.unit_id
       LEFT JOIN materials.lots ml ON ml.material_id = m.id AND ml.business_unit_id = m.business_unit_id
       WHERE m.business_unit_id = $1
       GROUP BY m.id, u.name, u.code
       ORDER BY m.name ASC`,
      [user.business_unit_id]
    );
    return { data: rows };
  });

  fastify.post('/materials', { preHandler: [fastify.authenticate] }, async (req: FastifyRequest) => {
    const user = (req as any).user;
    const { code, name, unit_id, reorder_level, description } = req.body as any;
    if (!code || !name || !unit_id) throw new AppError('INVALID_INPUT', 'Code, Name, and Unit are required.', 400);

    const { rows } = await query(
      `INSERT INTO materials.catalogue (business_unit_id, code, name, unit_id, reorder_level, description)
       VALUES ($1, $2, $3, $4, COALESCE($5, 0), $6) RETURNING *`,
      [user.business_unit_id, code, name, unit_id, reorder_level, description || null]
    );
    return { data: rows[0] };
  });

  // --- MATERIAL PURCHASES ---
  fastify.get('/purchases', { preHandler: [fastify.authenticate] }, async (req: FastifyRequest) => {
    const user = (req as any).user;
    const { rows } = await query(
      `SELECT p.*, s.name as supplier_name, m.name as material_name, u.code as unit_code,
              c.status as payment_status, c.allocated_amount_paise
       FROM materials.purchases p
       JOIN parties.suppliers s ON s.id = p.supplier_id
       JOIN materials.catalogue m ON m.id = p.material_id
       JOIN core.material_units u ON u.id = m.unit_id
       LEFT JOIN finance.charges c ON c.id = p.charge_id
       WHERE p.business_unit_id = $1
       ORDER BY p.purchase_date DESC`,
      [user.business_unit_id]
    );
    return { data: rows };
  });

  fastify.post('/purchases', { preHandler: [fastify.authenticate] }, async (req: FastifyRequest) => {
    const user = (req as any).user;
    const { supplier_id, material_id, purchase_date, quantity, unit_price_paise, notes } = req.body as any;

    if (!supplier_id || !material_id || !purchase_date || !quantity || unit_price_paise === undefined) {
      throw new AppError('INVALID_INPUT', 'Supplier, Material, Date, Quantity, and Unit Price are required.', 400);
    }

    const { rows } = await query(
      'SELECT materials.post_purchase($1, $2, $3, $4, $5, $6, $7, $8) as purchase_id',
      [user.business_unit_id, supplier_id, material_id, purchase_date, quantity, unit_price_paise, user.id, notes || null]
    );

    return { data: { id: rows[0].purchase_id } };
  });

  // --- MATERIAL CONSUMPTION ---
  fastify.post('/materials/consume', { preHandler: [fastify.authenticate] }, async (req: FastifyRequest) => {
    const user = (req as any).user;
    const { batch_id, material_id, consumption_date, quantity, notes } = req.body as any;

    if (!material_id || !consumption_date || !quantity) {
      throw new AppError('INVALID_INPUT', 'Material, Consumption Date, and Quantity are required.', 400);
    }

    await query(
      'SELECT materials.consume_fifo($1, $2, $3, $4, $5, $6, $7)',
      [user.business_unit_id, batch_id || null, material_id, consumption_date, quantity, user.id, notes || null]
    );

    return { data: { success: true } };
  });
}
