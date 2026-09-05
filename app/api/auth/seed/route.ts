import { NextResponse } from 'next/server';
import { ensureAdminUserSeeded } from '@/lib/auth/seed-admin';

export const runtime = 'nodejs';

export async function GET() {
  await ensureAdminUserSeeded(true);
  return NextResponse.json({ ok: true, message: 'Admin seed check completed' });
}

export async function POST() {
  await ensureAdminUserSeeded(true);
  return NextResponse.json({ ok: true, message: 'Admin seed check completed' });
}
