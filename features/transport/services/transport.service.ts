import { prisma } from '@/lib/prisma';
import type { Vehicle, VehicleInput } from '../types/transport.types';

export class TransportService {
  /**
   * List all vehicles for an organization
   */
  static async listVehicles(orgId: string): Promise<Vehicle[]> {
    const list = await prisma.vehicles.findMany({
      where: { business_unit_id: orgId, is_active: true },
      orderBy: { registration_number: 'asc' },
    });

    return list.map((v: any) => ({
      id: v.id,
      organization_id: v.business_unit_id,
      registration_number: v.registration_number,
      driver_name: v.driver_name,
      capacity_details: v.capacity_details,
      created_at: v.created_at.toISOString(),
    }));
  }

  /**
   * Register a new vehicle
   */
  static async createVehicle(orgId: string, input: VehicleInput): Promise<Vehicle> {
    const created = await prisma.vehicles.create({
      data: {
        business_unit_id: orgId,
        registration_number: input.registration_number,
        driver_name: input.driver_name ?? null,
        capacity_details: input.capacity_details ?? null,
      },
    });

    return {
      id: created.id,
      organization_id: created.business_unit_id,
      registration_number: created.registration_number,
      driver_name: created.driver_name,
      capacity_details: created.capacity_details,
      created_at: created.created_at.toISOString(),
    };
  }
}
