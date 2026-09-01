import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import {
  getInventoryTransactions,
  createInventoryTransaction,
} from '@/features/inventory/services/inventory.service';
import { inventoryTransactionInputSchema } from '@/features/inventory/types/inventory.types';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const transactions = await getInventoryTransactions(user.organization_id);
    return NextResponse.json(transactions);
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = inventoryTransactionInputSchema.parse(await req.json());
    const transaction = await createInventoryTransaction(user.organization_id, user.id, body);
    return NextResponse.json(transaction, { status: 201 });
  } catch (error: any) {
    const isZodError = error?.name === 'ZodError';
    return NextResponse.json(
      { error: isZodError ? error.issues[0]?.message : (error.message ?? 'Internal server error') },
      { status: isZodError ? 400 : 500 }
    );
  }
}
