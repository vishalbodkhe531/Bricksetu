import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { getPayments, createPayment } from '@/features/payments/services/payments.service';
import { paymentInputSchema } from '@/features/payments/types/payment.types';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payments = await getPayments(user.organization_id);
    return NextResponse.json(payments);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('[GET /api/payments]', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!['owner', 'manager', 'accountant'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = paymentInputSchema.parse(await req.json());
    const payment = await createPayment(user.organization_id, user.id, body);
    return NextResponse.json(payment, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    const isZodError = (error as { name?: string })?.name === 'ZodError';
    console.error('[POST /api/payments]', error);
    return NextResponse.json(
      { error: isZodError ? (error as { issues?: { message: string }[] })?.issues?.[0]?.message : message },
      { status: isZodError ? 400 : 500 }
    );
  }
}
