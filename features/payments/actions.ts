'use server';

import { query } from '@/lib/db/pool';
import { withTransaction } from '@/lib/db/transaction';
import { requireSession } from '@/lib/auth/require-session';
import { revalidatePath } from 'next/cache';
import { createPaymentSchema, allocatePaymentSchema } from '@/lib/validation/schemas';
import { ActionResult, formatPgError, safeParsePaise } from '@/lib/utils';
import { getPayments, getUnpaidCharges } from './queries';

export async function getPaymentsAction(): Promise<ActionResult> {
  try {
    const data = await getPayments();
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: formatPgError(err) };
  }
}

export async function getUnpaidChargesAction(partyType?: string, partyId?: string): Promise<ActionResult> {
  try {
    const data = await getUnpaidCharges(partyType, partyId);
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: formatPgError(err) };
  }
}

export async function createPaymentAction(formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireSession();

    const parsed = createPaymentSchema.safeParse({
      direction: formData.get('direction'),
      party_type: formData.get('party_type'),
      party_id: formData.get('party_id') || undefined,
      payment_date: formData.get('payment_date'),
      amount: formData.get('amount'),
      payment_method_id: formData.get('payment_method_id'),
      reference_number: formData.get('reference_number'),
      notes: formData.get('notes'),
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Invalid payment data.' };
    }

    const {
      direction,
      party_type,
      party_id,
      payment_date,
      amount,
      payment_method_id,
      reference_number,
      notes,
    } = parsed.data;

    const amount_paise = safeParsePaise(amount);

    // Atomic transaction for payment creation to prevent race condition on payment_number
    const insertedPayment = await withTransaction(async (client) => {
      const countRes = await client.query(
        'SELECT count(*) + 1 as cnt FROM finance.payments WHERE business_unit_id = $1 FOR UPDATE',
        [user.business_unit_id]
      );
      const pmtNum = 'PMT-' + payment_date.replace(/-/g, '') + '-' + String(countRes.rows[0].cnt).padStart(4, '0');

      const { rows } = await client.query(
        `INSERT INTO finance.payments (business_unit_id, payment_number, direction, party_type, party_id, payment_date, amount_paise, payment_method_id, reference_number, notes, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING *`,
        [
          user.business_unit_id,
          pmtNum,
          direction,
          party_type,
          party_id || null,
          payment_date,
          amount_paise,
          payment_method_id,
          reference_number || null,
          notes || null,
          user.id,
        ]
      );
      return rows[0];
    });

    revalidatePath('/payments');
    return { success: true, data: insertedPayment };
  } catch (err: any) {
    return { success: false, error: formatPgError(err) };
  }
}

export async function allocatePaymentAction(paymentId: string, allocations: any[]): Promise<ActionResult> {
  try {
    const user = await requireSession();

    const parsed = allocatePaymentSchema.safeParse({
      payment_id: paymentId,
      allocations,
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Invalid allocation parameters.' };
    }

    const { payment_id, allocations: validatedAllocations } = parsed.data;

    await query('SELECT finance.allocate_payment($1, $2, $3)', [
      payment_id,
      JSON.stringify(validatedAllocations),
      user.id,
    ]);

    revalidatePath('/payments');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: formatPgError(err) };
  }
}
