import { prisma } from '@/lib/prisma';
import type { WorkerInput, WageRateInput, AdvanceInput, SettlementInput } from '../types/worker.types';

/**
 * Workers service — server-only, pure Prisma queries.
 */

export async function getWorkers(organizationId: string) {
  const list = await prisma.profiles.findMany({
    where: {
      business_unit_id: organizationId,
      is_active: true,
    },
    include: {
      rate_history: {
        orderBy: { effective_date: 'desc' },
      },
    },
    orderBy: { full_name: 'asc' },
  });

  return list.map((w) => ({
    id: w.id,
    organization_id: w.business_unit_id,
    full_name: w.full_name,
    phone: w.phone,
    address: w.address,
    category: w.payment_type,
    joining_date: w.joining_date.toISOString().split('T')[0],
    status: (w.is_active ? 'active' : 'inactive') as 'active' | 'inactive',
    created_at: w.created_at.toISOString(),
    updated_at: w.updated_at.toISOString(),
    worker_wage_rates: w.rate_history.map((r) => ({
      id: r.id,
      worker_id: r.worker_id,
      rate_type: 'per_1000_bricks' as const,
      rate_amount: Number(r.rate_per_1000_paise) / 100,
      effective_from: r.effective_date.toISOString().split('T')[0],
      effective_to: null,
      created_at: r.created_at.toISOString(),
    })),
  }));
}

export async function getWorkerById(id: string, organizationId: string) {
  const w = await prisma.profiles.findFirst({
    where: {
      id,
      business_unit_id: organizationId,
    },
    include: {
      rate_history: { orderBy: { effective_date: 'desc' } },
      settlements: { orderBy: { created_at: 'desc' } },
    },
  });

  if (!w) return null;

  return {
    id: w.id,
    organization_id: w.business_unit_id,
    full_name: w.full_name,
    phone: w.phone,
    address: w.address,
    category: w.payment_type,
    joining_date: w.joining_date.toISOString().split('T')[0],
    status: (w.is_active ? 'active' : 'inactive') as 'active' | 'inactive',
    created_at: w.created_at.toISOString(),
    updated_at: w.updated_at.toISOString(),
    worker_wage_rates: w.rate_history.map((r) => ({
      id: r.id,
      worker_id: r.worker_id,
      rate_type: 'per_1000_bricks' as const,
      rate_amount: Number(r.rate_per_1000_paise) / 100,
      effective_from: r.effective_date.toISOString().split('T')[0],
      effective_to: null,
      created_at: r.created_at.toISOString(),
    })),
    worker_settlements: w.settlements.map((s) => ({
      id: s.id,
      worker_id: s.worker_id,
      period_start: s.period_start_date.toISOString().split('T')[0],
      period_end: s.period_end_date.toISOString().split('T')[0],
      gross_wage: Number(s.gross_amount_paise) / 100,
      advances_deducted: 0,
      net_payable: Number(s.gross_amount_paise) / 100,
      status: 'paid' as const,
      paid_on: s.approved_at ? s.approved_at.toISOString().split('T')[0] : null,
      created_at: s.created_at.toISOString(),
    })),
  };
}

export async function createWorker(organizationId: string, input: WorkerInput) {
  const code = `W-${Date.now()}`;
  const created = await prisma.profiles.create({
    data: {
      business_unit_id: organizationId,
      code,
      full_name: input.full_name,
      phone: input.phone ?? null,
      address: input.address ?? null,
      payment_type: input.category || 'PIECE_RATE',
      joining_date: input.joining_date ? new Date(input.joining_date) : new Date(),
      is_active: input.status !== 'inactive',
    },
  });

  return {
    id: created.id,
    organization_id: created.business_unit_id,
    full_name: created.full_name,
    phone: created.phone,
    address: created.address,
    category: created.payment_type,
    joining_date: created.joining_date.toISOString().split('T')[0],
    status: (created.is_active ? 'active' : 'inactive') as 'active' | 'inactive',
    created_at: created.created_at.toISOString(),
    updated_at: created.updated_at.toISOString(),
  };
}

export async function updateWorker(id: string, organizationId: string, input: Partial<WorkerInput>) {
  const updateData: any = {};
  if (input.full_name) updateData.full_name = input.full_name;
  if (input.phone !== undefined) updateData.phone = input.phone;
  if (input.address !== undefined) updateData.address = input.address;
  if (input.category) updateData.payment_type = input.category;
  if (input.joining_date) updateData.joining_date = new Date(input.joining_date);
  if (input.status) updateData.is_active = input.status === 'active';

  const updated = await prisma.profiles.update({
    where: { id },
    data: updateData,
  });

  return {
    id: updated.id,
    organization_id: updated.business_unit_id,
    full_name: updated.full_name,
    phone: updated.phone,
    address: updated.address,
    category: updated.payment_type,
    joining_date: updated.joining_date.toISOString().split('T')[0],
    status: (updated.is_active ? 'active' : 'inactive') as 'active' | 'inactive',
    created_at: updated.created_at.toISOString(),
    updated_at: updated.updated_at.toISOString(),
  };
}

export async function deleteWorker(id: string, organizationId: string) {
  await prisma.profiles.update({
    where: { id },
    data: {
      is_active: false,
      archived_at: new Date(),
    },
  });
}

export async function addWageRate(organizationId: string, workerId: string, input: WageRateInput) {
  const worker = await prisma.profiles.findFirst({
    where: { id: workerId, business_unit_id: organizationId },
  });
  if (!worker) throw new Error('Worker not found');

  const ratePaise = BigInt(Math.round((input.rate_amount || 0) * 100));

  const created = await prisma.rate_history.create({
    data: {
      worker_id: workerId,
      effective_date: input.effective_from ? new Date(input.effective_from) : new Date(),
      rate_per_1000_paise: ratePaise,
    },
  });

  return {
    id: created.id,
    worker_id: created.worker_id,
    rate_type: 'per_1000_bricks' as const,
    rate_amount: Number(created.rate_per_1000_paise) / 100,
    effective_from: created.effective_date.toISOString().split('T')[0],
    effective_to: null,
    created_at: created.created_at.toISOString(),
  };
}

export async function recordAdvance(input: AdvanceInput & { organization_id?: string }) {
  const amountPaise = BigInt(Math.round((input.amount || 0) * 100));

  const created = await prisma.charges.create({
    data: {
      business_unit_id: input.organization_id || '',
      party_type: 'WORKER',
      party_id: input.worker_id,
      charge_type: 'ADVANCE',
      charge_date: input.date_given ? new Date(input.date_given) : new Date(),
      amount_paise: amountPaise,
      description: input.reason || 'Worker Advance',
    },
  });

  return {
    id: created.id,
    worker_id: created.party_id || '',
    amount: Number(created.amount_paise) / 100,
    date_given: created.charge_date.toISOString().split('T')[0],
    reason: created.description,
    created_at: created.created_at.toISOString(),
  };
}

export async function createSettlement(input: SettlementInput & { organization_id?: string; total_bricks?: number }) {
  const grossPaise = BigInt(Math.round((input.gross_wage || 0) * 100));
  const settlementNum = `SETTL-${Date.now()}`;

  const created = await prisma.settlements.create({
    data: {
      business_unit_id: input.organization_id || '',
      settlement_number: settlementNum,
      worker_id: input.worker_id,
      period_start_date: new Date(input.period_start),
      period_end_date: new Date(input.period_end),
      total_bricks: input.total_bricks || 0,
      gross_amount_paise: grossPaise,
      status: 'APPROVED',
      notes: null,
    },
  });

  return {
    id: created.id,
    worker_id: created.worker_id,
    period_start: created.period_start_date.toISOString().split('T')[0],
    period_end: created.period_end_date.toISOString().split('T')[0],
    gross_wage: Number(created.gross_amount_paise) / 100,
    advances_deducted: input.advances_deducted || 0,
    net_payable: input.net_payable,
    status: 'paid' as const,
    paid_on: created.created_at.toISOString().split('T')[0],
    created_at: created.created_at.toISOString(),
  };
}

export async function getSettlements(organizationId: string) {
  const list = await prisma.settlements.findMany({
    where: { business_unit_id: organizationId },
    include: {
      profiles: true,
    },
    orderBy: { created_at: 'desc' },
  });

  return list.map((s) => ({
    id: s.id,
    worker_id: s.worker_id,
    period_start: s.period_start_date.toISOString().split('T')[0],
    period_end: s.period_end_date.toISOString().split('T')[0],
    gross_wage: Number(s.gross_amount_paise) / 100,
    advances_deducted: 0,
    net_payable: Number(s.gross_amount_paise) / 100,
    status: 'paid' as const,
    paid_on: s.approved_at ? s.approved_at.toISOString().split('T')[0] : null,
    created_at: s.created_at.toISOString(),
    workers: s.profiles
      ? {
          id: s.profiles.id,
          full_name: s.profiles.full_name,
          category: s.profiles.payment_type,
          organization_id: s.profiles.business_unit_id,
        }
      : null,
  }));
}
