'use server';

import { query } from '@/lib/db/pool';
import { requireSession } from '@/lib/auth/require-session';
import { revalidatePath } from 'next/cache';
import {
  createBatchSchema,
  recordMouldingLogSchema,
  transitionStageSchema,
} from '@/lib/validation/schemas';
import { ActionResult, formatPgError } from '@/lib/utils';
import { getBatches, getBatchDetail } from './queries';

export async function getBatchesAction(): Promise<ActionResult> {
  try {
    const data = await getBatches();
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: formatPgError(err) };
  }
}

export async function getBatchDetailAction(id: string): Promise<ActionResult> {
  try {
    const data = await getBatchDetail(id);
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: formatPgError(err) };
  }
}

export async function createBatchAction(formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireSession();

    const parsed = createBatchSchema.safeParse({
      batch_number: formData.get('batch_number'),
      brick_type_id: formData.get('brick_type_id'),
      target_quantity: formData.get('target_quantity'),
      start_date: formData.get('start_date'),
      notes: formData.get('notes'),
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Invalid batch data.' };
    }

    const { batch_number, brick_type_id, target_quantity, start_date, notes } = parsed.data;

    const { rows } = await query(
      `INSERT INTO production.batches (business_unit_id, batch_number, brick_type_id, target_quantity, start_date, notes, created_by)
       VALUES ($1, $2, $3, COALESCE($4, 0), $5, $6, $7)
       RETURNING *`,
      [user.business_unit_id, batch_number, brick_type_id, target_quantity, start_date, notes || null, user.id]
    );

    revalidatePath('/production');
    return { success: true, data: rows[0] };
  } catch (err: any) {
    return { success: false, error: formatPgError(err) };
  }
}

export async function recordMouldingLogAction(formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireSession();

    const parsed = recordMouldingLogSchema.safeParse({
      batch_id: formData.get('batch_id'),
      worker_id: formData.get('worker_id'),
      work_date: formData.get('work_date'),
      bricks_moulded: formData.get('bricks_moulded'),
      notes: formData.get('notes'),
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Invalid moulding log parameters.' };
    }

    const { batch_id, worker_id, work_date, bricks_moulded, notes } = parsed.data;

    const { rows } = await query(
      'SELECT production.record_daily_moulding($1, $2, $3, $4, $5, $6) as log_id',
      [batch_id, worker_id, work_date, bricks_moulded, user.id, notes || null]
    );

    revalidatePath('/production');
    return { success: true, data: { id: rows[0]?.log_id } };
  } catch (err: any) {
    return { success: false, error: formatPgError(err) };
  }
}

export async function transitionStageAction(
  batchId: string,
  toStage: string,
  transitionDate: string,
  inputQty: number,
  outputGoodQty?: number,
  damagedQty?: number,
  gradeAllocations?: any,
  notes?: string
): Promise<ActionResult> {
  try {
    const user = await requireSession();

    const parsed = transitionStageSchema.safeParse({
      batch_id: batchId,
      to_stage: toStage,
      transition_date: transitionDate,
      input_quantity: inputQty,
      output_good_quantity: outputGoodQty,
      damaged_quantity: damagedQty,
      grade_allocations: gradeAllocations,
      notes: notes,
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Invalid stage transition data.' };
    }

    const {
      batch_id,
      to_stage,
      transition_date,
      input_quantity,
      output_good_quantity,
      damaged_quantity,
      grade_allocations: validatedAllocations,
      notes: validatedNotes,
    } = parsed.data;

    const { rows } = await query(
      'SELECT production.transition_stage($1, $2, $3, $4, $5, $6, $7, $8, $9) as transition_id',
      [
        batch_id,
        to_stage,
        transition_date,
        input_quantity,
        output_good_quantity || 0,
        damaged_quantity || 0,
        user.id,
        validatedAllocations ? JSON.stringify(validatedAllocations) : null,
        validatedNotes || null,
      ]
    );

    revalidatePath('/production');
    return { success: true, data: { id: rows[0]?.transition_id } };
  } catch (err: any) {
    return { success: false, error: formatPgError(err) };
  }
}
