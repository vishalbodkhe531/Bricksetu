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

export async function getActiveFixedRate(
  tx: any,
  workerId: string,
  workDate?: Date
): Promise<number | null> {
  const targetDate = workDate || new Date();
  const rateHistory = await tx.rate_history.findFirst({
    where: {
      worker_id: workerId,
      effective_date: { lte: targetDate },
    },
    orderBy: { effective_date: "desc" },
  });

  if (rateHistory) {
    return Number(rateHistory.rate_per_1000_paise) / 100;
  }

  const worker = await tx.profiles.findUnique({
    where: { id: workerId },
    include: {
      rate_history: { orderBy: { effective_date: "desc" }, take: 1 },
    },
  });

  const latestRate = worker?.rate_history[0];
  if (latestRate) {
    return Number(latestRate.rate_per_1000_paise) / 100;
  }

  return null;
}

export async function recordDailyWork(
  businessUnitId: string,
  input: DailyWorkInput,
  userId?: string,
  externalTx?: any
) {
  const workDate = new Date(input.work_date);

  const executeFn = async (tx: any) => {
    // Determine conversion if PINJRI_COUNT
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

    // If KACHA_MAAL cross-logging flow is active
    if (input.category === "KACHA_MAAL") {
      const logGroupId = crypto.randomUUID();
      const productionBatchId = input.batch_id || null;

      // Resolve Bhatkar ID
      const bhatkarId =
        input.bhatkar_id ||
        (input.bhatkar_ids?.[0] ?? null) ||
        (input.bhatkar_entries?.[0]?.bhatkar_id ?? null);

      if (!bhatkarId) {
        throw new Error("Bhatkar selection is required for Kachha Maal daily work");
      }

      // Build list of Aalyawala items
      const aalyawalaItems: { aalyawalaId: string; quantity: number }[] = [];

      if (input.aalyawala_entries && input.aalyawala_entries.length > 0) {
        for (const item of input.aalyawala_entries) {
          if (item.aalyawala_id && item.input_quantity > 0) {
            aalyawalaItems.push({
              aalyawalaId: item.aalyawala_id,
              quantity: item.input_quantity,
            });
          }
        }
      } else if (input.aalyawala_ids && input.aalyawala_ids.length > 0) {
        const count = input.aalyawala_ids.length;
        const splitInputQty = input.input_quantity / count;
        for (const aalId of input.aalyawala_ids) {
          if (aalId) {
            aalyawalaItems.push({
              aalyawalaId: aalId,
              quantity: splitInputQty,
            });
          }
        }
      } else if (input.aalyawala_id) {
        aalyawalaItems.push({
          aalyawalaId: input.aalyawala_id,
          quantity: input.input_quantity,
        });
      }

      if (aalyawalaItems.length === 0) {
        throw new Error("Aalyawala selection is required for Kachha Maal daily work");
      }

      // Batch pre-fetch worker, aalyawalas, and bhatkar profiles + rate histories in ONE query
      const targetWorkerIds = Array.from(
        new Set([input.worker_id, ...aalyawalaItems.map((i) => i.aalyawalaId), bhatkarId].filter(Boolean) as string[])
      );

      const profiles = await tx.profiles.findMany({
        where: { id: { in: targetWorkerIds } },
        include: {
          rate_history: {
            orderBy: { effective_date: "desc" },
          },
        },
      });

      const profileMap = new Map<string, { profile: any; rate: number | null }>();
      for (const p of profiles) {
        let matchedRate = p.rate_history?.find(
          (r: any) => new Date(r.effective_date) <= workDate
        );
        if (!matchedRate && p.rate_history && p.rate_history.length > 0) {
          matchedRate = p.rate_history[0];
        }
        const rate = matchedRate
          ? Number(matchedRate.rate_per_1000_paise) / 100
          : null;
        profileMap.set(p.id, { profile: p, rate });
      }

      const kmWorkerData = profileMap.get(input.worker_id);
      const bhatkarData = profileMap.get(bhatkarId);

      if (!bhatkarData?.profile) throw new Error("Selected Bhatkar worker not found");

      let kmRate = input.rate_per_unit;
      if (kmRate === undefined || kmRate === null) {
        kmRate = kmWorkerData?.rate ?? 0;
      }

      const bhatkarRate = bhatkarData.rate;

      if (bhatkarRate === null || bhatkarRate <= 0) {
        throw new Error(
          `No active rate configured for Bhatkar "${bhatkarData.profile.full_name}"`
        );
      }

      // Verify each Aalyawala profile & rate
      for (const item of aalyawalaItems) {
        const aalyawalaData = profileMap.get(item.aalyawalaId);
        if (!aalyawalaData?.profile) throw new Error("Selected Aalyawala worker not found");
        if (aalyawalaData.rate === null || aalyawalaData.rate <= 0) {
          throw new Error(
            `No active rate configured for Aalyawala "${aalyawalaData.profile.full_name}"`
          );
        }
      }

      const kmInfo = {
        id: input.worker_id,
        name: kmWorkerData?.profile?.full_name || "Unknown Worker",
      };

      for (const item of aalyawalaItems) {
        const aalyawalaData = profileMap.get(item.aalyawalaId)!;
        const aalyawalaRate = aalyawalaData.rate!;

        const itemQty = item.quantity;
        let physicalQty = itemQty;
        let billableQty = itemQty;
        let unit = "BRICKS";

        if (input.entry_mode === "PINJRI_COUNT") {
          physicalQty = itemQty * (convPhysicalPerUnit || 22);
          billableQty = itemQty * (convBillablePerUnit || 20);
          unit = "BRICKS";
        } else if (input.entry_mode === "DIRECT_COUNT") {
          physicalQty = itemQty;
          billableQty = itemQty;
          unit = "BRICKS";
        } else if (input.entry_mode === "SHIFT_COUNT") {
          physicalQty = itemQty;
          billableQty = itemQty;
          unit = "SHIFTS";
        }

        // Calculations
        const kmEarnedAmount =
          input.entry_mode === "SHIFT_COUNT"
            ? itemQty * kmRate
            : (billableQty * kmRate) / 1000;
        const aalyawalaEarnedAmount =
          input.entry_mode === "SHIFT_COUNT"
            ? itemQty * aalyawalaRate
            : (billableQty * aalyawalaRate) / 1000;
        const bhatkarEarnedAmount =
          input.entry_mode === "SHIFT_COUNT"
            ? itemQty * bhatkarRate
            : (billableQty * bhatkarRate) / 1000;

        // 1. Create Primary Kachha Maal Log
        const primaryLog = await tx.daily_work_logs.create({
          data: {
            business_unit_id: businessUnitId,
            worker_id: input.worker_id,
            aalyawala_id: item.aalyawalaId,
            bhatkar_id: bhatkarId,
            batch_id: productionBatchId,
            log_group_id: logGroupId,
            is_primary: true,
            is_auto_generated: false,
            work_date: workDate,
            category: "KACHA_MAAL",
            entry_mode: input.entry_mode,
            input_quantity: itemQty,
            physical_quantity: physicalQty,
            billable_quantity: billableQty,
            unit,
            conversion_physical_per_unit: convPhysicalPerUnit,
            conversion_billable_per_unit: convBillablePerUnit,
            rate_paise: BigInt(Math.round(kmRate * 100)),
            earned_amount_paise: BigInt(Math.round(kmEarnedAmount * 100)),
            reference_no: input.reference_no || null,
            notes: input.notes || null,
            created_by: userId || null,
          },
          include: { profiles: true, aalyawala: true, bhatkar: true, batches: true },
        });
        createdLogs.push(formatDailyWorkLog(primaryLog, kmInfo));

        // 2. Create Auto-Generated Aalyawala Log
        const aalyawalaLog = await tx.daily_work_logs.create({
          data: {
            business_unit_id: businessUnitId,
            worker_id: item.aalyawalaId,
            aalyawala_id: item.aalyawalaId,
            bhatkar_id: bhatkarId,
            batch_id: productionBatchId,
            log_group_id: logGroupId,
            is_primary: false,
            is_auto_generated: true,
            work_date: workDate,
            category: "AALYAWALE",
            entry_mode: input.entry_mode,
            input_quantity: itemQty,
            physical_quantity: physicalQty,
            billable_quantity: billableQty,
            unit,
            conversion_physical_per_unit: convPhysicalPerUnit,
            conversion_billable_per_unit: convBillablePerUnit,
            rate_paise: BigInt(Math.round(aalyawalaRate * 100)),
            earned_amount_paise: BigInt(Math.round(aalyawalaEarnedAmount * 100)),
            reference_no: input.reference_no || null,
            notes: `Auto-generated from Kachha Maal work entry (${primaryLog.id})`,
            created_by: userId || null,
          },
          include: { profiles: true, aalyawala: true, bhatkar: true, batches: true },
        });
        createdLogs.push(formatDailyWorkLog(aalyawalaLog, kmInfo));

        // 3. Create Auto-Generated Bhatkar Log
        const bhatkarLog = await tx.daily_work_logs.create({
          data: {
            business_unit_id: businessUnitId,
            worker_id: bhatkarId,
            aalyawala_id: item.aalyawalaId,
            bhatkar_id: bhatkarId,
            batch_id: productionBatchId,
            log_group_id: logGroupId,
            is_primary: false,
            is_auto_generated: true,
            work_date: workDate,
            category: "BHATKAR",
            entry_mode: input.entry_mode,
            input_quantity: itemQty,
            physical_quantity: physicalQty,
            billable_quantity: billableQty,
            unit,
            conversion_physical_per_unit: convPhysicalPerUnit,
            conversion_billable_per_unit: convBillablePerUnit,
            rate_paise: BigInt(Math.round(bhatkarRate * 100)),
            earned_amount_paise: BigInt(Math.round(bhatkarEarnedAmount * 100)),
            reference_no: input.reference_no || null,
            notes: `Auto-generated from Kachha Maal work entry (${primaryLog.id})`,
            created_by: userId || null,
          },
          include: { profiles: true, aalyawala: true, bhatkar: true, batches: true },
        });
        createdLogs.push(formatDailyWorkLog(bhatkarLog, kmInfo));
      }

      return createdLogs[0]; // return primary log
    }

    // Standard single entry (for other categories like PAKKA_MAAL, AALYAWALE direct, BHATKAR direct)
    let rate = input.rate_per_unit;
    if (rate === undefined || rate === null) {
      const fetchedRate = await getActiveFixedRate(tx, input.worker_id, workDate);
      rate = fetchedRate ?? 0;
    }

    const itemsToCreate: {
      aalyawalaId: string | null;
      bhatkarId: string | null;
      quantity: number;
    }[] = [];

    if (input.aalyawala_entries && input.aalyawala_entries.length > 0) {
      for (const item of input.aalyawala_entries) {
        itemsToCreate.push({
          aalyawalaId: item.aalyawala_id,
          bhatkarId: input.bhatkar_id || null,
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
          bhatkarId: input.bhatkar_id || null,
          quantity: splitInputQty,
        });
      }
    }

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

      const log = await tx.daily_work_logs.create({
        data: {
          business_unit_id: businessUnitId,
          worker_id: input.worker_id,
          aalyawala_id: item.aalyawalaId,
          bhatkar_id: item.bhatkarId,
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
          log_group_id: null,
          reference_no: input.reference_no || null,
          notes: input.notes || null,
          created_by: userId || null,
        },
        include: {
          profiles: true,
          aalyawala: true,
          bhatkar: true,
          batches: true,
        },
      });

      createdLogs.push(formatDailyWorkLog(log));
    }

    return createdLogs.length === 1 ? createdLogs[0] : createdLogs;
  };

  if (externalTx) {
    return await executeFn(externalTx);
  }

  return await prisma.$transaction(executeFn, {
    timeout: 20000,
    maxWait: 10000,
  });
}

export async function recordBulkDailyWork(
  businessUnitId: string,
  bulkInput: BulkDailyWorkInput,
  userId?: string
) {
  const workDate = new Date(bulkInput.work_date);

  return await prisma.$transaction(
    async (tx) => {
      const results: any[] = [];
      for (const entry of bulkInput.entries) {
        const singleInput: DailyWorkInput = {
          worker_id: entry.worker_id,
          work_date: bulkInput.work_date,
          category: bulkInput.category,
          entry_mode: entry.entry_mode,
          input_quantity: entry.input_quantity,
          rate_per_unit: entry.rate_per_unit,
          aalyawala_id: entry.aalyawala_id,
          aalyawala_ids: entry.aalyawala_ids,
          bhatkar_id: entry.bhatkar_id || bulkInput.bhatkar_id || null,
          batch_id: entry.batch_id,
          reference_no: entry.reference_no,
          notes: entry.notes,
        };

        const res = await recordDailyWork(businessUnitId, singleInput, userId, tx);
        if (Array.isArray(res)) {
          results.push(...res);
        } else {
          results.push(res);
        }
      }

      return results;
    },
    {
      timeout: 30000,
      maxWait: 15000,
    }
  );
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
    deleted_at: null,
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
      bhatkar: true,
      batches: true,
    },
    orderBy: { work_date: "desc" },
  });

  const logGroupIds = Array.from(
    new Set(logs.map((l) => l.log_group_id).filter(Boolean) as string[])
  );

  const kmWorkerMap = new Map<string, { id: string; name: string }>();

  if (logGroupIds.length > 0) {
    const primaryLogs = await prisma.daily_work_logs.findMany({
      where: {
        log_group_id: { in: logGroupIds },
        is_primary: true,
      },
      include: {
        profiles: true,
      },
    });

    for (const pLog of primaryLogs) {
      if (pLog.log_group_id && pLog.profiles) {
        kmWorkerMap.set(pLog.log_group_id, {
          id: pLog.worker_id,
          name: pLog.profiles.full_name,
        });
      }
    }
  }

  const formattedLogs = logs.map((log) => formatDailyWorkLog(log, kmWorkerMap));

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
      deleted_at: null,
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
  businessUnitId: string,
  userId?: string
) {
  const log = await prisma.daily_work_logs.findFirst({
    where: {
      id,
      business_unit_id: businessUnitId,
      deleted_at: null,
    },
  });

  if (!log) {
    throw new Error("Work log record not found");
  }

  if (log.settlement_id) {
    throw new Error("Cannot delete a work log that has already been settled.");
  }

  const deleteDate = new Date();

  // If log_group_id exists, soft delete all linked logs in the group
  if (log.log_group_id) {
    await prisma.daily_work_logs.updateMany({
      where: {
        log_group_id: log.log_group_id,
        business_unit_id: businessUnitId,
      },
      data: {
        deleted_at: deleteDate,
        deleted_by: userId || null,
      },
    });
  } else {
    await prisma.daily_work_logs.update({
      where: { id },
      data: {
        deleted_at: deleteDate,
        deleted_by: userId || null,
      },
    });
  }

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

function formatDailyWorkLog(
  log: any,
  kmWorkerMapOrInfo?: Map<string, { id: string; name: string }> | { id: string; name: string }
) {
  let kmWorker: { id: string; name: string } | null = null;

  if (kmWorkerMapOrInfo) {
    if ("get" in kmWorkerMapOrInfo && typeof (kmWorkerMapOrInfo as any).get === "function") {
      kmWorker = log.log_group_id
        ? (kmWorkerMapOrInfo as Map<string, { id: string; name: string }>).get(log.log_group_id) || null
        : null;
    } else if ("name" in kmWorkerMapOrInfo) {
      kmWorker = kmWorkerMapOrInfo as { id: string; name: string };
    }
  }

  const isKachaMaal = log.category === "KACHA_MAAL";

  return {
    id: log.id,
    business_unit_id: log.business_unit_id,
    worker_id: log.worker_id,
    worker_name: log.profiles?.full_name || "Unknown Worker",
    worker_code: log.profiles?.code || "",
    kachha_maal_id: isKachaMaal ? log.worker_id : (kmWorker?.id || null),
    kachha_maal_name: isKachaMaal
      ? (log.profiles?.full_name || null)
      : (kmWorker?.name || null),
    aalyawala_id: log.aalyawala_id || null,
    aalyawala_name: log.aalyawala?.full_name || null,
    bhatkar_id: log.bhatkar_id || null,
    bhatkar_name: log.bhatkar?.full_name || null,
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
    log_group_id: log.log_group_id || null,
    batch_number: log.batches?.batch_number || null,
    is_primary: log.is_primary ?? true,
    is_auto_generated: log.is_auto_generated ?? false,
    reference_no: log.reference_no,
    notes: log.notes,
    settlement_id: log.settlement_id,
    created_at: log.created_at.toISOString(),
  };
}
