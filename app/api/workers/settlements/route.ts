import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { assertRole } from '@/lib/auth/guard';
import { createSettlement, getSettlements } from '@/features/workers/services/workers.service';
import { settlementInputSchema } from '@/features/workers/types/worker.types';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const settlements = await getSettlements(user.organization_id);
    return NextResponse.json(settlements);
  } catch (error: any) {
    console.error('[GET /api/workers/settlements]', error);
    return NextResponse.json({ error: error.message ?? 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    assertRole(user.role, ['owner', 'manager', 'admin']);

    const body = settlementInputSchema.parse(await req.json());
    const settlement = await createSettlement({
      ...body,
      organization_id: user.organization_id,
    });
    return NextResponse.json(settlement, { status: 201 });
  } catch (error: any) {
    console.error('[POST /api/workers/settlements]', error);
    const isZodError = error?.name === 'ZodError';
    const isAuthError = error?.name === 'AuthorizationError';
    return NextResponse.json(
      { error: isZodError ? error.issues[0]?.message : (error.message ?? 'Internal server error') },
      { status: isZodError ? 400 : isAuthError ? 403 : 500 }
    );
  }
}
