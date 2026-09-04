import { prisma } from '@/lib/prisma';
import type { RawMaterial, Supplier, RawMaterialInput, SupplierInput } from '../types/materials.types';

export class MaterialsService {
  /**
   * List all raw materials for an organization
   */
  static async listMaterials(orgId: string): Promise<RawMaterial[]> {
    const items = await prisma.catalogue.findMany({
      where: { business_unit_id: orgId, is_active: true },
      include: { material_units: true },
      orderBy: { name: 'asc' },
    });

    return items.map((item: any) => ({
      id: item.id,
      organization_id: item.business_unit_id,
      name: item.name,
      unit: item.material_units?.name || item.material_units?.code || 'unit',
      reorder_level: item.reorder_level ? Number(item.reorder_level) : null,
      description: item.description,
      created_at: item.created_at.toISOString(),
      updated_at: item.created_at.toISOString(),
    }));
  }

  /**
   * Create a raw material
   */
  static async createMaterial(orgId: string, input: RawMaterialInput): Promise<RawMaterial> {
    // Find or create material unit
    const unitCode = input.unit.toUpperCase().replace(/\s+/g, '_');
    let unit = await prisma.material_units.findUnique({
      where: { code: unitCode },
    });

    if (!unit) {
      unit = await prisma.material_units.create({
        data: {
          code: unitCode,
          name: input.unit,
        },
      });
    }

    const code = `MAT-${Date.now()}`;
    const created = await prisma.catalogue.create({
      data: {
        business_unit_id: orgId,
        code,
        name: input.name,
        unit_id: unit.id,
        reorder_level: input.reorder_level ?? 0,
        description: input.description ?? null,
      },
      include: { material_units: true },
    });

    return {
      id: created.id,
      organization_id: created.business_unit_id,
      name: created.name,
      unit: created.material_units?.name || created.material_units?.code || input.unit,
      reorder_level: created.reorder_level ? Number(created.reorder_level) : null,
      description: created.description,
      created_at: created.created_at.toISOString(),
      updated_at: created.created_at.toISOString(),
    };
  }

  /**
   * List all suppliers for an organization
   */
  static async listSuppliers(orgId: string): Promise<Supplier[]> {
    const list = await prisma.suppliers.findMany({
      where: { business_unit_id: orgId, is_active: true },
      orderBy: { name: 'asc' },
    });

    return list.map((s: any) => ({
      id: s.id,
      organization_id: s.business_unit_id,
      name: s.name,
      contact_person: s.contact_person,
      phone: s.phone,
      address: s.address,
      created_at: s.created_at.toISOString(),
      updated_at: s.updated_at.toISOString(),
    }));
  }

  /**
   * Create a supplier
   */
  static async createSupplier(orgId: string, input: SupplierInput): Promise<Supplier> {
    const code = `SUP-${Date.now()}`;
    const s = await prisma.suppliers.create({
      data: {
        business_unit_id: orgId,
        code,
        name: input.name,
        contact_person: input.contact_person ?? null,
        phone: input.phone ?? null,
        address: input.address ?? null,
      },
    });

    return {
      id: s.id,
      organization_id: s.business_unit_id,
      name: s.name,
      contact_person: s.contact_person,
      phone: s.phone,
      address: s.address,
      created_at: s.created_at.toISOString(),
      updated_at: s.updated_at.toISOString(),
    };
  }
}
