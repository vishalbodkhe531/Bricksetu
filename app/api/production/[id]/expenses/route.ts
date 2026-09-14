import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    const list = await prisma.expenses.findMany({
      where: {
        batch_id: id,
        business_unit_id: user.organization_id,
      },
      include: {
        expense_categories: true,
        payment_methods: true,
      },
      orderBy: { expense_date: 'desc' },
    });

    const expenses = list.map((e: any) => ({
      id: e.id,
      category_name: e.expense_categories?.name ?? 'General Expense',
      expense_date: e.expense_date.toISOString().split('T')[0],
      amount_paise: Number(e.amount_paise),
      payee_name: e.payee_name,
      payment_method_name: e.payment_methods?.name ?? 'Cash',
      notes: e.notes,
      created_at: e.created_at.toISOString(),
    }));

    return NextResponse.json(expenses);
  } catch (error: any) {
    console.error('[GET /api/production/[id]/expenses]', error);
    return NextResponse.json({ error: error.message ?? 'Internal server error' }, { status: 500 });
  }
}
