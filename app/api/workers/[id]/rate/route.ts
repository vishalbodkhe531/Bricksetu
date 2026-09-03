import { NextRequest } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { assertRole } from '@/lib/auth/guard';
import { successResponse, errorResponse } from '@/utils/api-response';
import { changeWorkerRate } from '@/features/workers/services/workers.service';
import { rateChangeSchema } from '@/features/workers/types/worker.types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return errorResponse('Unauthorized access', null, 401);
    }

    assertRole(user.role, ['owner', 'manager', 'admin']);

    const { id } = await params;
    const json = await req.json();
    const body = rateChangeSchema.parse({ ...json, worker_id: id });

    const newRate = await changeWorkerRate(user.organization_id, id, body);
    return successResponse(newRate, 'Worker pay rate updated successfully', 201);
  } catch (error: any) {
    console.error('[POST /api/workers/[id]/rate]', error);
    return errorResponse('Failed to update worker pay rate', error);
  }
}
