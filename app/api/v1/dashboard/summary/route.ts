import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { getDashboardSummaryAction } from '@/features/dashboard/actions';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: { message: 'Unauthorized' } }, { status: 401 });
  }

  const result = await getDashboardSummaryAction();
  if (!result.success) {
    return NextResponse.json({ error: { message: result.error } }, { status: 400 });
  }

  return NextResponse.json({ data: result.data });
}
