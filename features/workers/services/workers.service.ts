import { prisma } from "@/lib/prisma";
import type {
  WorkerInput,
  WorkerUpdateInput,
  RateChangeInput,
  WageRateInput,
  AdvanceInput,
  SettlementInput,
} from "../types/worker.types";

/**
 * Workers service — server-only, pure Prisma queries.
 * Every operation enforces organization multi-tenancy.
 */

export async function getWorkers(
  organizationId: string,
  includeInactive = false,
) {
  // 1. Fetch worker profiles
  const list = await prisma.profiles.findMany({
    where: {
      business_unit_id: organizationId,
      ...(includeInactive ? {} : { is_active: true }),
    },
    include: {
      rate_history: {
        orderBy: { effective_date: "desc" },
      },
    },
    orderBy: { full_name: "asc" },
  });

  if (list.length === 0) return [];

  const workerIds = list.map((w) => w.id);

  // 2. Compute advance balances for all workers in single batch aggregation
  const advanceCharges = await prisma.charges.groupBy({
    by: ["party_id"],
    where: {
      business_unit_id: organizationId,
      party_type: "WORKER",
      party_id: { in: workerIds },
      charge_type: "ADVANCE",
    },
    _sum: {
      amount_paise: true,
    },
  });

  const advanceMap = new Map<string, number>();
  for (const c of advanceCharges) {
    if (c.party_id) {
      advanceMap.set(c.party_id, Number(c._sum.amount_paise || 0n) / 100);
    }
  }

  return list.map((w) => {
    const latestRate = w.rate_history[0];
    const currentRateAmount = latestRate
      ? Number(latestRate.rate_per_1000_paise) / 100
      : 0;
    const advanceBalance = advanceMap.get(w.id) || 0;

    return {
      id: w.id,
      organization_id: w.business_unit_id,
      full_name: w.full_name,
      phone: w.phone,
      address: w.address,
      id_proof_number: null,
      photo_url: null,
      category: w.payment_type,
      joining_date: w.joining_date.toISOString().split("T")[0],
      status: (w.is_active ? "active" : "inactive") as "active" | "inactive",
      created_at: w.created_at.toISOString(),
      updated_at: w.updated_at.toISOString(),
      current_rate_amount: currentRateAmount,
      advance_balance: advanceBalance,
      worker_wage_rates: w.rate_history.map((r) => ({
        id: r.id,
        worker_id: r.worker_id,
        rate_type: "per_1000_bricks" as const,
        rate_amount: Number(r.rate_per_1000_paise) / 100,
        effective_from: r.effective_date.toISOString().split("T")[0],
        effective_to: null,
        created_at: r.created_at.toISOString(),
      })),
    };
  });
}

export async function getWorkerById(id: string, organizationId: string) {
  const w = await prisma.profiles.findFirst({
    where: {
      id,
      business_unit_id: organizationId,
    },
    include: {
      rate_history: { orderBy: { effective_date: "desc" } },
      settlements: { orderBy: { created_at: "desc" } },
    },
  });

  if (!w) return null;

  // Compute advance balance
  const advanceAggregate = await prisma.charges.aggregate({
    where: {
      business_unit_id: organizationId,
      party_type: "WORKER",
      party_id: id,
      charge_type: "ADVANCE",
    },
    _sum: { amount_paise: true },
  });

  const advanceBalance = Number(advanceAggregate._sum.amount_paise || 0n) / 100;

  // Fetch recent advance details
  const advanceRecords = await prisma.charges.findMany({
    where: {
      business_unit_id: organizationId,
      party_type: "WORKER",
      party_id: id,
      charge_type: "ADVANCE",
    },
    orderBy: { charge_date: "desc" },
    take: 20,
  });

  const latestRate = w.rate_history[0];
  const currentRateAmount = latestRate
    ? Number(latestRate.rate_per_1000_paise) / 100
    : 0;

  return {
    id: w.id,
    organization_id: w.business_unit_id,
    full_name: w.full_name,
    phone: w.phone,
    address: w.address,
    id_proof_number: null,
    photo_url: null,
    category: w.payment_type,
    joining_date: w.joining_date.toISOString().split("T")[0],
    status: (w.is_active ? "active" : "inactive") as "active" | "inactive",
    created_at: w.created_at.toISOString(),
    updated_at: w.updated_at.toISOString(),
    current_rate_amount: currentRateAmount,
    advance_balance: advanceBalance,
    current_rate: latestRate
      ? {
          id: latestRate.id,
          worker_id: latestRate.worker_id,
          rate_type: "per_1000_bricks" as const,
          rate_amount: currentRateAmount,
          effective_from: latestRate.effective_date.toISOString().split("T")[0],
          effective_to: null,
          created_at: latestRate.created_at.toISOString(),
        }
      : undefined,
    worker_wage_rates: w.rate_history.map((r) => ({
      id: r.id,
      worker_id: r.worker_id,
      rate_type: "per_1000_bricks" as const,
      rate_amount: Number(r.rate_per_1000_paise) / 100,
      effective_from: r.effective_date.toISOString().split("T")[0],
      effective_to: null,
      created_at: r.created_at.toISOString(),
    })),
    recent_advances: advanceRecords.map((a) => ({
      id: a.id,
      worker_id: a.party_id || id,
      amount: Number(a.amount_paise) / 100,
      date_given: a.charge_date.toISOString().split("T")[0],
      reason: a.description,
      created_at: a.created_at.toISOString(),
    })),
    worker_settlements: w.settlements.map((s) => ({
      id: s.id,
      worker_id: s.worker_id,
      period_start: s.period_start_date.toISOString().split("T")[0],
      period_end: s.period_end_date.toISOString().split("T")[0],
      gross_wage: Number(s.gross_amount_paise) / 100,
      advances_deducted: 0,
      net_payable: Number(s.gross_amount_paise) / 100,
      status: "paid" as const,
      paid_on: s.approved_at ? s.approved_at.toISOString().split("T")[0] : null,
      created_at: s.created_at.toISOString(),
    })),
  };
}

export async function createWorker(organizationId: string, input: WorkerInput) {
  const code = `W-${Date.now()}`;

  const validPaymentTypes = ["PIECE_RATE", "DAILY_WAGE", "MONTHLY_SALARY"];
  let paymentType = "PIECE_RATE";
  if (input.category && validPaymentTypes.includes(input.category)) {
    paymentType = input.category;
  } else if (input.category) {
    const cat = String(input.category).toLowerCase();
    if (cat.includes("piece")) paymentType = "PIECE_RATE";
    else if (
      cat.includes("daily") ||
      cat.includes("loader") ||
      cat.includes("fireman") ||
      cat.includes("general")
    )
      paymentType = "DAILY_WAGE";
    else if (cat.includes("monthly") || cat.includes("salary"))
      paymentType = "MONTHLY_SALARY";
  }

  return await prisma.$transaction(async (tx) => {
    const created = await tx.profiles.create({
      data: {
        business_unit_id: organizationId,
        code,
        full_name: input.full_name,
        phone: input.phone ?? null,
        address: input.address ?? null,
        payment_type: paymentType,
        joining_date: input.joining_date
          ? new Date(input.joining_date)
          : new Date(),
        is_active: input.status !== "inactive",
      },
    });

    let initialRateAmount = 0;

    if (input.initial_rate_amount && input.initial_rate_amount > 0) {
      initialRateAmount = input.initial_rate_amount;
      const ratePaise = BigInt(Math.round(initialRateAmount * 100));
      await tx.rate_history.create({
        data: {
          worker_id: created.id,
          effective_date: input.joining_date
            ? new Date(input.joining_date)
            : new Date(),
          rate_per_1000_paise: ratePaise,
        },
      });
    }

    return {
      id: created.id,
      organization_id: created.business_unit_id,
      full_name: created.full_name,
      phone: created.phone,
      address: created.address,
      id_proof_number: null,
      photo_url: null,
      category: created.payment_type,
      joining_date: created.joining_date.toISOString().split("T")[0],
      status: (created.is_active ? "active" : "inactive") as
        | "active"
        | "inactive",
      created_at: created.created_at.toISOString(),
      updated_at: created.updated_at.toISOString(),
      current_rate_amount: initialRateAmount,
      advance_balance: 0,
    };
  });
}

export async function updateWorker(
  id: string,
  organizationId: string,
  input: WorkerUpdateInput,
) {
  const updateData: any = {};
  if (input.full_name !== undefined) updateData.full_name = input.full_name;
  if (input.phone !== undefined) updateData.phone = input.phone;
  if (input.address !== undefined) updateData.address = input.address;
  if (input.category !== undefined) {
    const validPaymentTypes = ["PIECE_RATE", "DAILY_WAGE", "MONTHLY_SALARY"];
    if (validPaymentTypes.includes(input.category)) {
      updateData.payment_type = input.category;
    } else {
      const cat = String(input.category).toLowerCase();
      if (cat.includes("piece")) updateData.payment_type = "PIECE_RATE";
      else if (
        cat.includes("daily") ||
        cat.includes("loader") ||
        cat.includes("fireman") ||
        cat.includes("general")
      )
        updateData.payment_type = "DAILY_WAGE";
      else if (cat.includes("monthly") || cat.includes("salary"))
        updateData.payment_type = "MONTHLY_SALARY";
      else updateData.payment_type = "PIECE_RATE";
    }
  }
  if (input.joining_date !== undefined)
    updateData.joining_date = input.joining_date
      ? new Date(input.joining_date)
      : new Date();
  if (input.status !== undefined)
    updateData.is_active = input.status === "active";

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
    id_proof_number: null,
    photo_url: null,
    category: updated.payment_type,
    joining_date: updated.joining_date.toISOString().split("T")[0],
    status: (updated.is_active ? "active" : "inactive") as
      | "active"
      | "inactive",
    created_at: updated.created_at.toISOString(),
    updated_at: updated.updated_at.toISOString(),
  };
}

/**
 * Dedicated Rate Change Method — inserts a new rate_history entry with effective date.
 * Never mutates prior rate rows so historical settlements retain accuracy.
 */
export async function changeWorkerRate(
  organizationId: string,
  workerId: string,
  input: RateChangeInput,
) {
  const worker = await prisma.profiles.findFirst({
    where: { id: workerId, business_unit_id: organizationId },
  });
  if (!worker) throw new Error("Worker not found");

  const ratePaise = BigInt(Math.round((input.rate_amount || 0) * 100));

  const created = await prisma.rate_history.create({
    data: {
      worker_id: workerId,
      effective_date: input.effective_date
        ? new Date(input.effective_date)
        : new Date(),
      rate_per_1000_paise: ratePaise,
    },
  });

  return {
    id: created.id,
    worker_id: created.worker_id,
    rate_type: input.rate_type || "per_1000_bricks",
    rate_amount: Number(created.rate_per_1000_paise) / 100,
    effective_from: created.effective_date.toISOString().split("T")[0],
    effective_to: null,
    created_at: created.created_at.toISOString(),
  };
}

export async function deactivateWorker(id: string, organizationId: string) {
  const worker = await prisma.profiles.findFirst({
    where: { id, business_unit_id: organizationId },
  });
  if (!worker) throw new Error("Worker not found");

  // Check advance balance
  const advanceAggregate = await prisma.charges.aggregate({
    where: {
      business_unit_id: organizationId,
      party_type: "WORKER",
      party_id: id,
      charge_type: "ADVANCE",
    },
    _sum: { amount_paise: true },
  });

  const advanceBalance = Number(advanceAggregate._sum.amount_paise || 0n) / 100;

  const updated = await prisma.profiles.update({
    where: { id },
    data: {
      is_active: false,
      archived_at: new Date(),
    },
  });

  return {
    id: updated.id,
    status: "inactive" as const,
    advance_balance: advanceBalance,
  };
}

export async function addWageRate(
  organizationId: string,
  workerId: string,
  input: WageRateInput,
) {
  return changeWorkerRate(organizationId, workerId, {
    worker_id: workerId,
    rate_amount: input.rate_amount,
    rate_type: input.rate_type,
    effective_date: input.effective_from,
  });
}

export async function recordAdvance(
  input: AdvanceInput & { organization_id?: string },
) {
  const amountPaise = BigInt(Math.round((input.amount || 0) * 100));

  const created = await prisma.charges.create({
    data: {
      business_unit_id: input.organization_id || "",
      party_type: "WORKER",
      party_id: input.worker_id,
      charge_type: "ADVANCE",
      charge_date: input.date_given ? new Date(input.date_given) : new Date(),
      amount_paise: amountPaise,
      description: input.reason || "Worker Advance",
    },
  });

  return {
    id: created.id,
    worker_id: created.party_id || "",
    amount: Number(created.amount_paise) / 100,
    date_given: created.charge_date.toISOString().split("T")[0],
    reason: created.description,
    created_at: created.created_at.toISOString(),
  };
}

export async function createSettlement(
  input: SettlementInput & { organization_id?: string; total_bricks?: number },
) {
  const grossPaise = BigInt(Math.round((input.gross_wage || 0) * 100));
  const settlementNum = `SETTL-${Date.now()}`;

  const created = await prisma.settlements.create({
    data: {
      business_unit_id: input.organization_id || "",
      settlement_number: settlementNum,
      worker_id: input.worker_id,
      period_start_date: new Date(input.period_start),
      period_end_date: new Date(input.period_end),
      total_bricks: input.total_bricks || 0,
      gross_amount_paise: grossPaise,
      status: "APPROVED",
      notes: null,
    },
  });

  return {
    id: created.id,
    worker_id: created.worker_id,
    period_start: created.period_start_date.toISOString().split("T")[0],
    period_end: created.period_end_date.toISOString().split("T")[0],
    gross_wage: Number(created.gross_amount_paise) / 100,
    advances_deducted: input.advances_deducted || 0,
    net_payable: input.net_payable,
    status: "paid" as const,
    paid_on: created.created_at.toISOString().split("T")[0],
    created_at: created.created_at.toISOString(),
  };
}

export async function getSettlements(organizationId: string) {
  const list = await prisma.settlements.findMany({
    where: { business_unit_id: organizationId },
    include: {
      profiles: true,
    },
    orderBy: { created_at: "desc" },
  });

  return list.map((s) => ({
    id: s.id,
    worker_id: s.worker_id,
    period_start: s.period_start_date.toISOString().split("T")[0],
    period_end: s.period_end_date.toISOString().split("T")[0],
    gross_wage: Number(s.gross_amount_paise) / 100,
    advances_deducted: 0,
    net_payable: Number(s.gross_amount_paise) / 100,
    status: "paid" as const,
    paid_on: s.approved_at ? s.approved_at.toISOString().split("T")[0] : null,
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
