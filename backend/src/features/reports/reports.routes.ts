import { FastifyInstance, FastifyRequest } from 'fastify';
import { query } from '../../shared/db/pool.js';

export async function reportsRoutes(fastify: FastifyInstance) {
  // 1. Daily/Monthly Production and Damage Report
  fastify.get('/reports/production-damage', { preHandler: [fastify.authenticate] }, async (req: FastifyRequest) => {
    const user = (req as any).user;
    const { start_date, end_date, batch_id, brick_type_id } = req.query as any;

    let sql = `
      SELECT st.transition_date, b.batch_number, bt.name as brick_type_name,
             st.from_stage, st.to_stage, st.input_quantity, st.output_good_quantity, st.damaged_quantity
      FROM production.stage_transitions st
      JOIN production.batches b ON b.id = st.batch_id
      JOIN core.brick_types bt ON bt.id = b.brick_type_id
      WHERE b.business_unit_id = $1
    `;
    const params: any[] = [user.business_unit_id];

    if (start_date) {
      params.push(start_date);
      sql += ` AND st.transition_date >= $${params.length}`;
    }
    if (end_date) {
      params.push(end_date);
      sql += ` AND st.transition_date <= $${params.length}`;
    }
    if (batch_id) {
      params.push(batch_id);
      sql += ` AND b.id = $${params.length}`;
    }
    if (brick_type_id) {
      params.push(brick_type_id);
      sql += ` AND b.brick_type_id = $${params.length}`;
    }

    sql += ' ORDER BY st.transition_date DESC';
    const { rows } = await query(sql, params);
    return { data: rows };
  });

  // 2. Stock Movement and Closing Stock Report
  fastify.get('/reports/stock-movement', { preHandler: [fastify.authenticate] }, async (req: FastifyRequest) => {
    const user = (req as any).user;
    const { start_date, end_date, brick_type_id, brick_grade_id } = req.query as any;

    let sql = `
      SELECT sl.transaction_date, sl.transaction_type, bt.name as brick_type_name, bg.name as brick_grade_name,
             sl.quantity_change, sl.balance_after, sl.reason, fl.lot_number
      FROM inventory.stock_ledger sl
      JOIN core.brick_types bt ON bt.id = sl.brick_type_id
      LEFT JOIN core.brick_grades bg ON bg.id = sl.brick_grade_id
      LEFT JOIN inventory.finished_lots fl ON fl.id = sl.finished_lot_id
      WHERE sl.business_unit_id = $1
    `;
    const params: any[] = [user.business_unit_id];

    if (start_date) {
      params.push(start_date);
      sql += ` AND sl.transaction_date >= $${params.length}`;
    }
    if (end_date) {
      params.push(end_date);
      sql += ` AND sl.transaction_date <= $${params.length}`;
    }
    if (brick_type_id) {
      params.push(brick_type_id);
      sql += ` AND sl.brick_type_id = $${params.length}`;
    }
    if (brick_grade_id) {
      params.push(brick_grade_id);
      sql += ` AND sl.brick_grade_id = $${params.length}`;
    }

    sql += ' ORDER BY sl.transaction_date DESC, sl.created_at DESC';
    const { rows } = await query(sql, params);
    return { data: rows };
  });

  // 3. Weekly Worker Payment Report
  fastify.get('/reports/weekly-payments', { preHandler: [fastify.authenticate] }, async (req: FastifyRequest) => {
    const user = (req as any).user;
    const { worker_id, start_date, end_date } = req.query as any;

    let sql = `
      SELECT s.*, w.full_name as worker_name, w.code as worker_code,
             c.allocated_amount_paise, (s.gross_amount_paise - c.allocated_amount_paise) as remaining_due_paise
      FROM finance.settlements s
      JOIN workers.profiles w ON w.id = s.worker_id
      LEFT JOIN finance.charges c ON c.id = s.charge_id
      WHERE s.business_unit_id = $1
    `;
    const params: any[] = [user.business_unit_id];

    if (worker_id) {
      params.push(worker_id);
      sql += ` AND s.worker_id = $${params.length}`;
    }
    if (start_date) {
      params.push(start_date);
      sql += ` AND s.period_start_date >= $${params.length}`;
    }
    if (end_date) {
      params.push(end_date);
      sql += ` AND s.period_end_date <= $${params.length}`;
    }

    sql += ' ORDER BY s.period_start_date DESC';
    const { rows } = await query(sql, params);
    return { data: rows };
  });

  // 4. Material Purchase / Consumption / Stock Report
  fastify.get('/reports/material-consumption', { preHandler: [fastify.authenticate] }, async (req: FastifyRequest) => {
    const user = (req as any).user;
    const { material_id, batch_id, start_date, end_date } = req.query as any;

    let sql = `
      SELECT c.consumption_date, m.name as material_name, u.code as unit_code,
             c.quantity, c.cost_paise, b.batch_number, c.notes
      FROM materials.consumption c
      JOIN materials.lots ml ON ml.id = c.material_lot_id
      JOIN materials.catalogue m ON m.id = ml.material_id
      JOIN core.material_units u ON u.id = m.unit_id
      LEFT JOIN production.batches b ON b.id = c.batch_id
      WHERE c.business_unit_id = $1
    `;
    const params: any[] = [user.business_unit_id];

    if (material_id) {
      params.push(material_id);
      sql += ` AND m.id = $${params.length}`;
    }
    if (batch_id) {
      params.push(batch_id);
      sql += ` AND c.batch_id = $${params.length}`;
    }
    if (start_date) {
      params.push(start_date);
      sql += ` AND c.consumption_date >= $${params.length}`;
    }
    if (end_date) {
      params.push(end_date);
      sql += ` AND c.consumption_date <= $${params.length}`;
    }

    sql += ' ORDER BY c.consumption_date DESC';
    const { rows } = await query(sql, params);
    return { data: rows };
  });

  // 5. Sales & Party Ledgers Report
  fastify.get('/reports/party-ledgers', { preHandler: [fastify.authenticate] }, async (req: FastifyRequest) => {
    const user = (req as any).user;
    const { party_type, party_id } = req.query as any;

    if (!party_type || !party_id) {
      return { data: [] };
    }

    const { rows: charges } = await query(
      `SELECT 'CHARGE' as record_type, charge_date as entry_date, charge_type as description, amount_paise, status, reference_id
       FROM finance.charges
       WHERE business_unit_id = $1 AND party_type = $2 AND party_id = $3`,
      [user.business_unit_id, party_type, party_id]
    );

    const { rows: payments } = await query(
      `SELECT 'PAYMENT' as record_type, payment_date as entry_date, direction as description, amount_paise, 'COMPLETED' as status, id as reference_id
       FROM finance.payments
       WHERE business_unit_id = $1 AND party_type = $2 AND party_id = $3`,
      [user.business_unit_id, party_type, party_id]
    );

    const combined = [...charges, ...payments].sort((a, b) => new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime());
    return { data: combined };
  });

  // 6. Transport Cost Report
  fastify.get('/reports/transport-cost', { preHandler: [fastify.authenticate] }, async (req: FastifyRequest) => {
    const user = (req as any).user;
    const { vehicle_id, start_date, end_date } = req.query as any;

    let sql = `
      SELECT t.*, v.registration_number, v.driver_name, b.batch_number, s.sale_number
      FROM transport.trips t
      JOIN transport.vehicles v ON v.id = t.vehicle_id
      LEFT JOIN production.batches b ON b.id = t.batch_id
      LEFT JOIN sales.records s ON s.id = t.sale_id
      WHERE t.business_unit_id = $1
    `;
    const params: any[] = [user.business_unit_id];

    if (vehicle_id) {
      params.push(vehicle_id);
      sql += ` AND t.vehicle_id = $${params.length}`;
    }
    if (start_date) {
      params.push(start_date);
      sql += ` AND t.trip_date >= $${params.length}`;
    }
    if (end_date) {
      params.push(end_date);
      sql += ` AND t.trip_date <= $${params.length}`;
    }

    sql += ' ORDER BY t.trip_date DESC';
    const { rows } = await query(sql, params);
    return { data: rows };
  });

  // 7. Batch Costing & Operating Profit Report
  fastify.get('/reports/batch-costing', { preHandler: [fastify.authenticate] }, async (req: FastifyRequest) => {
    const user = (req as any).user;

    const { rows: batches } = await query(
      `SELECT b.id, b.batch_number, b.stage, b.status, b.fired_good_quantity, b.damaged_quantity,
              bt.name as brick_type_name,
              COALESCE((SELECT SUM(earned_amount_paise) FROM production.daily_moulding_logs WHERE batch_id = b.id), 0) as moulding_cost_paise,
              COALESCE((SELECT SUM(cost_paise) FROM materials.consumption WHERE batch_id = b.id), 0) as material_cost_paise,
              COALESCE((SELECT SUM(amount_paise) FROM finance.expenses WHERE batch_id = b.id), 0) as expense_cost_paise,
              COALESCE((SELECT SUM(cost_paise) FROM transport.trips WHERE batch_id = b.id), 0) as transport_cost_paise
       FROM production.batches b
       JOIN core.brick_types bt ON bt.id = b.brick_type_id
       WHERE b.business_unit_id = $1
       ORDER BY b.created_at DESC`,
      [user.business_unit_id]
    );

    const calculated = batches.map(b => {
      const moulding = BigInt(b.moulding_cost_paise);
      const material = BigInt(b.material_cost_paise);
      const expense = BigInt(b.expense_cost_paise);
      const transport = BigInt(b.transport_cost_paise);
      const totalCost = moulding + material + expense + transport;
      const goodQty = b.fired_good_quantity;
      const costPer1000 = goodQty > 0 ? (totalCost * 1000n) / BigInt(goodQty) : null;

      return {
        ...b,
        moulding_cost_paise: moulding.toString(),
        material_cost_paise: material.toString(),
        expense_cost_paise: expense.toString(),
        transport_cost_paise: transport.toString(),
        total_cost_paise: totalCost.toString(),
        cost_per_1000_paise: costPer1000 ? costPer1000.toString() : null,
      };
    });

    return { data: calculated };
  });

  // Operating Profit Overview
  fastify.get('/reports/operating-profit', { preHandler: [fastify.authenticate] }, async (req: FastifyRequest) => {
    const user = (req as any).user;
    const { start_date, end_date } = req.query as any;

    let dateFilter = '';
    const params: any[] = [user.business_unit_id];
    if (start_date && end_date) {
      params.push(start_date, end_date);
      dateFilter = ' AND sale_date >= $2 AND sale_date <= $3';
    }

    const salesRes = await query(
      `SELECT COALESCE(SUM(total_amount_paise), 0) as total_sales_revenue_paise,
              COALESCE(SUM(cost_amount_paise), 0) as total_cogs_paise
       FROM sales.records WHERE business_unit_id = $1 ${dateFilter}`,
      params
    );

    let expFilter = '';
    const expParams: any[] = [user.business_unit_id];
    if (start_date && end_date) {
      expParams.push(start_date, end_date);
      expFilter = ' AND expense_date >= $2 AND expense_date <= $3';
    }

    const expensesRes = await query(
      `SELECT COALESCE(SUM(amount_paise), 0) as total_operating_expenses_paise
       FROM finance.expenses WHERE business_unit_id = $1 ${expFilter}`,
      expParams
    );

    const revenue = BigInt(salesRes.rows[0].total_sales_revenue_paise);
    const cogs = BigInt(salesRes.rows[0].total_cogs_paise);
    const expenses = BigInt(expensesRes.rows[0].total_operating_expenses_paise);
    const grossProfit = revenue - cogs;
    const operatingProfit = grossProfit - expenses;

    return {
      data: {
        total_sales_revenue_paise: revenue.toString(),
        total_cogs_paise: cogs.toString(),
        gross_profit_paise: grossProfit.toString(),
        total_operating_expenses_paise: expenses.toString(),
        operating_profit_paise: operatingProfit.toString(),
      },
    };
  });
}
