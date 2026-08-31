'use server';

import { query } from '@/lib/db/pool';
import { requireSession } from '@/lib/auth/require-session';
import { revalidatePath } from 'next/cache';
import { postStockAdjustmentSchema } from '@/lib/validation/schemas';
import { ActionResult, formatPgError } from '@/lib/utils';
import { getStockSummary, getStockLots, getStockLedger } from './queries';

export async function getStockSummaryAction(): Promise<ActionResult> {
  try {
    const data = await getStockSummary();
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: formatPgError(err) };
  }
}

export async function getStockLotsAction(): Promise<ActionResult> {
  try {
    const data = await getStockLots();
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: formatPgError(err) };
  }
}

export async function getStockLedgerAction(): Promise<ActionResult> {
  try {
    const data = await getStockLedger();
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: formatPgError(err) };
  }
}

export async function postStockAdjustmentAction(formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireSession();

    const parsed = postStockAdjustmentSchema.safeParse({
      finished_lot_id: formData.get('finished_lot_id'),
      adjustment_type: formData.get('adjustment_type'),
      quantity_change: formData.get('quantity_change'),
      reason: formData.get('reason'),
      adjustment_date: formData.get('adjustment_date'),
    });

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || 'Invalid adjustment data.';
      return { success: false, error: firstError };
    }

    const { finished_lot_id, adjustment_type, quantity_change, reason, adjustment_date } = parsed.data;

    const { rows } = await query(
      'SELECT inventory.post_adjustment($1, $2, $3, $4, $5, $6, $7) as adjustment_id',
      [user.business_unit_id, finished_lot_id, adjustment_type, quantity_change, reason, adjustment_date, user.id]
    );

    revalidatePath('/inventory');
    return { success: true, data: { id: rows[0]?.adjustment_id } };
  } catch (err: any) {
    return { success: false, error: formatPgError(err) };
  }
}
