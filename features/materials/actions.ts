'use server';

import { query } from '@/lib/db/pool';
import { requireSession } from '@/lib/auth/require-session';
import { revalidatePath } from 'next/cache';
import {
  createSupplierSchema,
  createMaterialSchema,
  createPurchaseSchema,
  consumeMaterialSchema,
} from '@/lib/validation/schemas';
import { ActionResult, formatPgError, safeParsePaise } from '@/lib/utils';
import { getSuppliers, getMaterials, getPurchases } from './queries';

export async function getSuppliersAction(): Promise<ActionResult> {
  try {
    const data = await getSuppliers();
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: formatPgError(err) };
  }
}

export async function getMaterialsAction(): Promise<ActionResult> {
  try {
    const data = await getMaterials();
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: formatPgError(err) };
  }
}

export async function getPurchasesAction(): Promise<ActionResult> {
  try {
    const data = await getPurchases();
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: formatPgError(err) };
  }
}

export async function createSupplierAction(formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireSession();

    const parsed = createSupplierSchema.safeParse({
      code: formData.get('code'),
      name: formData.get('name'),
      contact_person: formData.get('contact_person'),
      phone: formData.get('phone'),
      address: formData.get('address'),
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Invalid supplier data.' };
    }

    const { code, name, contact_person, phone, address } = parsed.data;

    const { rows } = await query(
      `INSERT INTO parties.suppliers (business_unit_id, code, name, contact_person, phone, address)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [user.business_unit_id, code, name, contact_person || null, phone || null, address || null]
    );

    revalidatePath('/materials');
    return { success: true, data: rows[0] };
  } catch (err: any) {
    return { success: false, error: formatPgError(err) };
  }
}

export async function createMaterialAction(formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireSession();

    const parsed = createMaterialSchema.safeParse({
      code: formData.get('code'),
      name: formData.get('name'),
      unit_id: formData.get('unit_id'),
      reorder_level: formData.get('reorder_level'),
      description: formData.get('description'),
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Invalid material data.' };
    }

    const { code, name, unit_id, reorder_level, description } = parsed.data;

    const { rows } = await query(
      `INSERT INTO materials.catalogue (business_unit_id, code, name, unit_id, reorder_level, description)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [user.business_unit_id, code, name, unit_id, reorder_level, description || null]
    );

    revalidatePath('/materials');
    return { success: true, data: rows[0] };
  } catch (err: any) {
    return { success: false, error: formatPgError(err) };
  }
}

export async function createPurchaseAction(formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireSession();

    const parsed = createPurchaseSchema.safeParse({
      supplier_id: formData.get('supplier_id'),
      material_id: formData.get('material_id'),
      purchase_date: formData.get('purchase_date'),
      quantity: formData.get('quantity'),
      unit_price: formData.get('unit_price'),
      notes: formData.get('notes'),
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Invalid purchase data.' };
    }

    const { supplier_id, material_id, purchase_date, quantity, unit_price, notes } = parsed.data;
    const unit_price_paise = safeParsePaise(unit_price);

    const { rows } = await query(
      'SELECT materials.post_purchase($1, $2, $3, $4, $5, $6, $7, $8) as purchase_id',
      [user.business_unit_id, supplier_id, material_id, purchase_date, quantity, unit_price_paise, user.id, notes || null]
    );

    revalidatePath('/materials');
    return { success: true, data: { id: rows[0]?.purchase_id } };
  } catch (err: any) {
    return { success: false, error: formatPgError(err) };
  }
}

export async function consumeMaterialAction(formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireSession();

    const parsed = consumeMaterialSchema.safeParse({
      batch_id: formData.get('batch_id') || undefined,
      material_id: formData.get('material_id'),
      consumption_date: formData.get('consumption_date'),
      quantity: formData.get('quantity'),
      notes: formData.get('notes'),
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Invalid consumption data.' };
    }

    const { batch_id, material_id, consumption_date, quantity, notes } = parsed.data;

    await query(
      'SELECT materials.consume_fifo($1, $2, $3, $4, $5, $6, $7)',
      [user.business_unit_id, batch_id || null, material_id, consumption_date, quantity, user.id, notes || null]
    );

    revalidatePath('/materials');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: formatPgError(err) };
  }
}
