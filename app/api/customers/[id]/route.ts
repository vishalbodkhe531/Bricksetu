import { NextRequest } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { assertRole } from '@/lib/auth/guard';
import { successResponse, errorResponse } from '@/utils/api-response';
import { getCustomerById, updateCustomer } from '@/features/sales/services/sales.service';
import { customerInputSchema } from '@/features/sales/types/sales.types';

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
      return errorResponse('Invalid customer ID format', null, 400);
    }

    const customer = await getCustomerById(id, user.organization_id);
    if (!customer) {
      return errorResponse('Customer not found', null, 404);
    }

    return successResponse(customer);
  } catch (error: any) {
    console.error('[GET /api/customers/[id]]', error);
    return errorResponse('Failed to fetch customer details', error);
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
      return errorResponse('Invalid customer ID format', null, 400);
    }

    const json = await req.json();
    const body = customerInputSchema.partial().parse(json);

    const updated = await updateCustomer(id, user.organization_id, body);
    return successResponse(updated, 'Customer updated successfully');
  } catch (error: any) {
    console.error('[PATCH /api/customers/[id]]', error);
    return errorResponse('Failed to update customer', error);
  }
}
