import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { getCustomers, createCustomer } from '@/features/sales/services/sales.service';
import { customerInputSchema } from '@/features/sales/types/sales.types';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const customers = await getCustomers(user.organization_id);
    return NextResponse.json(customers);
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = customerInputSchema.parse(await req.json());
    const customer = await createCustomer(user.organization_id, body);
    return NextResponse.json(customer, { status: 201 });
  } catch (error: any) {
    const isZodError = error?.name === 'ZodError';
    return NextResponse.json(
      { error: isZodError ? error.issues[0]?.message : (error.message ?? 'Internal server error') },
      { status: isZodError ? 400 : 500 }
    );
  }
}
