import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db/pool';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: { code: 'INVALID_INPUT', message: 'Username and password are required.' } },
        { status: 400 }
      );
    }

    const { rows } = await query(
      `SELECT u.id, u.business_unit_id, u.username, u.email, u.password_hash, u.full_name, u.role, u.is_active, bu.name as bu_name
       FROM app_auth.users u
       JOIN core.business_units bu ON bu.id = u.business_unit_id
       WHERE u.username = $1`,
      [username]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Invalid username or password.' } },
        { status: 401 }
      );
    }

    const user = rows[0];
    if (!user.is_active) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'User account is deactivated.' } },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Invalid username or password.' } },
        { status: 401 }
      );
    }

    const sessionToken = `sess_${user.id}_${Date.now()}`;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await query(
      'INSERT INTO app_auth.sessions (id, user_id, expires_at) VALUES ($1, $2, $3)',
      [sessionToken, user.id, expiresAt]
    );

    const response = NextResponse.json({
      data: {
        id: user.id,
        business_unit_id: user.business_unit_id,
        business_unit_name: user.bu_name,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
    });

    response.cookies.set('bricksetu_session', sessionToken, {
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      expires: expiresAt,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_SERVER_ERROR', message: error?.message || 'Login error' } },
      { status: 500 }
    );
  }
}
