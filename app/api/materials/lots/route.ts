import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const lots = await prisma.lots.findMany({
      where: {
        business_unit_id: user.organization_id,
        available_quantity: { gt: 0 },
      },
      include: {
        catalogue: {
          include: {
            material_units: true,
          },
        },
      },
      orderBy: { received_date: 'desc' },
    });

    const formatted = lots.map((l: any) => ({
      id: l.id,
      lot_number: l.lot_number,
      material_name: l.catalogue?.name ?? 'Material',
      material_unit: l.catalogue?.material_units?.name ?? 'Unit',
      available_quantity: Number(l.available_quantity),
      unit_cost_paise: Number(l.unit_cost_paise),
      received_date: l.received_date.toISOString().split('T')[0],
    }));

    return NextResponse.json(formatted);
  } catch (error: any) {
    console.error('[GET /api/materials/lots]', error);
    return NextResponse.json({ error: error.message ?? 'Internal server error' }, { status: 500 });
  }
}
