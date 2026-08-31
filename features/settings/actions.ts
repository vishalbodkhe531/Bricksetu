'use server';

import bcrypt from 'bcryptjs';
import { query } from '@/lib/db/pool';
import { requireSession } from '@/lib/auth/require-session';
import { revalidatePath } from 'next/cache';
import {
  createBrickTypeSchema,
  createBrickGradeSchema,
  createExpenseCategorySchema,
  createAdminUserSchema,
  recordOpeningBalanceSchema,
} from '@/lib/validation/schemas';
import { ActionResult, formatPgError } from '@/lib/utils';
import { getMasterData } from './queries';

export async function getMasterDataAction(): Promise<ActionResult> {
  try {
    const data = await getMasterData();
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: formatPgError(err) };
  }
}

export async function createBrickTypeAction(formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireSession();

    const parsed = createBrickTypeSchema.safeParse({
      code: formData.get('code'),
      name: formData.get('name'),
      dimensions: formData.get('dimensions'),
      description: formData.get('description'),
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Invalid brick type data.' };
    }

    const { code, name, dimensions, description } = parsed.data;

    const { rows } = await query(
      `INSERT INTO core.brick_types (business_unit_id, code, name, dimensions, description)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [user.business_unit_id, code, name, dimensions || null, description || null]
    );

    revalidatePath('/settings');
    return { success: true, data: rows[0] };
  } catch (err: any) {
    return { success: false, error: formatPgError(err) };
  }
}

export async function createBrickGradeAction(formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireSession();

    const parsed = createBrickGradeSchema.safeParse({
      code: formData.get('code'),
      name: formData.get('name'),
      description: formData.get('description'),
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Invalid brick grade data.' };
    }

    const { code, name, description } = parsed.data;

    const { rows } = await query(
      `INSERT INTO core.brick_grades (business_unit_id, code, name, description)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [user.business_unit_id, code, name, description || null]
    );

    revalidatePath('/settings');
    return { success: true, data: rows[0] };
  } catch (err: any) {
    return { success: false, error: formatPgError(err) };
  }
}

export async function createExpenseCategoryAction(formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireSession();

    const parsed = createExpenseCategorySchema.safeParse({
      code: formData.get('code'),
      name: formData.get('name'),
      description: formData.get('description'),
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Invalid expense category data.' };
    }

    const { code, name, description } = parsed.data;

    const { rows } = await query(
      `INSERT INTO core.expense_categories (business_unit_id, code, name, description)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [user.business_unit_id, code, name, description || null]
    );

    revalidatePath('/settings');
    return { success: true, data: rows[0] };
  } catch (err: any) {
    return { success: false, error: formatPgError(err) };
  }
}

export async function createAdminUserAction(formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireSession();

    const parsed = createAdminUserSchema.safeParse({
      username: formData.get('username'),
      email: formData.get('email'),
      password: formData.get('password'),
      full_name: formData.get('full_name'),
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Invalid admin user data.' };
    }

    const { username, email, password, full_name } = parsed.data;

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const { rows } = await query(
      `INSERT INTO app_auth.users (business_unit_id, username, email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4, $5, 'ADMIN')
       RETURNING id, username, email, full_name, role, is_active, created_at`,
      [user.business_unit_id, username, email, hash, full_name]
    );

    revalidatePath('/settings');
    return { success: true, data: rows[0] };
  } catch (err: any) {
    return { success: false, error: formatPgError(err) };
  }
}

export async function recordOpeningBalanceAction(type: string, details: any): Promise<ActionResult> {
  try {
    const user = await requireSession();

    const parsed = recordOpeningBalanceSchema.safeParse({
      type,
      details,
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Invalid opening balance data.' };
    }

    const { type: validTypes, details: validDetails } = parsed.data;

    await query('SELECT finance.record_opening_balance($1, $2, $3, $4)', [
      user.business_unit_id,
      validTypes,
      JSON.stringify(validDetails),
      user.id,
    ]);

    revalidatePath('/settings');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: formatPgError(err) };
  }
}
