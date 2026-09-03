import { NextRequest } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { successResponse, errorResponse } from '@/utils/api-response';
import { getSalesOrderById } from '@/features/sales/services/sales.service';

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
      return errorResponse('Invalid sales order ID format', null, 400);
    }

    const order = await getSalesOrderById(id, user.organization_id);
    if (!order) {
      return errorResponse('Sales order not found', null, 404);
    }

    return successResponse(order);
  } catch (error: any) {
    console.error('[GET /api/sales-orders/[id]]', error);
    return errorResponse('Failed to fetch sales order details', error);
  }
}
