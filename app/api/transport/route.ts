import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { TransportService } from '@/features/transport/services/transport.service';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const vehicles = await TransportService.listVehicles(user.organization_id);
    return NextResponse.json(vehicles);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const vehicle = await TransportService.createVehicle(user.organization_id, body);
    return NextResponse.json(vehicle, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 400 });
  }
}
