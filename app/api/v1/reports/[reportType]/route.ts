import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { getReportDataAction } from '@/features/reports/actions';

export const runtime = 'nodejs';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ reportType: string }> }
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: { message: 'Unauthorized' } }, { status: 401 });
  }

  const { reportType } = await params;
  const searchParams = Object.fromEntries(req.nextUrl.searchParams.entries());

  const result = await getReportDataAction(reportType, searchParams);
  if (!result.success) {
    return NextResponse.json({ error: { message: result.error } }, { status: 400 });
  }

  return NextResponse.json({ data: result.data });
}
