import { NextRequest } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { assertRole } from '@/lib/auth/guard';
import { successResponse, errorResponse } from '@/utils/api-response';
import { getProductionBatchById, updateProductionBatch } from '@/features/production/services/production.service';
import { productionBatchInputSchema } from '@/features/production/types/production.types';

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
      return errorResponse('Invalid batch ID format', null, 400);
    }

    const batch = await getProductionBatchById(id, user.organization_id);
    if (!batch) {
      return errorResponse('Production batch not found', null, 404);
    }

    return successResponse(batch);
  } catch (error: any) {
    console.error('[GET /api/production/[id]]', error);
    return errorResponse('Failed to fetch batch details', error);
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
    if (!id || id === 'undefined' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      return errorResponse('Invalid batch ID format', null, 400);
    }

    const json = await req.json();
    const body = productionBatchInputSchema.partial().parse(json);

    const updated = await updateProductionBatch(id, user.organization_id, body);
    return successResponse(updated, 'Production batch updated successfully');
  } catch (error: any) {
    console.error('[PATCH /api/production/[id]]', error);
    return errorResponse('Failed to update batch', error);
  }
}
