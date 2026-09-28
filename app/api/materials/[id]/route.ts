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
    const detail = await MaterialsService.getMaterialDetail(user.organization_id, id);
    if (!detail) {
      return NextResponse.json({ error: 'Material record not found' }, { status: 404 });
    }

    return NextResponse.json(detail);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const updated = await MaterialsService.updateMaterial(user.organization_id, id, body);
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 400 });
  }
}
