import { prisma } from '@/lib/prisma';
import type { ProductionBatchInput, BrickTypeInput } from '../types/production.types';

export async function getProductionBatches(organizationId: string, date?: string) {
  const where: any = {
    business_unit_id: organizationId,
  };

  if (date) {
    where.start_date = new Date(date);
  }

  const batches = await prisma.batches.findMany({
    where,
    include: {
      brick_types: true,
      users: {
        select: { id: true, full_name: true },
      },
    },
    orderBy: { start_date: 'desc' },
  });

  return batches.map((b: any) => ({
    id: b.id,
    organization_id: b.business_unit_id,
    worker_id: null,
    brick_type_id: b.brick_type_id,
    production_date: b.start_date.toISOString().split('T')[0],
    bricks_moulded: b.moulded_quantity,
    notes: b.notes,
    created_by: b.created_by,
    created_at: b.created_at.toISOString(),
    brick_type: b.brick_types
      ? {
          id: b.brick_types.id,
          organization_id: b.brick_types.business_unit_id,
          name: b.brick_types.name,
          dimensions: b.brick_types.dimensions,
          created_at: b.brick_types.created_at.toISOString(),
        }
      : undefined,
    worker_name: b.users?.full_name,
  }));
}

export async function getProductionBatchById(id: string, organizationId: string) {
  const b = await prisma.batches.findFirst({
    where: {
      id,
      business_unit_id: organizationId,
    },
    include: {
      brick_types: true,
      users: {
        select: { id: true, full_name: true },
      },
    },
  });

  if (!b) return null;

  return {
    id: b.id,
    organization_id: b.business_unit_id,
    worker_id: null,
    brick_type_id: b.brick_type_id,
    production_date: b.start_date.toISOString().split('T')[0],
    bricks_moulded: b.moulded_quantity,
    notes: b.notes,
    created_by: b.created_by,
    created_at: b.created_at.toISOString(),
    brick_type: b.brick_types
      ? {
          id: b.brick_types.id,
          organization_id: b.brick_types.business_unit_id,
          name: b.brick_types.name,
          dimensions: b.brick_types.dimensions,
          created_at: b.brick_types.created_at.toISOString(),
        }
      : undefined,
    worker_name: b.users?.full_name,
  };
}

export async function createProductionBatch(
  organizationId: string,
  createdBy: string,
  input: ProductionBatchInput
) {
  const batchNumber = `BATCH-${Date.now()}`;
  const created = await prisma.batches.create({
    data: {
      business_unit_id: organizationId,
      batch_number: batchNumber,
      brick_type_id: input.brick_type_id,
      moulded_quantity: input.bricks_moulded,
      start_date: new Date(input.production_date),
      notes: input.notes ?? null,
      created_by: createdBy,
    },
  });

  return {
    id: created.id,
    organization_id: created.business_unit_id,
    worker_id: input.worker_id ?? null,
    brick_type_id: created.brick_type_id,
    production_date: created.start_date.toISOString().split('T')[0],
    bricks_moulded: created.moulded_quantity,
    notes: created.notes,
    created_by: created.created_by,
    created_at: created.created_at.toISOString(),
  };
}

export async function updateProductionBatch(
  id: string,
  organizationId: string,
  input: Partial<ProductionBatchInput>
) {
  const updateData: any = {};
  if (input.brick_type_id) updateData.brick_type_id = input.brick_type_id;
  if (input.bricks_moulded !== undefined) updateData.moulded_quantity = input.bricks_moulded;
  if (input.production_date) updateData.start_date = new Date(input.production_date);
  if (input.notes !== undefined) updateData.notes = input.notes;

  const updated = await prisma.batches.update({
    where: { id },
    data: updateData,
  });

  return {
    id: updated.id,
    organization_id: updated.business_unit_id,
    worker_id: input.worker_id ?? null,
    brick_type_id: updated.brick_type_id,
    production_date: updated.start_date.toISOString().split('T')[0],
    bricks_moulded: updated.moulded_quantity,
    notes: updated.notes,
    created_by: updated.created_by,
    created_at: updated.created_at.toISOString(),
  };
}

export async function getBrickTypes(organizationId: string) {
  const list = await prisma.brick_types.findMany({
    where: { business_unit_id: organizationId, is_active: true },
    orderBy: { name: 'asc' },
  });

  return list.map((b: any) => ({
    id: b.id,
    organization_id: b.business_unit_id,
    name: b.name,
    dimensions: b.dimensions,
    created_at: b.created_at.toISOString(),
  }));
}

export async function createBrickType(organizationId: string, input: BrickTypeInput) {
  const code = `BT-${Date.now()}`;
  const created = await prisma.brick_types.create({
    data: {
      business_unit_id: organizationId,
      code,
      name: input.name,
      dimensions: input.dimensions ?? null,
    },
  });

  return {
    id: created.id,
    organization_id: created.business_unit_id,
    name: created.name,
    dimensions: created.dimensions,
    created_at: created.created_at.toISOString(),
  };
}
