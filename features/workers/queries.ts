import { query } from '@/lib/db/pool';
import { requireSession } from '@/lib/auth/require-session';
import { unsettledWorkFilterSchema, idParamSchema } from '@/lib/validation/schemas';
import { safeBigInt } from '@/lib/utils';

function formatDateString(val: any): string | null {
  if (!val) return null;
  if (val instanceof Date) {
    return val.toISOString().split('T')[0];
  }
  return String(val);
}

export async function getWorkers() {
  const user = await requireSession();
  const { rows } = await query(
    `SELECT w.*, 
            (SELECT rate_per_1000_paise 
             FROM workers.rate_history 
             WHERE worker_id = w.id 
             ORDER BY effective_date DESC LIMIT 1) as current_rate_paise,
            COALESCE((SELECT SUM(amount_paise) FROM finance.payments WHERE party_type = 'WORKER' AND party_id = w.id AND direction = 'OUTGOING'), 0) as total_advance_paise,
            COALESCE((SELECT SUM(c.amount_paise - c.allocated_amount_paise) FROM finance.charges c WHERE c.party_type = 'WORKER' AND c.party_id = w.id AND c.status IN ('UNPAID', 'PARTIALLY_PAID')), 0) as payable_balance_paise,
            COALESCE((SELECT SUM(earned_amount_paise) FROM production.daily_moulding_logs WHERE worker_id = w.id), 0) as total_earned_paise,
            COALESCE((SELECT SUM(bricks_moulded) FROM production.daily_moulding_logs WHERE worker_id = w.id), 0) as total_bricks_moulded
     FROM workers.profiles w
     WHERE w.business_unit_id = $1
     ORDER BY w.full_name ASC`,
    [user.business_unit_id]
  );
  return rows.map((r) => ({
    ...r,
    joining_date: formatDateString(r.joining_date),
    created_at: formatDateString(r.created_at),
    current_rate_paise: r.current_rate_paise ? safeBigInt(r.current_rate_paise).toString() : null,
    total_advance_paise: safeBigInt(r.total_advance_paise).toString(),
    payable_balance_paise: safeBigInt(r.payable_balance_paise).toString(),
    total_earned_paise: safeBigInt(r.total_earned_paise).toString(),
    total_bricks_moulded: parseInt(r.total_bricks_moulded || '0', 10),
  }));
}

export async function getWorkerDetail(id: string) {
  const user = await requireSession();

  idParamSchema.parse(id);

  const workerRes = await query(
    `SELECT w.*, 
            (SELECT rate_per_1000_paise 
             FROM workers.rate_history 
             WHERE worker_id = w.id 
             ORDER BY effective_date DESC LIMIT 1) as current_rate_paise,
            COALESCE((SELECT SUM(amount_paise) FROM finance.payments WHERE party_type = 'WORKER' AND party_id = w.id AND direction = 'OUTGOING'), 0) as total_advance_paise,
            COALESCE((SELECT SUM(c.amount_paise - c.allocated_amount_paise) FROM finance.charges c WHERE c.party_type = 'WORKER' AND c.party_id = w.id AND c.status IN ('UNPAID', 'PARTIALLY_PAID')), 0) as payable_balance_paise,
            COALESCE((SELECT SUM(earned_amount_paise) FROM production.daily_moulding_logs WHERE worker_id = w.id), 0) as total_earned_paise,
            COALESCE((SELECT SUM(bricks_moulded) FROM production.daily_moulding_logs WHERE worker_id = w.id), 0) as total_bricks_moulded
     FROM workers.profiles w
     WHERE w.id = $1 AND w.business_unit_id = $2`,
    [id, user.business_unit_id]
  );

  if (workerRes.rows.length === 0) {
    throw new Error('Worker not found');
  }

  const [ratesRes, logsRes, settlementsRes, paymentsRes] = await Promise.all([
    query('SELECT * FROM workers.rate_history WHERE worker_id = $1 ORDER BY effective_date DESC', [id]),
    query(
      `SELECT l.*, b.batch_number, bt.name as brick_type_name
       FROM production.daily_moulding_logs l
       JOIN production.batches b ON b.id = l.batch_id
       JOIN core.brick_types bt ON bt.id = b.brick_type_id
       WHERE l.worker_id = $1 ORDER BY l.work_date DESC LIMIT 100`,
      [id]
    ),
    query(
      `SELECT s.*, c.status as payment_status, c.allocated_amount_paise
       FROM finance.settlements s
       LEFT JOIN finance.charges c ON c.id = s.charge_id
       WHERE s.worker_id = $1 ORDER BY s.created_at DESC`,
      [id]
    ),
    query(
      `SELECT p.*, pm.name as payment_method_name
       FROM finance.payments p
       JOIN core.payment_methods pm ON pm.id = p.payment_method_id
       WHERE p.party_type = 'WORKER' AND p.party_id = $1 ORDER BY p.payment_date DESC`,
      [id]
    ),
  ]);

  const worker = workerRes.rows[0];

  return {
    ...worker,
    joining_date: formatDateString(worker.joining_date),
    created_at: formatDateString(worker.created_at),
    current_rate_paise: worker.current_rate_paise ? safeBigInt(worker.current_rate_paise).toString() : null,
    total_advance_paise: safeBigInt(worker.total_advance_paise).toString(),
    payable_balance_paise: safeBigInt(worker.payable_balance_paise).toString(),
    total_earned_paise: safeBigInt(worker.total_earned_paise).toString(),
    total_bricks_moulded: parseInt(worker.total_bricks_moulded || '0', 10),
    rate_history: ratesRes.rows.map((r) => ({
      ...r,
      effective_date: formatDateString(r.effective_date),
      created_at: formatDateString(r.created_at),
      rate_per_1000_paise: safeBigInt(r.rate_per_1000_paise).toString(),
    })),
    moulding_logs: logsRes.rows.map((r) => ({
      ...r,
      work_date: formatDateString(r.work_date),
      created_at: formatDateString(r.created_at),
      bricks_moulded: parseInt(r.bricks_moulded || '0', 10),
      earned_amount_paise: safeBigInt(r.earned_amount_paise).toString(),
    })),
    settlements: settlementsRes.rows.map((r) => ({
      ...r,
      period_start_date: formatDateString(r.period_start_date),
      period_end_date: formatDateString(r.period_end_date),
      created_at: formatDateString(r.created_at),
      total_bricks_moulded: parseInt(r.total_bricks_moulded || '0', 10),
      gross_amount_paise: safeBigInt(r.gross_amount_paise).toString(),
      advance_deducted_paise: safeBigInt(r.advance_deducted_paise).toString(),
      net_payable_paise: safeBigInt(r.net_payable_paise).toString(),
      allocated_amount_paise: safeBigInt(r.allocated_amount_paise).toString(),
    })),
    payments: paymentsRes.rows.map((r) => ({
      ...r,
      payment_date: formatDateString(r.payment_date),
      created_at: formatDateString(r.created_at),
      amount_paise: safeBigInt(r.amount_paise).toString(),
    })),
  };
}

export async function getSettlements() {
  const user = await requireSession();
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
  return rows.map((r) => ({
    ...r,
    period_start_date: formatDateString(r.period_start_date),
    period_end_date: formatDateString(r.period_end_date),
    created_at: formatDateString(r.created_at),
    total_bricks_moulded: parseInt(r.total_bricks_moulded || '0', 10),
    gross_amount_paise: safeBigInt(r.gross_amount_paise).toString(),
    advance_deducted_paise: safeBigInt(r.advance_deducted_paise).toString(),
    net_payable_paise: safeBigInt(r.net_payable_paise).toString(),
    allocated_amount_paise: safeBigInt(r.allocated_amount_paise).toString(),
  }));
}

export async function getUnsettledWork(workerId: string, startDate: string, endDate: string) {
  const user = await requireSession();

  const parsed = unsettledWorkFilterSchema.parse({
    worker_id: workerId,
    start_date: startDate,
    end_date: endDate,
  });

  const { worker_id, start_date, end_date } = parsed;

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

  const totalBricks = rows.reduce((acc, r) => acc + parseInt(r.bricks_moulded || '0', 10), 0);
  const grossAmountPaise = rows.reduce((acc, r) => acc + safeBigInt(r.earned_amount_paise), 0n);

  return {
    logs: rows.map((r) => ({
      ...r,
      bricks_moulded: parseInt(r.bricks_moulded || '0', 10),
      earned_amount_paise: safeBigInt(r.earned_amount_paise).toString(),
    })),
    total_bricks: totalBricks,
    gross_amount_paise: grossAmountPaise.toString(),
  };
}
