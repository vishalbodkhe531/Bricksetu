import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import {
  getBatchFinishedGoods,
  createFinishedGoods,
} from '@/features/production/services/finished-goods.service';
import { createFinishedGoodsSchema } from '@/features/production/schemas/finished-goods.schema';

export const runtime = 'nodejs';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const goods = await getBatchFinishedGoods(id, user.organization_id);

    return NextResponse.json(goods);
  } catch (error: any) {
    console.error('[GET /api/production/[id]/finished-goods]', error);
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
    if (!['owner', 'manager', 'admin'].includes((user.role || '').toLowerCase())) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = createFinishedGoodsSchema.parse(await req.json());
    const item = await createFinishedGoods(id, user.organization_id, user.id, body);

    return NextResponse.json(item, { status: 201 });
  } catch (error: any) {
    console.error('[POST /api/production/[id]/finished-goods]', error);
    const isZodError = error?.name === 'ZodError';
    return NextResponse.json(
      { error: isZodError ? error.issues[0]?.message : (error.message ?? 'Internal server error') },
      { status: isZodError ? 400 : 500 }
    );
  }
}
