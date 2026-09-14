import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { getBrickGrades } from '@/features/production/services/production.service';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const grades = await getBrickGrades(user.organization_id);
    return NextResponse.json(grades);
  } catch (error: any) {
    console.error('[GET /api/production/brick-grades]', error);
    return NextResponse.json({ error: error.message ?? 'Internal server error' }, { status: 500 });
  }
}
