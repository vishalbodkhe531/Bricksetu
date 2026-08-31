'use server';

import { query } from '@/lib/db/pool';
import { requireSession } from '@/lib/auth/require-session';
import { revalidatePath } from 'next/cache';
import { createCustomerSchema, postSaleSchema } from '@/lib/validation/schemas';
import { ActionResult, formatPgError, safeParsePaise } from '@/lib/utils';
import { getSales, getCustomers } from './queries';

export async function getSalesAction(): Promise<ActionResult> {
  try {
    const data = await getSales();
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: formatPgError(err) };
  }
}

export async function getCustomersAction(): Promise<ActionResult> {
  try {
    const data = await getCustomers();
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: formatPgError(err) };
  }
}

export async function postSaleAction(formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireSession();

    const parsed = postSaleSchema.safeParse({
      customer_id: formData.get('customer_id'),
      brick_type_id: formData.get('brick_type_id'),
      brick_grade_id: formData.get('brick_grade_id'),
      sale_date: formData.get('sale_date'),
      quantity: formData.get('quantity'),
      unit_price: formData.get('unit_price'),
      vehicle_id: formData.get('vehicle_id') || undefined,
      notes: formData.get('notes'),
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Invalid sale data.' };
    }

    const {
      customer_id,
      brick_type_id,
      brick_grade_id,
      sale_date,
      quantity,
      unit_price,
      vehicle_id,
      notes,
    } = parsed.data;

    const unit_price_paise = safeParsePaise(unit_price);

    const { rows } = await query(
      'SELECT sales.post_sale($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) as sale_id',
      [
        user.business_unit_id,
        customer_id,
        brick_type_id,
        brick_grade_id,
        sale_date,
        quantity,
        unit_price_paise,
        vehicle_id || null,
        user.id,
        notes || null,
      ]
    );

    revalidatePath('/sales');
    return { success: true, data: { id: rows[0]?.sale_id } };
  } catch (err: any) {
    return { success: false, error: formatPgError(err) };
  }
}

export async function createCustomerAction(formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireSession();

    const parsed = createCustomerSchema.safeParse({
      code: formData.get('code'),
      name: formData.get('name'),
      phone: formData.get('phone'),
      address: formData.get('address'),
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Invalid customer data.' };
    }

    const { code, name, phone, address } = parsed.data;

    const { rows } = await query(
      `INSERT INTO parties.customers (business_unit_id, code, name, phone, address)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [user.business_unit_id, code, name, phone || null, address || null]
    );

    revalidatePath('/sales');
    return { success: true, data: rows[0] };
  } catch (err: any) {
    return { success: false, error: formatPgError(err) };
  }
}
