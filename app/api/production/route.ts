import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import {
  getProductionBatches,
  createProductionBatch,
} from '@/features/production/services/production.service';
import { createBatchSchema } from '@/features/production/schemas/batch.schema';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const stage = searchParams.get('stage') ?? undefined;
    const status = searchParams.get('status') ?? undefined;
    const startDate = searchParams.get('startDate') ?? undefined;
    const endDate = searchParams.get('endDate') ?? undefined;

    const batches = await getProductionBatches(user.organization_id, {
      stage,
      status,
      startDate,
      endDate,
    });

    return NextResponse.json(batches);
  } catch (error: any) {
    console.error('[GET /api/production]', error);
    return NextResponse.json({ error: error.message ?? 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!['owner', 'manager', 'supervisor', 'admin'].includes((user.role || '').toLowerCase())) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = createBatchSchema.parse(await req.json());
    const batch = await createProductionBatch(user.organization_id, user.id, body);
    return NextResponse.json(batch, { status: 201 });
  } catch (error: any) {
    console.error('[POST /api/production]', error);
    const isZodError = error?.name === 'ZodError';
    return NextResponse.json(
      { error: isZodError ? error.issues[0]?.message : (error.message ?? 'Internal server error') },
      { status: isZodError ? 400 : 500 }
    );
  }
}
