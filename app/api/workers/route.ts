import { NextRequest } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { assertRole } from '@/lib/auth/guard';
import { successResponse, errorResponse } from '@/utils/api-response';
import { getWorkers, createWorker } from '@/features/workers/services/workers.service';
import { workerInputSchema } from '@/features/workers/types/worker.types';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return errorResponse('Unauthorized access', null, 401);
    }

    const workers = await getWorkers(user.organization_id);
    return successResponse(workers);
  } catch (error: any) {
    console.error('[GET /api/workers]', error);
    return errorResponse('Failed to fetch workers', error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return errorResponse('Unauthorized access', null, 401);
    }

    assertRole(user.role, ['owner', 'manager', 'admin']);

    const json = await req.json();
    const body = workerInputSchema.parse(json);
    const worker = await createWorker(user.organization_id, body);
    return successResponse(worker, 'Worker created successfully', 201);
  } catch (error: any) {
    console.error('[POST /api/workers]', error);
    return errorResponse('Failed to create worker', error);
  }
}
