import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import {
  getStageTransitions,
  createStageTransition,
} from '@/features/production/services/stage-transition.service';
import { stageTransitionSchema } from '@/features/production/schemas/stage-transition.schema';

export const runtime = 'nodejs';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const transitions = await getStageTransitions(id, user.organization_id);

    return NextResponse.json(transitions);
  } catch (error: any) {
    console.error('[GET /api/production/[id]/stage-transitions]', error);
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
    const body = stageTransitionSchema.parse(await req.json());
    const transition = await createStageTransition(id, user.organization_id, user.id, body);

    return NextResponse.json(transition, { status: 201 });
  } catch (error: any) {
    console.error('[POST /api/production/[id]/stage-transitions]', error);
    const isZodError = error?.name === 'ZodError';
    return NextResponse.json(
      { error: isZodError ? error.issues[0]?.message : (error.message ?? 'Internal server error') },
      { status: isZodError ? 400 : 500 }
    );
  }
}
