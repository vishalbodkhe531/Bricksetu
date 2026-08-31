'use server';

import { query } from '@/lib/db/pool';
import { withTransaction } from '@/lib/db/transaction';
import { requireSession } from '@/lib/auth/require-session';
import { revalidatePath } from 'next/cache';
import {
  createWorkerSchema,
  addWorkerRateSchema,
  generateSettlementSchema,
  approveSettlementSchema,
  voidSettlementSchema,
} from '@/lib/validation/schemas';
import { ActionResult, formatPgError, safeParsePaise } from '@/lib/utils';
import { getWorkers, getWorkerDetail, getSettlements, getUnsettledWork } from './queries';

export async function getWorkersAction(): Promise<ActionResult> {
  try {
    const data = await getWorkers();
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: formatPgError(err) };
  }
}

export async function getWorkerDetailAction(id: string): Promise<ActionResult> {
  try {
    const data = await getWorkerDetail(id);
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: formatPgError(err) };
  }
}

export async function getSettlementsAction(): Promise<ActionResult> {
  try {
    const data = await getSettlements();
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: formatPgError(err) };
  }
}

export async function getUnsettledWorkAction(workerId: string, startDate: string, endDate: string): Promise<ActionResult> {
  try {
    const data = await getUnsettledWork(workerId, startDate, endDate);
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: formatPgError(err) };
  }
}

export async function createWorkerAction(formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireSession();

    const parsed = createWorkerSchema.safeParse({
      code: formData.get('code'),
      full_name: formData.get('full_name'),
      phone: formData.get('phone'),
      address: formData.get('address'),
      payment_type: formData.get('payment_type') || 'PIECE_RATE',
      joining_date: formData.get('joining_date') || new Date().toISOString().split('T')[0],
      initial_rate: formData.get('initial_rate') || 0,
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Invalid worker data.' };
    }

    const { code, full_name, phone, address, payment_type, joining_date, initial_rate } = parsed.data;
    const initial_rate_paise = safeParsePaise(initial_rate);

    const result = await withTransaction(async (client) => {
      const workerRes = await client.query(
        `INSERT INTO workers.profiles (business_unit_id, code, full_name, phone, address, payment_type, joining_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [user.business_unit_id, code, full_name, phone || null, address || null, payment_type, joining_date]
      );

      const worker = workerRes.rows[0];

      await client.query(
        `INSERT INTO workers.rate_history (worker_id, effective_date, rate_per_1000_paise, created_by)
         VALUES ($1, $2, $3, $4)`,
        [worker.id, joining_date, initial_rate_paise, user.id]
      );

      worker.current_rate_paise = initial_rate_paise;
      return worker;
    });

    revalidatePath('/workers');
    return { success: true, data: result };
  } catch (err: any) {
    return { success: false, error: formatPgError(err) };
  }
}

export async function addWorkerRateAction(workerId: string, effectiveDate: string, rateRupees: number): Promise<ActionResult> {
  try {
    const user = await requireSession();

    const parsed = addWorkerRateSchema.safeParse({
      worker_id: workerId,
      effective_date: effectiveDate,
      rate_rupees: rateRupees,
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Invalid rate parameters.' };
    }

    const { worker_id, effective_date, rate_rupees } = parsed.data;
    const ratePaise = safeParsePaise(rate_rupees);

    const { rows } = await query(
      `INSERT INTO workers.rate_history (worker_id, effective_date, rate_per_1000_paise, created_by)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (worker_id, effective_date) 
       DO UPDATE SET rate_per_1000_paise = EXCLUDED.rate_per_1000_paise
       RETURNING *`,
      [worker_id, effective_date, ratePaise, user.id]
    );

    revalidatePath('/workers');
    return { success: true, data: rows[0] };
  } catch (err: any) {
    return { success: false, error: formatPgError(err) };
  }
}

export async function generateSettlementAction(workerId: string, startDate: string, endDate: string, notes?: string): Promise<ActionResult> {
  try {
    const user = await requireSession();

    const parsed = generateSettlementSchema.safeParse({
      worker_id: workerId,
      start_date: startDate,
      end_date: endDate,
      notes: notes,
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Invalid settlement parameters.' };
    }

    const { worker_id, start_date, end_date, notes: validNotes } = parsed.data;

    const { rows } = await query(
      'SELECT finance.generate_settlement($1, $2, $3, $4, $5, $6) as settlement_id',
      [user.business_unit_id, worker_id, start_date, end_date, user.id, validNotes || null]
    );

    revalidatePath('/workers');
    return { success: true, data: { id: rows[0]?.settlement_id } };
  } catch (err: any) {
    return { success: false, error: formatPgError(err) };
  }
}

export async function approveSettlementAction(settlementId: string): Promise<ActionResult> {
  try {
    const user = await requireSession();

    const parsed = approveSettlementSchema.safeParse({ settlement_id: settlementId });
    if (!parsed.success) {
      return { success: false, error: 'Invalid Settlement ID.' };
    }

    const { rows } = await query(
      'SELECT finance.approve_settlement($1, $2) as charge_id',
      [settlementId, user.id]
    );

    revalidatePath('/workers');
    return { success: true, data: { charge_id: rows[0]?.charge_id } };
  } catch (err: any) {
    return { success: false, error: formatPgError(err) };
  }
}

export async function voidSettlementAction(settlementId: string, reason: string): Promise<ActionResult> {
  try {
    const user = await requireSession();

    const parsed = voidSettlementSchema.safeParse({ settlement_id: settlementId, reason });
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Invalid void parameters.' };
    }

    const { settlement_id, reason: validReason } = parsed.data;

    await query('SELECT finance.void_settlement($1, $2, $3)', [settlement_id, validReason, user.id]);

    revalidatePath('/workers');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: formatPgError(err) };
  }
}
