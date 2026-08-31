import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db/pool';

export const runtime = 'nodejs';

export async function POST() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('bricksetu_session')?.value;

  if (sessionToken) {
    await query('DELETE FROM app_auth.sessions WHERE id = $1', [sessionToken]);
  }

  const response = NextResponse.json({ data: { success: true } });
  response.cookies.delete('bricksetu_session');
  return response;
}
