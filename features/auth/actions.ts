'use server';

import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { cookies } from 'next/headers';
import { query } from '@/lib/db/pool';
import { loginSchema } from '@/lib/validation/schemas';
import { ActionResult, formatPgError } from '@/lib/utils';

export async function loginAction(formData: FormData): Promise<ActionResult> {
  try {
    const rawUsername = formData.get('username');
    const rawPassword = formData.get('password');

    const parsed = loginSchema.safeParse({
      username: rawUsername,
      password: rawPassword,
    });

    if (!parsed.success) {
      const issue = parsed.error.issues[0]?.message || 'Invalid username or password.';
      return { success: false, error: issue };
    }

    const { username, password } = parsed.data;

    const { rows } = await query(
      `SELECT u.id, u.business_unit_id, u.username, u.email, u.password_hash, u.full_name, u.role, u.is_active, bu.name as bu_name
       FROM app_auth.users u
       JOIN core.business_units bu ON bu.id = u.business_unit_id
       WHERE u.username = $1`,
      [username]
    );

    if (rows.length === 0) {
      return { success: false, error: 'Invalid username or password.' };
    }

    const user = rows[0];
    if (!user.is_active) {
      return { success: false, error: 'User account is deactivated.' };
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return { success: false, error: 'Invalid username or password.' };
    }

    const sessionToken = `sess_${crypto.randomUUID()}`;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await query(
      'INSERT INTO app_auth.sessions (id, user_id, expires_at) VALUES ($1, $2, $3)',
      [sessionToken, user.id, expiresAt]
    );

    const cookieStore = await cookies();
    cookieStore.set('bricksetu_session', sessionToken, {
      path: '/',
      httpOnly: true,
      secure: false, // dev setting
      sameSite: 'lax',
      expires: expiresAt,
    });

    return {
      success: true,
      data: {
        id: user.id,
        business_unit_id: user.business_unit_id,
        business_unit_name: user.bu_name,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
    };
  } catch (err: any) {
    console.error('[LOGIN ACTION ERROR]', err);
    return { success: false, error: formatPgError(err) };
  }
}

export async function logoutAction(): Promise<ActionResult> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('bricksetu_session')?.value;
    if (token) {
      await query('DELETE FROM app_auth.sessions WHERE id = $1', [token]);
    }
    cookieStore.delete('bricksetu_session');
    return { success: true };
  } catch (err: any) {
    console.error('[LOGOUT ACTION ERROR]', err);
    return { success: false, error: formatPgError(err) };
  }
}
