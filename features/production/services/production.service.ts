import { prisma } from '@/lib/prisma';
import type { BatchStage, BatchStatus } from '../types/production.types';
import type { CreateBatchInput, UpdateBatchInput } from '../schemas/batch.schema';
import { calculateBatchKPIs } from '../utils/production-calculations';

export async function getProductionBatches(
  organizationId: string,
  filters?: {
    stage?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }
) {
  const where: any = {
    business_unit_id: organizationId,
  };

  if (filters?.stage && filters.stage !== 'ALL') {
    where.stage = filters.stage;
  }

  if (filters?.status && filters.status !== 'ALL') {
    where.status = filters.status;
  }

  if (filters?.startDate || filters?.endDate) {
    where.start_date = {};
    if (filters.startDate) where.start_date.gte = new Date(filters.startDate);
    if (filters.endDate) where.start_date.lte = new Date(filters.endDate);
  }

  const batches = await prisma.batches.findMany({
    where,
    include: {
      brick_types: true,
      users: {
        select: { id: true, full_name: true },
      },
      _count: {
        select: {
          stage_transitions: true,
          daily_moulding_logs: true,
          consumption: true,
          expenses: true,
        },
      },
    },
    orderBy: [{ created_at: 'desc' }, { start_date: 'desc' }],
  });

  return batches.map((b: any) => ({
    id: b.id,
    organization_id: b.business_unit_id,
    batch_number: b.batch_number,
    brick_type_id: b.brick_type_id,
    stage: b.stage as BatchStage,
    target_quantity: b.target_quantity,
    moulded_quantity: b.moulded_quantity,
    dried_quantity: b.dried_quantity,
    fired_good_quantity: b.fired_good_quantity,
    damaged_quantity: b.damaged_quantity,
    start_date: b.start_date.toISOString().split('T')[0],
    end_date: b.end_date ? b.end_date.toISOString().split('T')[0] : null,
    status: b.status as BatchStatus,
    notes: b.notes,
    created_at: b.created_at.toISOString(),
    created_by: b.created_by,
    created_by_name: b.users?.full_name ?? 'System',
    brick_type: b.brick_types
      ? {
          id: b.brick_types.id,
          organization_id: b.brick_types.business_unit_id,
          code: b.brick_types.code,
          name: b.brick_types.name,
          dimensions: b.brick_types.dimensions,
          description: b.brick_types.description,
          is_active: b.brick_types.is_active,
          created_at: b.brick_types.created_at.toISOString(),
        }
      : undefined,
    stage_transition_count: b._count.stage_transitions,
    moulding_log_count: b._count.daily_moulding_logs,
  }));
}

export async function getProductionBatchDetail(id: string, organizationId: string) {
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
      consumption: {
        select: { cost_paise: true },
      },
      expenses: {
        select: { amount_paise: true },
      },
      daily_moulding_logs: {
        select: { earned_amount_paise: true },
      },
    },
  });

  if (!b) return null;

  const totalMaterialCostPaise = b.consumption.reduce(
    (acc, curr) => acc + Number(curr.cost_paise || 0),
    0
  );

  const totalExpenseCostPaise = b.expenses.reduce(
    (acc, curr) => acc + Number(curr.amount_paise || 0),
    0
  );

  const totalMouldingCostPaise = b.daily_moulding_logs.reduce(
    (acc, curr) => acc + Number(curr.earned_amount_paise || 0),
    0
  );

  const kpis = calculateBatchKPIs({
    target_quantity: b.target_quantity,
    moulded_quantity: b.moulded_quantity,
    dried_quantity: b.dried_quantity,
    fired_good_quantity: b.fired_good_quantity,
    damaged_quantity: b.damaged_quantity,
    total_material_cost_paise: totalMaterialCostPaise,
    total_expense_cost_paise: totalExpenseCostPaise,
    total_moulding_labour_cost_paise: totalMouldingCostPaise,
    start_date: b.start_date.toISOString().split('T')[0],
    end_date: b.end_date ? b.end_date.toISOString().split('T')[0] : null,
  });

  return {
    batch: {
      id: b.id,
      organization_id: b.business_unit_id,
      batch_number: b.batch_number,
      brick_type_id: b.brick_type_id,
      stage: b.stage as BatchStage,
      target_quantity: b.target_quantity,
      moulded_quantity: b.moulded_quantity,
      dried_quantity: b.dried_quantity,
      fired_good_quantity: b.fired_good_quantity,
      damaged_quantity: b.damaged_quantity,
      start_date: b.start_date.toISOString().split('T')[0],
      end_date: b.end_date ? b.end_date.toISOString().split('T')[0] : null,
      status: b.status as BatchStatus,
      notes: b.notes,
      created_at: b.created_at.toISOString(),
      created_by: b.created_by,
      created_by_name: b.users?.full_name ?? 'System',
      total_consumption_cost_paise: totalMaterialCostPaise,
      total_expense_cost_paise: totalExpenseCostPaise,
      total_moulding_cost_paise: totalMouldingCostPaise,
      brick_type: b.brick_types
        ? {
            id: b.brick_types.id,
            organization_id: b.brick_types.business_unit_id,
            code: b.brick_types.code,
            name: b.brick_types.name,
            dimensions: b.brick_types.dimensions,
            description: b.brick_types.description,
            is_active: b.brick_types.is_active,
            created_at: b.brick_types.created_at.toISOString(),
          }
        : undefined,
    },
    kpis,
  };
}

export async function createProductionBatch(
  organizationId: string,
  createdBy: string,
  input: CreateBatchInput
) {
  let brickTypeId = input.brick_type_id;

  if (!brickTypeId) {
    let existingType = await prisma.brick_types.findFirst({
      where: { business_unit_id: organizationId },
    });
    if (!existingType) {
      existingType = await prisma.brick_types.create({
        data: {
          business_unit_id: organizationId,
          code: 'STD-RED',
          name: 'Standard Red Brick',
          dimensions: '9" x 4" x 3"',
          is_active: true,
        },
      });
    }
    brickTypeId = existingType.id;
  }

  // Generate friendly unique batch number format: BATCH-YYYY-XXX
  const year = new Date(input.start_date).getFullYear();
  const count = await prisma.batches.count({
    where: { business_unit_id: organizationId },
  });
  const batchNumber = `BATCH-${year}-${String(count + 1).padStart(3, '0')}`;

  let formattedNotes = input.notes ?? null;
  if (input.batch_name?.trim()) {
    formattedNotes = formattedNotes
      ? `${input.batch_name.trim()} - ${formattedNotes}`
      : input.batch_name.trim();
  }

  const created = await prisma.batches.create({
    data: {
      business_unit_id: organizationId,
      batch_number: batchNumber,
      brick_type_id: brickTypeId,
      stage: 'MOULDING',
      target_quantity: input.target_quantity,
      moulded_quantity: 0,
      dried_quantity: 0,
      fired_good_quantity: 0,
      damaged_quantity: 0,
      start_date: new Date(input.start_date),
      end_date: input.expected_end_date ? new Date(input.expected_end_date) : null,
      status: 'IN_PROGRESS',
      notes: formattedNotes,
      created_by: createdBy,
    },
    include: {
      brick_types: true,
    },
  });

  return {
    id: created.id,
    organization_id: created.business_unit_id,
    batch_number: created.batch_number,
    brick_type_id: created.brick_type_id,
    stage: created.stage as BatchStage,
    target_quantity: created.target_quantity,
    moulded_quantity: created.moulded_quantity,
    dried_quantity: created.dried_quantity,
    fired_good_quantity: created.fired_good_quantity,
    damaged_quantity: created.damaged_quantity,
    start_date: created.start_date.toISOString().split('T')[0],
    end_date: null,
    status: created.status as BatchStatus,
    notes: created.notes,
    created_at: created.created_at.toISOString(),
    created_by: created.created_by,
    brick_type: created.brick_types
      ? {
          id: created.brick_types.id,
          organization_id: created.brick_types.business_unit_id,
          code: created.brick_types.code,
          name: created.brick_types.name,
          dimensions: created.brick_types.dimensions,
          description: created.brick_types.description,
          is_active: created.brick_types.is_active,
          created_at: created.brick_types.created_at.toISOString(),
        }
      : undefined,
  };
}

export async function updateProductionBatch(
  id: string,
  organizationId: string,
  input: UpdateBatchInput
) {
  const updateData: any = {};
  if (input.target_quantity !== undefined) updateData.target_quantity = input.target_quantity;
  if (input.start_date) updateData.start_date = new Date(input.start_date);
  if (input.end_date !== undefined) {
    updateData.end_date = input.end_date ? new Date(input.end_date) : null;
  }
  if (input.status) updateData.status = input.status;
  if (input.notes !== undefined) updateData.notes = input.notes;

  const updated = await prisma.batches.update({
    where: { id, business_unit_id: organizationId },
    data: updateData,
  });

  return updated;
}

export async function getBrickTypes(organizationId: string) {
  let list = await prisma.brick_types.findMany({
    where: { business_unit_id: organizationId, is_active: true },
    orderBy: { name: 'asc' },
  });

  if (list.length === 0) {
    await prisma.brick_types.createMany({
      data: [
        {
          business_unit_id: organizationId,
          code: 'STD-RED',
          name: 'Standard Red Clay Brick (लाल वीट)',
          dimensions: '9" x 4.25" x 2.75"',
          description: 'Standard handmade/moulded red clay brick',
          is_active: true,
        },
        {
          business_unit_id: organizationId,
          code: 'FLY-ASH',
          name: 'Fly Ash Brick (फ्लाय ॲश वीट)',
          dimensions: '9" x 4" x 3"',
          description: 'Machine pressed fly ash cement brick',
          is_active: true,
        },
        {
          business_unit_id: organizationId,
          code: 'WIRE-CUT',
          name: 'Wire Cut Brick (वायर कट वीट)',
          dimensions: '9" x 4.25" x 2.75"',
          description: 'Smooth wire cut brick',
          is_active: true,
        },
      ],
    });

    list = await prisma.brick_types.findMany({
      where: { business_unit_id: organizationId, is_active: true },
      orderBy: { name: 'asc' },
    });
  }

  return list.map((b: any) => ({
    id: b.id,
    organization_id: b.business_unit_id,
    code: b.code,
    name: b.name,
    dimensions: b.dimensions,
    description: b.description,
    is_active: b.is_active,
    created_at: b.created_at.toISOString(),
  }));
}

export async function getBrickGrades(organizationId: string) {
  let list = await prisma.brick_grades.findMany({
    where: { business_unit_id: organizationId, is_active: true },
    orderBy: { code: 'asc' },
  });

  if (list.length === 0) {
    await prisma.brick_grades.createMany({
      data: [
        {
          business_unit_id: organizationId,
          code: 'GRADE-1',
          name: 'Number 1 Quality (एक नंबर वीट)',
          description: 'First quality well fired sound brick',
          is_active: true,
        },
        {
          business_unit_id: organizationId,
          code: 'GRADE-2',
          name: 'Number 2 Quality (दोन नंबर वीट)',
          description: 'Slightly under-burned or minor color difference',
          is_active: true,
        },
        {
          business_unit_id: organizationId,
          code: 'TUKDA',
          name: 'Tukda / Broken Bricks (तुकडा / रोडा)',
          description: 'Broken brick pieces used for filling/concrete',
          is_active: true,
        },
      ],
    });

    list = await prisma.brick_grades.findMany({
      where: { business_unit_id: organizationId, is_active: true },
      orderBy: { code: 'asc' },
    });
  }

  return list.map((g: any) => ({
    id: g.id,
    organization_id: g.business_unit_id,
    code: g.code,
    name: g.name,
    description: g.description,
    is_active: g.is_active,
    created_at: g.created_at.toISOString(),
  }));
}
