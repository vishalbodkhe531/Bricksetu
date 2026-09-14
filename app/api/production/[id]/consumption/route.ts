import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import {
  getBatchConsumption,
  createBatchConsumption,
} from '@/features/production/services/consumption.service';
import { createConsumptionSchema } from '@/features/production/schemas/consumption.schema';

export const runtime = 'nodejs';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const list = await getBatchConsumption(id, user.organization_id);

    return NextResponse.json(list);
  } catch (error: any) {
    console.error('[GET /api/production/[id]/consumption]', error);
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
    const body = createConsumptionSchema.parse(await req.json());
    const consumption = await createBatchConsumption(id, user.organization_id, user.id, body);

    return NextResponse.json(consumption, { status: 201 });
  } catch (error: any) {
    console.error('[POST /api/production/[id]/consumption]', error);
    const isZodError = error?.name === 'ZodError';
    return NextResponse.json(
      { error: isZodError ? error.issues[0]?.message : (error.message ?? 'Internal server error') },
      { status: isZodError ? 400 : 500 }
    );
  }
}
