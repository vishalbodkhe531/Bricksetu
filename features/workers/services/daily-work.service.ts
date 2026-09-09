import { prisma } from "@/lib/prisma";
import type {
  DailyWorkInput,
  BulkDailyWorkInput,
  WorkUnitConversionInput,
} from "../schemas/daily-work.schema";

export async function getActiveConversion(
  businessUnitId: string,
  category = "KACHA_MAAL",
  unitName = "PINJRI",
  workDate = new Date()
) {
  const conversion = await prisma.work_unit_conversions.findFirst({
    where: {
      business_unit_id: businessUnitId,
      category,
      unit_name: unitName,
      is_active: true,
      effective_from: { lte: workDate },
    },
    orderBy: { effective_from: "desc" },
  });

  if (conversion) {
    return {
      physical_count_per_unit: conversion.physical_count_per_unit,
      billable_count_per_unit: conversion.billable_count_per_unit,
    };
  }

  // Default Pinjri conversion ratio: 22 physical / 20 billable bricks
  return {
    physical_count_per_unit: 22,
    billable_count_per_unit: 20,
  };
}

export async function recordDailyWork(
  businessUnitId: string,
  input: DailyWorkInput,
  userId?: string
) {
  const workDate = new Date(input.work_date);

  // 1. Determine rate if not explicitly supplied
  let rate = input.rate_per_unit;
  if (rate === undefined || rate === null) {
    const rateHistory = await prisma.rate_history.findFirst({
      where: {
        worker_id: input.worker_id,
        effective_date: { lte: workDate },
      },
      orderBy: { effective_date: "desc" },
    });

    if (rateHistory) {
      rate = Number(rateHistory.rate_per_1000_paise) / 100;
    } else {
      const worker = await prisma.profiles.findUnique({
        where: { id: input.worker_id },
        include: {
          rate_history: { orderBy: { effective_date: "desc" }, take: 1 },
        },
      });
      const latestRate = worker?.rate_history[0];
      rate = latestRate ? Number(latestRate.rate_per_1000_paise) / 100 : 0;
    }
  }

  // Build list of items to create: supports explicit aalyawala_entries or single/split fallback
  const itemsToCreate: { aalyawalaId: string | null; quantity: number }[] = [];

  if (input.aalyawala_entries && input.aalyawala_entries.length > 0) {
    for (const item of input.aalyawala_entries) {
      itemsToCreate.push({
        aalyawalaId: item.aalyawala_id,
        quantity: item.input_quantity,
      });
    }
  } else {
    const aalyawalaIds: (string | null)[] =
      input.aalyawala_ids && input.aalyawala_ids.length > 0
        ? input.aalyawala_ids
        : input.aalyawala_id
        ? [input.aalyawala_id]
        : [null];
    const count = aalyawalaIds.length;
    const splitInputQty = input.input_quantity / count;
    for (const aalId of aalyawalaIds) {
      itemsToCreate.push({
        aalyawalaId: aalId,
        quantity: splitInputQty,
      });
    }
  }

  let convPhysicalPerUnit: number | null = null;
  let convBillablePerUnit: number | null = null;
  if (input.entry_mode === "PINJRI_COUNT") {
    const conv = await getActiveConversion(
      businessUnitId,
      input.category,
      "PINJRI",
      workDate
    );
    convPhysicalPerUnit = conv.physical_count_per_unit;
    convBillablePerUnit = conv.billable_count_per_unit;
  }

  const createdLogs: any[] = [];

  for (const item of itemsToCreate) {
    const itemQty = item.quantity;
    let physicalQty = itemQty;
    let billableQty = itemQty;
    let unit = "BRICKS";
    let earnedAmount = 0;

    if (input.entry_mode === "PINJRI_COUNT") {
      physicalQty = itemQty * (convPhysicalPerUnit || 22);
      billableQty = itemQty * (convBillablePerUnit || 20);
      unit = "BRICKS";
      earnedAmount = (billableQty * rate) / 1000;
    } else if (input.entry_mode === "DIRECT_COUNT") {
      physicalQty = itemQty;
      billableQty = itemQty;
      unit = "BRICKS";
      earnedAmount = (billableQty * rate) / 1000;
    } else if (input.entry_mode === "SHIFT_COUNT") {
      physicalQty = itemQty;
      billableQty = itemQty;
      unit = "SHIFTS";
      earnedAmount = itemQty * rate;
    }

    const ratePaise = BigInt(Math.round(rate * 100));
    const earnedAmountPaise = BigInt(Math.round(earnedAmount * 100));

    const log = await prisma.daily_work_logs.create({
      data: {
        business_unit_id: businessUnitId,
        worker_id: input.worker_id,
        aalyawala_id: item.aalyawalaId,
        work_date: workDate,
        category: input.category,
        entry_mode: input.entry_mode,
        input_quantity: itemQty,
        physical_quantity: physicalQty,
        billable_quantity: billableQty,
        unit,
        conversion_physical_per_unit: convPhysicalPerUnit,
        conversion_billable_per_unit: convBillablePerUnit,
        rate_paise: ratePaise,
        earned_amount_paise: earnedAmountPaise,
        batch_id: input.batch_id || null,
        reference_no: input.reference_no || null,
        notes: input.notes || null,
        created_by: userId || null,
      },
      include: {
        profiles: true,
        aalyawala: true,
        batches: true,
      },
    });

    createdLogs.push(formatDailyWorkLog(log));
  }

  return createdLogs.length === 1 ? createdLogs[0] : createdLogs;
}

export async function recordBulkDailyWork(
  businessUnitId: string,
  bulkInput: BulkDailyWorkInput,
  userId?: string
) {
  const workDate = new Date(bulkInput.work_date);

  // Fetch active Pinjri conversion once for the date if needed
  const conv = await getActiveConversion(
    businessUnitId,
    bulkInput.category,
    "PINJRI",
    workDate
  );

  return await prisma.$transaction(async (tx) => {
    const results: any[] = [];
    for (const entry of bulkInput.entries) {
      let rate = entry.rate_per_unit;
      if (rate === undefined || rate === null) {
        const rateHistory = await tx.rate_history.findFirst({
          where: {
            worker_id: entry.worker_id,
            effective_date: { lte: workDate },
          },
          orderBy: { effective_date: "desc" },
        });

        if (rateHistory) {
          rate = Number(rateHistory.rate_per_1000_paise) / 100;
        } else {
          const worker = await tx.profiles.findUnique({
            where: { id: entry.worker_id },
            include: {
              rate_history: { orderBy: { effective_date: "desc" }, take: 1 },
            },
          });
          const latestRate = worker?.rate_history[0];
          rate = latestRate ? Number(latestRate.rate_per_1000_paise) / 100 : 0;
        }
      }

      const aalyawalaIds: (string | null)[] =
        entry.aalyawala_ids && entry.aalyawala_ids.length > 0
          ? entry.aalyawala_ids
          : entry.aalyawala_id
          ? [entry.aalyawala_id]
          : [null];

      const count = aalyawalaIds.length;
      const splitInputQty = entry.input_quantity / count;

      for (const aalyawalaId of aalyawalaIds) {
        let physicalQty = splitInputQty;
        let billableQty = splitInputQty;
        let unit = "BRICKS";
        let convPhysicalPerUnit: number | null = null;
        let convBillablePerUnit: number | null = null;
        let earnedAmount = 0;

        if (entry.entry_mode === "PINJRI_COUNT") {
          convPhysicalPerUnit = conv.physical_count_per_unit;
          convBillablePerUnit = conv.billable_count_per_unit;
          physicalQty = splitInputQty * convPhysicalPerUnit;
          billableQty = splitInputQty * convBillablePerUnit;
          unit = "BRICKS";
          earnedAmount = (billableQty * rate) / 1000;
        } else if (entry.entry_mode === "DIRECT_COUNT") {
          physicalQty = splitInputQty;
          billableQty = splitInputQty;
          unit = "BRICKS";
          earnedAmount = (billableQty * rate) / 1000;
        } else if (entry.entry_mode === "SHIFT_COUNT") {
          physicalQty = splitInputQty;
          billableQty = splitInputQty;
          unit = "SHIFTS";
          earnedAmount = splitInputQty * rate;
        }

        const ratePaise = BigInt(Math.round(rate * 100));
        const earnedAmountPaise = BigInt(Math.round(earnedAmount * 100));

        const log = await tx.daily_work_logs.create({
          data: {
            business_unit_id: businessUnitId,
            worker_id: entry.worker_id,
            aalyawala_id: aalyawalaId,
            work_date: workDate,
            category: bulkInput.category,
            entry_mode: entry.entry_mode,
            input_quantity: splitInputQty,
            physical_quantity: physicalQty,
            billable_quantity: billableQty,
            unit,
            conversion_physical_per_unit: convPhysicalPerUnit,
            conversion_billable_per_unit: convBillablePerUnit,
            rate_paise: ratePaise,
            earned_amount_paise: earnedAmountPaise,
            batch_id: entry.batch_id || null,
            reference_no: entry.reference_no || null,
            notes: entry.notes || null,
            created_by: userId || null,
          },
          include: {
            profiles: true,
            aalyawala: true,
            batches: true,
          },
        });

        results.push(formatDailyWorkLog(log));
      }
    }

    return results;
  });
}

export async function getDailyWorkLogs(
  businessUnitId: string,
  filters: {
    startDate?: string;
    endDate?: string;
    category?: string;
    workerId?: string;
  } = {}
) {
  const whereClause: any = {
    business_unit_id: businessUnitId,
  };

  if (filters.workerId) {
    whereClause.worker_id = filters.workerId;
  }

  if (filters.category) {
    whereClause.category = filters.category;
  }

  if (filters.startDate || filters.endDate) {
    whereClause.work_date = {};
    if (filters.startDate) {
      whereClause.work_date.gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      whereClause.work_date.lte = new Date(filters.endDate);
    }
  }

  const logs = await prisma.daily_work_logs.findMany({
    where: whereClause,
    include: {
      profiles: true,
      aalyawala: true,
      batches: true,
    },
    orderBy: { work_date: "desc" },
  });

  const formattedLogs = logs.map(formatDailyWorkLog);

  const summary = formattedLogs.reduce(
    (acc, log) => {
      acc.totalEntries += 1;
      acc.totalPhysicalQty += log.physical_quantity;
      acc.totalBillableQty += log.billable_quantity;
      acc.totalEarnedAmount += log.earned_amount;
      return acc;
    },
    {
      totalEntries: 0,
      totalPhysicalQty: 0,
      totalBillableQty: 0,
      totalEarnedAmount: 0,
    }
  );

  return {
    logs: formattedLogs,
    summary,
  };
}

export async function getDailyWorkSummaryForToday(
  businessUnitId: string,
  dateStr?: string
) {
  const targetDate = dateStr ? new Date(dateStr) : new Date();
  const startOfDay = new Date(targetDate.toISOString().split("T")[0]);

  const logs = await prisma.daily_work_logs.findMany({
    where: {
      business_unit_id: businessUnitId,
      work_date: startOfDay,
    },
  });

  let totalEntries = logs.length;
  let totalPhysicalBricks = 0;
  let totalBillableBricks = 0;
  let totalEarnings = 0;

  for (const log of logs) {
    if (log.unit === "BRICKS") {
      totalPhysicalBricks += Number(log.physical_quantity);
      totalBillableBricks += Number(log.billable_quantity);
    }
    totalEarnings += Number(log.earned_amount_paise) / 100;
  }

  return {
    date: startOfDay.toISOString().split("T")[0],
    totalEntries,
    totalPhysicalBricks,
    totalBillableBricks,
    totalEarnings,
  };
}

export async function deleteDailyWorkLog(
  id: string,
  businessUnitId: string
) {
  const log = await prisma.daily_work_logs.findFirst({
    where: {
      id,
      business_unit_id: businessUnitId,
    },
  });

  if (!log) {
    throw new Error("Work log record not found");
  }

  if (log.settlement_id) {
    throw new Error("Cannot delete a work log that has already been settled.");
  }

  await prisma.daily_work_logs.delete({
    where: { id },
  });

  return { id, success: true };
}

export async function upsertWorkUnitConversion(
  businessUnitId: string,
  input: WorkUnitConversionInput
) {
  const effectiveFrom = input.effective_from
    ? new Date(input.effective_from)
    : new Date();

  return await prisma.work_unit_conversions.create({
    data: {
      business_unit_id: businessUnitId,
      category: input.category,
      unit_name: input.unit_name,
      physical_count_per_unit: input.physical_count_per_unit,
      billable_count_per_unit: input.billable_count_per_unit,
      effective_from: effectiveFrom,
    },
  });
}

function formatDailyWorkLog(log: any) {
  return {
    id: log.id,
    business_unit_id: log.business_unit_id,
    worker_id: log.worker_id,
    worker_name: log.profiles?.full_name || "Unknown Worker",
    worker_code: log.profiles?.code || "",
    aalyawala_id: log.aalyawala_id || null,
    aalyawala_name: log.aalyawala?.full_name || null,
    work_date: log.work_date.toISOString().split("T")[0],
    category: log.category,
    entry_mode: log.entry_mode,
    input_quantity: Number(log.input_quantity),
    physical_quantity: Number(log.physical_quantity),
    billable_quantity: Number(log.billable_quantity),
    unit: log.unit,
    conversion_physical_per_unit: log.conversion_physical_per_unit,
    conversion_billable_per_unit: log.conversion_billable_per_unit,
    rate: Number(log.rate_paise) / 100,
    earned_amount: Number(log.earned_amount_paise) / 100,
    batch_id: log.batch_id,
    batch_number: log.batches?.batch_number || null,
    reference_no: log.reference_no,
    notes: log.notes,
    settlement_id: log.settlement_id,
    created_at: log.created_at.toISOString(),
  };
}
