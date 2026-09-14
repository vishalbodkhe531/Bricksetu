import { prisma } from '@/lib/prisma';
import type { CreateFinishedGoodsInput } from '../schemas/finished-goods.schema';

export async function getBatchFinishedGoods(batchId: string, organizationId: string) {
  const batch = await prisma.batches.findFirst({
    where: { id: batchId, business_unit_id: organizationId },
  });

  if (!batch) {
    throw new Error('Batch not found');
  }

  const lots = await prisma.finished_lots.findMany({
    where: { batch_id: batchId, business_unit_id: organizationId },
    include: {
      brick_types: true,
      brick_grades: true,
    },
    orderBy: { created_at: 'desc' },
  });

  return lots.map((l: any) => ({
    id: l.id,
    batch_id: l.batch_id ?? batchId,
    brick_type_id: l.brick_type_id,
    brick_grade_id: l.brick_grade_id,
    lot_number: l.lot_number,
    initial_quantity: l.initial_quantity,
    available_quantity: l.available_quantity,
    unit_cost_paise: Number(l.unit_cost_paise),
    created_at: l.created_at.toISOString(),
    brick_type_name: l.brick_types?.name ?? '',
    brick_grade_name: l.brick_grades?.name ?? '',
  }));
}

export async function createFinishedGoods(
  batchId: string,
  organizationId: string,
  createdBy: string,
  input: CreateFinishedGoodsInput
) {
  const batch = await prisma.batches.findFirst({
    where: { id: batchId, business_unit_id: organizationId },
  });

  if (!batch) {
    throw new Error('Batch not found');
  }

  const grade = await prisma.brick_grades.findFirst({
    where: { id: input.brick_grade_id, business_unit_id: organizationId },
  });

  if (!grade) {
    throw new Error('Brick grade not found');
  }

  const gradeCode = grade.code || 'STD';
  const lotNumber = `LOT-${batch.batch_number}-${gradeCode}-${Date.now().toString().slice(-4)}`;

  return await prisma.$transaction(async (tx) => {
    // 1. Create finished_lots record
    const finishedLot = await tx.finished_lots.create({
      data: {
        business_unit_id: organizationId,
        batch_id: batchId,
        brick_type_id: batch.brick_type_id,
        brick_grade_id: input.brick_grade_id,
        lot_number: lotNumber,
        initial_quantity: input.quantity,
        available_quantity: input.quantity,
        unit_cost_paise: BigInt(input.unit_cost_paise),
      },
      include: {
        brick_types: true,
        brick_grades: true,
      },
    });

    // 2. Add entry in stock_ledger for inventory audit trail
    await tx.stock_ledger.create({
      data: {
        business_unit_id: organizationId,
        finished_lot_id: finishedLot.id,
        brick_type_id: batch.brick_type_id,
        brick_grade_id: input.brick_grade_id,
        transaction_type: 'PRODUCTION_OUTPUT',
        quantity_change: input.quantity,
        balance_after: input.quantity,
        reference_id: batchId,
        transaction_date: new Date(),
        reason: `Production output from batch ${batch.batch_number}`,
        created_by: createdBy,
      },
    });

    return {
      id: finishedLot.id,
      batch_id: finishedLot.batch_id,
      brick_type_id: finishedLot.brick_type_id,
      brick_grade_id: finishedLot.brick_grade_id,
      lot_number: finishedLot.lot_number,
      initial_quantity: finishedLot.initial_quantity,
      available_quantity: finishedLot.available_quantity,
      unit_cost_paise: Number(finishedLot.unit_cost_paise),
      created_at: finishedLot.created_at.toISOString(),
      brick_type_name: finishedLot.brick_types?.name ?? '',
      brick_grade_name: finishedLot.brick_grades?.name ?? '',
    };
  });
}
