import { prisma } from '@/lib/prisma';
import type { StageTransitionInput } from '../schemas/stage-transition.schema';
import type { BatchStage } from '../types/production.types';

export async function getStageTransitions(batchId: string, organizationId: string) {
  // Ensure batch belongs to org
  const batch = await prisma.batches.findFirst({
    where: { id: batchId, business_unit_id: organizationId },
  });

  if (!batch) {
    throw new Error('Batch not found');
  }

  const transitions = await prisma.stage_transitions.findMany({
    where: { batch_id: batchId },
    include: {
      users: {
        select: { id: true, full_name: true },
      },
    },
    orderBy: { created_at: 'asc' },
  });

  return transitions.map((t: any) => ({
    id: t.id,
    batch_id: t.batch_id,
    from_stage: t.from_stage as BatchStage,
    to_stage: t.to_stage as BatchStage,
    transition_date: t.transition_date.toISOString().split('T')[0],
    input_quantity: t.input_quantity,
    output_good_quantity: t.output_good_quantity,
    damaged_quantity: t.damaged_quantity,
    notes: t.notes,
    created_at: t.created_at.toISOString(),
    created_by: t.created_by,
    created_by_name: t.users?.full_name ?? 'System',
  }));
}

export async function createStageTransition(
  batchId: string,
  organizationId: string,
  createdBy: string,
  input: StageTransitionInput
) {
  const batch = await prisma.batches.findFirst({
    where: { id: batchId, business_unit_id: organizationId },
  });

  if (!batch) {
    throw new Error('Batch not found');
  }

  return await prisma.$transaction(async (tx) => {
    // 1. Create stage transition record
    const transition = await tx.stage_transitions.create({
      data: {
        batch_id: batchId,
        from_stage: input.from_stage,
        to_stage: input.to_stage,
        transition_date: new Date(input.transition_date),
        input_quantity: input.input_quantity,
        output_good_quantity: input.output_good_quantity,
        damaged_quantity: input.damaged_quantity,
        notes: input.notes ?? null,
        created_by: createdBy,
      },
      include: {
        users: { select: { id: true, full_name: true } },
      },
    });

    // 2. Prepare update data for batch
    const batchUpdate: any = {
      stage: input.to_stage,
      damaged_quantity: batch.damaged_quantity + input.damaged_quantity,
    };

    // Update stage-specific quantities based on destination stage
    if (input.to_stage === 'DRYING') {
      batchUpdate.moulded_quantity = Math.max(batch.moulded_quantity, input.input_quantity);
      batchUpdate.dried_quantity = input.output_good_quantity;
    } else if (input.to_stage === 'FIRING') {
      batchUpdate.dried_quantity = Math.max(batch.dried_quantity, input.input_quantity);
    } else if (input.to_stage === 'SORTING' || input.to_stage === 'COMPLETED') {
      batchUpdate.fired_good_quantity = input.output_good_quantity;
    }

    if (input.to_stage === 'COMPLETED') {
      batchUpdate.status = 'COMPLETED';
      batchUpdate.end_date = new Date(input.transition_date);
    }

    await tx.batches.update({
      where: { id: batchId },
      data: batchUpdate,
    });

    return {
      id: transition.id,
      batch_id: transition.batch_id,
      from_stage: transition.from_stage as BatchStage,
      to_stage: transition.to_stage as BatchStage,
      transition_date: transition.transition_date.toISOString().split('T')[0],
      input_quantity: transition.input_quantity,
      output_good_quantity: transition.output_good_quantity,
      damaged_quantity: transition.damaged_quantity,
      notes: transition.notes,
      created_at: transition.created_at.toISOString(),
      created_by: transition.created_by,
      created_by_name: transition.users?.full_name ?? 'System',
    };
  });
}
