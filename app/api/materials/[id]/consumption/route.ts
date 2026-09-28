import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { MaterialsService } from '@/features/materials/services/materials.service';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const consumption = await MaterialsService.getMaterialConsumption(user.organization_id, id);
    return NextResponse.json(consumption);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
