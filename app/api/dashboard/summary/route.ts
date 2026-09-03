import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { getDashboardSummary } from '@/features/dashboard/services/dashboard.service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const summary = await getDashboardSummary(user.organization_id);
    return NextResponse.json(summary);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('[GET /api/dashboard/summary]', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
