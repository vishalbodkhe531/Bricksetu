import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { getBrickTypes } from '@/features/production/services/production.service';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const types = await getBrickTypes(user.organization_id);
    return NextResponse.json(types);
  } catch (error: any) {
    console.error('[GET /api/production/brick-types]', error);
    return NextResponse.json({ error: error.message ?? 'Internal server error' }, { status: 500 });
  }
}
