import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import {
  getWorkerById,
  updateWorker,
  deleteWorker,
} from '@/features/workers/services/workers.service';
import { workerInputSchema } from '@/features/workers/types/worker.types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const worker = await getWorkerById(id, user.organization_id);
    return NextResponse.json(worker);
  } catch (error: any) {
    console.error('[GET /api/workers/[id]]', error);
    return NextResponse.json({ error: error.message ?? 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: Params) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!['owner', 'manager'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = workerInputSchema.partial().parse(await req.json());
    const worker = await updateWorker(id, user.organization_id, body);
    return NextResponse.json(worker);
  } catch (error: any) {
    console.error('[PATCH /api/workers/[id]]', error);
    const isZodError = error?.name === 'ZodError';
    return NextResponse.json(
      { error: isZodError ? error.issues[0]?.message : (error.message ?? 'Internal server error') },
      { status: isZodError ? 400 : 500 }
    );
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!['owner', 'manager'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    await deleteWorker(id, user.organization_id);
    return new Response(null, { status: 204 });
  } catch (error: any) {
    console.error('[DELETE /api/workers/[id]]', error);
    return NextResponse.json({ error: error.message ?? 'Internal server error' }, { status: 500 });
  }
}
