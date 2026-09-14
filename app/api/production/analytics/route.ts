import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { getProductionAnalytics } from '@/features/production/services/production-analytics.service';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const analytics = await getProductionAnalytics(user.organization_id);
    return NextResponse.json(analytics);
  } catch (error: any) {
    console.error('[GET /api/production/analytics]', error);
    return NextResponse.json({ error: error.message ?? 'Internal server error' }, { status: 500 });
  }
}
