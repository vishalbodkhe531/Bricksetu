import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import {
  getPaymentById,
  updatePayment,
  deletePayment,
} from '@/features/payments/services/payments.service';
import { paymentInputSchema } from '@/features/payments/types/payment.types';

export const runtime = 'nodejs';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const payment = await getPaymentById(id, user.organization_id);
    return NextResponse.json(payment);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!['owner', 'manager', 'accountant'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = paymentInputSchema.partial().parse(await req.json());
    const payment = await updatePayment(id, user.organization_id, body);
    return NextResponse.json(payment);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    const isZodError = (error as { name?: string })?.name === 'ZodError';
    return NextResponse.json(
      { error: isZodError ? (error as { issues?: { message: string }[] })?.issues?.[0]?.message : message },
      { status: isZodError ? 400 : 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!['owner', 'manager'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    await deletePayment(id, user.organization_id);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
