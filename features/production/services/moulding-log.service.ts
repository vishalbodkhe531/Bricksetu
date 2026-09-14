import { prisma } from '@/lib/prisma';

export interface CreateMouldingLogInput {
  worker_id: string;
  work_date: string;
  bricks_moulded: number;
  rate_per_1000_paise: number;
  notes?: string | null;
}

export async function getBatchMouldingLogs(batchId: string, organizationId: string) {
  const batch = await prisma.batches.findFirst({
    where: { id: batchId, business_unit_id: organizationId },
  });

  if (!batch) {
    throw new Error('Batch not found');
  }

  const logs = await prisma.daily_moulding_logs.findMany({
    where: { batch_id: batchId },
    include: {
      profiles: {
        select: { id: true, full_name: true, code: true },
      },
    },
    orderBy: { work_date: 'desc' },
  });

  return logs.map((l: any) => ({
    id: l.id,
    batch_id: l.batch_id,
    worker_id: l.worker_id,
    work_date: l.work_date.toISOString().split('T')[0],
    bricks_moulded: l.bricks_moulded,
    rate_per_1000_paise: Number(l.rate_per_1000_paise),
    earned_amount_paise: Number(l.earned_amount_paise),
    settlement_id: l.settlement_id,
    notes: l.notes,
    created_at: l.created_at.toISOString(),
    worker_name: l.profiles?.full_name ?? 'Unknown Worker',
  }));
}

export async function createBatchMouldingLog(
  batchId: string,
  organizationId: string,
  createdBy: string,
  input: CreateMouldingLogInput
) {
  const batch = await prisma.batches.findFirst({
    where: { id: batchId, business_unit_id: organizationId },
  });

  if (!batch) {
    throw new Error('Batch not found');
  }

  const earnedAmountPaise = BigInt(
    Math.round((input.bricks_moulded / 1000) * input.rate_per_1000_paise)
  );

  return await prisma.$transaction(async (tx) => {
    // 1. Create daily moulding log record
    const log = await tx.daily_moulding_logs.create({
      data: {
        batch_id: batchId,
        worker_id: input.worker_id,
        work_date: new Date(input.work_date),
        bricks_moulded: input.bricks_moulded,
        rate_per_1000_paise: BigInt(input.rate_per_1000_paise),
        earned_amount_paise: earnedAmountPaise,
        notes: input.notes ?? null,
        created_by: createdBy,
      },
      include: {
        profiles: { select: { id: true, full_name: true } },
      },
    });

    // 2. Update batch moulded_quantity
    await tx.batches.update({
      where: { id: batchId },
      data: {
        moulded_quantity: {
          increment: input.bricks_moulded,
        },
      },
    });

    return {
      id: log.id,
      batch_id: log.batch_id,
      worker_id: log.worker_id,
      work_date: log.work_date.toISOString().split('T')[0],
      bricks_moulded: log.bricks_moulded,
      rate_per_1000_paise: Number(log.rate_per_1000_paise),
      earned_amount_paise: Number(log.earned_amount_paise),
      settlement_id: log.settlement_id,
      notes: log.notes,
      created_at: log.created_at.toISOString(),
      worker_name: log.profiles?.full_name ?? 'Unknown Worker',
    };
  });
}
