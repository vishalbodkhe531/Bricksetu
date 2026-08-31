import { cookies } from 'next/headers';
import { query } from '../db/pool';

export interface AuthUser {
  id: string;
  business_unit_id: string;
  business_unit_name: string;
  username: string;
  email: string;
  full_name: string;
  role: string;
}

export async function getSessionUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('bricksetu_session')?.value;

    if (!sessionToken) {
      return null;
    }

    const { rows } = await query(
      `SELECT u.id, u.business_unit_id, u.username, u.email, u.full_name, u.role, u.is_active, s.expires_at, bu.name as bu_name
       FROM app_auth.sessions s
       JOIN app_auth.users u ON u.id = s.user_id
       JOIN core.business_units bu ON bu.id = u.business_unit_id
       WHERE s.id = $1 AND s.expires_at > clock_timestamp() AND u.is_active = true`,
      [sessionToken]
    );

    if (rows.length === 0) {
      return null;
    }

    const user = rows[0];
    return {
      id: user.id,
      business_unit_id: user.business_unit_id,
      business_unit_name: user.bu_name,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
    };
  } catch (error) {
    console.error('[AUTH SESSION ERROR]', error);
    return null;
  }
}
