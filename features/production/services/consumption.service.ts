import { prisma } from '@/lib/prisma';
import type { CreateConsumptionInput } from '../schemas/consumption.schema';

export async function getBatchConsumption(batchId: string, organizationId: string) {
  // Ensure batch exists & belongs to org
  const batch = await prisma.batches.findFirst({
    where: { id: batchId, business_unit_id: organizationId },
  });

  if (!batch) {
    throw new Error('Batch not found');
  }

  const list = await prisma.consumption.findMany({
    where: { batch_id: batchId },
    include: {
      lots: {
        include: {
          catalogue: {
            include: {
              material_units: true,
            },
          },
        },
      },
    },
    orderBy: { consumption_date: 'desc' },
  });

  return list.map((c: any) => ({
    id: c.id,
    batch_id: c.batch_id,
    material_lot_id: c.material_lot_id,
    consumption_date: c.consumption_date.toISOString().split('T')[0],
    quantity: Number(c.quantity),
    cost_paise: Number(c.cost_paise),
    notes: c.notes,
    created_at: c.created_at.toISOString(),
    material_name: c.lots?.catalogue?.name ?? 'Unknown Material',
    material_unit: c.lots?.catalogue?.material_units?.name ?? 'Unit',
    lot_number: c.lots?.lot_number ?? '',
  }));
}

export async function createBatchConsumption(
  batchId: string,
  organizationId: string,
  createdBy: string,
  input: CreateConsumptionInput
) {
  const batch = await prisma.batches.findFirst({
    where: { id: batchId, business_unit_id: organizationId },
  });

  if (!batch) {
    throw new Error('Batch not found');
  }

  let lot: any = null;

  if (input.material_lot_id) {
    lot = await prisma.lots.findFirst({
      where: { id: input.material_lot_id, business_unit_id: organizationId },
      include: {
        catalogue: {
          include: {
            material_units: true,
          },
        },
      },
    });

    if (!lot) {
      throw new Error('Material lot not found');
    }
  } else {
    let materialId = input.material_id;

    if (!materialId && input.material_name) {
      // Find or create in catalogue
      const existingMat = await prisma.catalogue.findFirst({
        where: {
          business_unit_id: organizationId,
          name: { equals: input.material_name, mode: 'insensitive' },
        },
        include: { material_units: true },
      });

      if (existingMat) {
        materialId = existingMat.id;
      } else {
        const unitName = input.material_unit || 'Unit';
        const unitCode = unitName.toUpperCase().replace(/\s+/g, '_');
        let unit = await prisma.material_units.findUnique({
          where: { code: unitCode },
        });

        if (!unit) {
          unit = await prisma.material_units.create({
            data: {
              code: unitCode,
              name: unitName,
            },
          });
        }

        const newMat = await prisma.catalogue.create({
          data: {
            business_unit_id: organizationId,
            code: `MAT-${Date.now()}`,
            name: input.material_name,
            unit_id: unit.id,
            reorder_level: 0,
          },
          include: { material_units: true },
        });
        materialId = newMat.id;
      }
    }

    if (!materialId) {
      throw new Error('Please select a material or lot');
    }

    // Find active lot or create default lot
    lot = await prisma.lots.findFirst({
      where: {
        material_id: materialId,
        business_unit_id: organizationId,
      },
      include: {
        catalogue: {
          include: {
            material_units: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    if (!lot) {
      const material = await prisma.catalogue.findFirst({
        where: { id: materialId, business_unit_id: organizationId },
        include: { material_units: true },
      });

      if (!material) {
        throw new Error('Material not found');
      }

      const defaultRatePaise = input.unit_cost_rupees ? Math.round(input.unit_cost_rupees * 100) : 0;

      lot = await prisma.lots.create({
        data: {
          business_unit_id: organizationId,
          material_id: material.id,
          lot_number: `LOT-${Date.now().toString().slice(-6)}`,
          initial_quantity: 1000000,
          available_quantity: 1000000,
          unit_cost_paise: BigInt(defaultRatePaise),
          received_date: new Date(),
        },
        include: {
          catalogue: {
            include: {
              material_units: true,
            },
          },
        },
      });
    }
  }

  const availableQty = Number(lot.available_quantity);
  const unitCostPaise = input.unit_cost_rupees !== undefined && input.unit_cost_rupees !== null
    ? Math.round(input.unit_cost_rupees * 100)
    : Number(lot.unit_cost_paise);

  const costPaise = BigInt(Math.round(input.quantity * unitCostPaise));

  return await prisma.$transaction(async (tx) => {
    // 1. Create consumption record
    const consumption = await tx.consumption.create({
      data: {
        business_unit_id: organizationId,
        batch_id: batchId,
        material_lot_id: lot.id,
        consumption_date: new Date(input.consumption_date),
        quantity: input.quantity,
        cost_paise: costPaise,
        notes: input.notes ?? null,
        created_by: createdBy,
      },
    });

    // 2. Deduct from lot available_quantity
    if (availableQty >= input.quantity) {
      const newAvailable = availableQty - input.quantity;
      await tx.lots.update({
        where: { id: lot.id },
        data: { available_quantity: newAvailable },
      });
    }

    return {
      id: consumption.id,
      batch_id: consumption.batch_id,
      material_lot_id: consumption.material_lot_id,
      consumption_date: consumption.consumption_date.toISOString().split('T')[0],
      quantity: Number(consumption.quantity),
      cost_paise: Number(consumption.cost_paise),
      notes: consumption.notes,
      created_at: consumption.created_at.toISOString(),
      material_name: lot.catalogue?.name ?? input.material_name ?? 'Unknown Material',
      material_unit: lot.catalogue?.material_units?.name ?? input.material_unit ?? 'Unit',
      lot_number: lot.lot_number,
    };
  });
}
