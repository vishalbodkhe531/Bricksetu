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

  // Find material lot
  const lot = await prisma.lots.findFirst({
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

  const availableQty = Number(lot.available_quantity);
  if (input.quantity > availableQty) {
    throw new Error(`Insufficient material in lot ${lot.lot_number}. Available: ${availableQty}`);
  }

  const unitCostPaise = Number(lot.unit_cost_paise);
  const costPaise = BigInt(Math.round(input.quantity * unitCostPaise));

  return await prisma.$transaction(async (tx) => {
    // 1. Create consumption record
    const consumption = await tx.consumption.create({
      data: {
        business_unit_id: organizationId,
        batch_id: batchId,
        material_lot_id: input.material_lot_id,
        consumption_date: new Date(input.consumption_date),
        quantity: input.quantity,
        cost_paise: costPaise,
        notes: input.notes ?? null,
        created_by: createdBy,
      },
    });

    // 2. Deduct from lot available_quantity
    const newAvailable = availableQty - input.quantity;
    await tx.lots.update({
      where: { id: input.material_lot_id },
      data: { available_quantity: newAvailable },
    });

    return {
      id: consumption.id,
      batch_id: consumption.batch_id,
      material_lot_id: consumption.material_lot_id,
      consumption_date: consumption.consumption_date.toISOString().split('T')[0],
      quantity: Number(consumption.quantity),
      cost_paise: Number(consumption.cost_paise),
      notes: consumption.notes,
      created_at: consumption.created_at.toISOString(),
      material_name: lot.catalogue?.name ?? 'Unknown Material',
      material_unit: lot.catalogue?.material_units?.name ?? 'Unit',
      lot_number: lot.lot_number,
    };
  });
}
