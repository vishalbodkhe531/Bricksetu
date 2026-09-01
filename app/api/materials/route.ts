import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { MaterialsService } from '@/features/materials/services/materials.service';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const materials = await MaterialsService.listMaterials(user.organization_id);
    return NextResponse.json(materials);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const material = await MaterialsService.createMaterial(user.organization_id, body);
    return NextResponse.json(material, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 400 });
  }
}
