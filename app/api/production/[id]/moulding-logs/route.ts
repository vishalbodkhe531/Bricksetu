import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import {
  getBatchMouldingLogs,
  createBatchMouldingLog,
} from '@/features/production/services/moulding-log.service';
import { z } from 'zod';

export const runtime = 'nodejs';

const mouldingLogSchema = z.object({
  worker_id: z.string().min(1, 'Worker is required'),
  work_date: z.string().min(1, 'Work date is required'),
  bricks_moulded: z.coerce.number().int().positive('Bricks moulded must be > 0'),
  rate_per_1000_paise: z.coerce.number().int().min(0, 'Rate per 1000 must be >= 0'),
  notes: z.string().optional().nullable(),
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const logs = await getBatchMouldingLogs(id, user.organization_id);

    return NextResponse.json(logs);
  } catch (error: any) {
    console.error('[GET /api/production/[id]/moulding-logs]', error);
    return NextResponse.json({ error: error.message ?? 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!['owner', 'manager', 'supervisor', 'admin'].includes((user.role || '').toLowerCase())) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = mouldingLogSchema.parse(await req.json());
    const log = await createBatchMouldingLog(id, user.organization_id, user.id, body);

    return NextResponse.json(log, { status: 201 });
  } catch (error: any) {
    console.error('[POST /api/production/[id]/moulding-logs]', error);
    const isZodError = error?.name === 'ZodError';
    return NextResponse.json(
      { error: isZodError ? error.issues[0]?.message : (error.message ?? 'Internal server error') },
      { status: isZodError ? 400 : 500 }
    );
  }
}
