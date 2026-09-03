import { NextRequest } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { assertRole } from '@/lib/auth/guard';
import { successResponse, errorResponse } from '@/utils/api-response';
import {
  getWorkerById,
  updateWorker,
  deactivateWorker,
} from '@/features/workers/services/workers.service';
import { workerUpdateSchema } from '@/features/workers/types/worker.types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return errorResponse('Unauthorized access', null, 401);
    }

    const { id } = await params;
    if (!id || id === 'undefined' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      return errorResponse('Invalid worker ID format', null, 400);
    }
    const worker = await getWorkerById(id, user.organization_id);
    if (!worker) {
      return errorResponse('Worker not found', null, 404);
    }

    return successResponse(worker);
  } catch (error: any) {
    console.error('[GET /api/workers/[id]]', error);
    return errorResponse('Failed to fetch worker details', error);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return errorResponse('Unauthorized access', null, 401);
    }

    assertRole(user.role, ['owner', 'manager', 'admin']);

    const { id } = await params;
    const json = await req.json();
    const body = workerUpdateSchema.parse(json);

    const worker = await updateWorker(id, user.organization_id, body);
    return successResponse(worker, 'Worker profile updated successfully');
  } catch (error: any) {
    console.error('[PATCH /api/workers/[id]]', error);
    return errorResponse('Failed to update worker profile', error);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return errorResponse('Unauthorized access', null, 401);
    }

    assertRole(user.role, ['owner', 'manager', 'admin']);

    const { id } = await params;
    const result = await deactivateWorker(id, user.organization_id);
    return successResponse(result, 'Worker deactivated successfully');
  } catch (error: any) {
    console.error('[DELETE /api/workers/[id]]', error);
    return errorResponse('Failed to deactivate worker', error);
  }
}
