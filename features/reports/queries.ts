import { query } from '@/lib/db/pool';
import { requireSession } from '@/lib/auth/require-session';
import { reportFilterSchema } from '@/lib/validation/schemas';
import { safeBigInt } from '@/lib/utils';

export async function getReportData(reportType: string, searchParams?: any) {
  const user = await requireSession();

  const parsedFilter = reportFilterSchema.safeParse({
    report_type: reportType,
    start_date: searchParams?.start_date,
    end_date: searchParams?.end_date,
  });

  if (!parsedFilter.success) {
    throw new Error(parsedFilter.error.issues[0]?.message || 'Invalid report parameters.');
  }

  const { report_type: validReportType, start_date, end_date } = parsedFilter.data;
  const buId = user.business_unit_id;
  const params: any[] = [buId];

  if (validReportType === 'production-damage') {
    let sql = `
      SELECT st.transition_date, b.batch_number, bt.name as brick_type_name,
             st.from_stage, st.to_stage, st.input_quantity, st.output_good_quantity, st.damaged_quantity
      FROM production.stage_transitions st
      JOIN production.batches b ON b.id = st.batch_id
      JOIN core.brick_types bt ON bt.id = b.brick_type_id
      WHERE b.business_unit_id = $1
    `;
    if (start_date) {
      params.push(start_date);
      sql += ` AND st.transition_date >= $${params.length}`;
    }
    if (end_date) {
      params.push(end_date);
      sql += ` AND st.transition_date <= $${params.length}`;
    }
    sql += ' ORDER BY st.transition_date DESC';
    const { rows } = await query(sql, params);
    return rows.map((r) => ({
      ...r,
      input_quantity: parseInt(r.input_quantity || '0', 10),
      output_good_quantity: parseInt(r.output_good_quantity || '0', 10),
      damaged_quantity: parseInt(r.damaged_quantity || '0', 10),
    }));
  }

  if (validReportType === 'stock-movement') {
    let sql = `
      SELECT sl.transaction_date, sl.transaction_type, bt.name as brick_type_name, bg.name as brick_grade_name,
             sl.quantity_change, sl.balance_after, sl.reason, fl.lot_number
      FROM inventory.stock_ledger sl
      JOIN core.brick_types bt ON bt.id = sl.brick_type_id
      LEFT JOIN core.brick_grades bg ON bg.id = sl.brick_grade_id
      LEFT JOIN inventory.finished_lots fl ON fl.id = sl.finished_lot_id
      WHERE sl.business_unit_id = $1
    `;
    if (start_date) {
      params.push(start_date);
      sql += ` AND sl.transaction_date >= $${params.length}`;
    }
    if (end_date) {
      params.push(end_date);
      sql += ` AND sl.transaction_date <= $${params.length}`;
    }
    sql += ' ORDER BY sl.transaction_date DESC, sl.created_at DESC';
    const { rows } = await query(sql, params);
    return rows.map((r) => ({
      ...r,
      quantity_change: parseInt(r.quantity_change || '0', 10),
      balance_after: parseInt(r.balance_after || '0', 10),
    }));
  }

  if (validReportType === 'weekly-payments') {
    let sql = `
      SELECT s.*, w.full_name as worker_name, w.code as worker_code,
             c.allocated_amount_paise, (s.gross_amount_paise - c.allocated_amount_paise) as remaining_due_paise
      FROM finance.settlements s
      JOIN workers.profiles w ON w.id = s.worker_id
      LEFT JOIN finance.charges c ON c.id = s.charge_id
      WHERE s.business_unit_id = $1
    `;
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
    return rows.map((r) => ({
      ...r,
      gross_amount_paise: safeBigInt(r.gross_amount_paise).toString(),
      advance_deducted_paise: safeBigInt(r.advance_deducted_paise).toString(),
      net_payable_paise: safeBigInt(r.net_payable_paise).toString(),
      allocated_amount_paise: safeBigInt(r.allocated_amount_paise).toString(),
      remaining_due_paise: safeBigInt(r.remaining_due_paise).toString(),
    }));
  }

  if (validReportType === 'material-consumption') {
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
    return rows.map((r) => ({
      ...r,
      quantity: parseFloat(r.quantity || '0'),
      cost_paise: safeBigInt(r.cost_paise).toString(),
    }));
  }

  if (validReportType === 'batch-costing') {
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
      [buId]
    );

    return batches.map((b) => {
      const moulding = safeBigInt(b.moulding_cost_paise);
      const material = safeBigInt(b.material_cost_paise);
      const expense = safeBigInt(b.expense_cost_paise);
      const transport = safeBigInt(b.transport_cost_paise);
      const totalCost = moulding + material + expense + transport;
      const goodQty = BigInt(b.fired_good_quantity || 0);
      const costPer1000 = goodQty > 0n ? (totalCost * 1000n) / goodQty : null;

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
  }

  if (validReportType === 'operating-profit') {
    const salesRes = await query(
      `SELECT COALESCE(SUM(total_amount_paise), 0) as total_sales_revenue_paise,
              COALESCE(SUM(cost_amount_paise), 0) as total_cogs_paise
       FROM sales.records WHERE business_unit_id = $1`,
      [buId]
    );

    const expensesRes = await query(
      `SELECT COALESCE(SUM(amount_paise), 0) as total_operating_expenses_paise
       FROM finance.expenses WHERE business_unit_id = $1`,
      [buId]
    );

    const revenue = safeBigInt(salesRes.rows[0]?.total_sales_revenue_paise);
    const cogs = safeBigInt(salesRes.rows[0]?.total_cogs_paise);
    const expenses = safeBigInt(expensesRes.rows[0]?.total_operating_expenses_paise);
    const grossProfit = revenue - cogs;
    const operatingProfit = grossProfit - expenses;

    return {
      total_sales_revenue_paise: revenue.toString(),
      total_cogs_paise: cogs.toString(),
      gross_profit_paise: grossProfit.toString(),
      total_operating_expenses_paise: expenses.toString(),
      operating_profit_paise: operatingProfit.toString(),
    };
  }

  throw new Error('Unknown report type');
}
