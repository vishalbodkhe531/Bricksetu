import { prisma } from "@/lib/prisma";
import { getMarathiDay } from "../utils/date-utils";
import type {
  WeeklyPayment,
  WeeklyPaymentData,
  WeeklyPaymentKPIs,
  WeeklyPaymentMethod,
  WeeklyPaymentInput,
} from "../types/weekly-payment.types";

/**
 * Fetch all weekly payments and KPIs for a specific worker
 */
export async function getWeeklyPayments(
  organizationId: string,
  workerId: string
): Promise<WeeklyPaymentData> {
  const worker = await prisma.profiles.findFirst({
    where: { id: workerId, business_unit_id: organizationId },
    select: {
      id: true,
      total_decided_advance_amount: true,
      full_name: true,
      payment_type: true,
    },
  });

  if (!worker) {
    throw new Error("कामगार आढळला नाही (Worker not found)");
  }

  const rows = await prisma.weekly_payments.findMany({
    where: {
      business_unit_id: organizationId,
      worker_id: workerId,
      deleted_at: null,
    },
    orderBy: [{ payment_date: "desc" }, { created_at: "desc" }],
  });

  const payments: WeeklyPayment[] = rows.map((r) => {
    const dateStr = r.payment_date.toISOString().split("T")[0];
    return {
      id: r.id,
      business_unit_id: r.business_unit_id,
      worker_id: r.worker_id,
      payment_date: dateStr,
      day_of_week: r.day_of_week || getMarathiDay(dateStr),
      amount: Number(r.amount_paise) / 100,
      amount_paise: r.amount_paise.toString(),
      paid_by: r.paid_by,
      payment_method: r.payment_method as WeeklyPaymentMethod,
      notes: r.notes,
      created_at: r.created_at.toISOString(),
      created_by: r.created_by,
    };
  });

  const totalDecidedAmount = worker.total_decided_advance_amount
    ? Number(worker.total_decided_advance_amount) / 100
    : 0;

  let totalPayment = 0;
  let cashCount = 0;
  let phonepayCount = 0;
  let cashAmount = 0;
  let phonepayAmount = 0;

  for (const p of payments) {
    totalPayment += p.amount;
    if (p.payment_method === "CASH") {
      cashCount += 1;
      cashAmount += p.amount;
    } else if (p.payment_method === "PHONEPAY") {
      phonepayCount += 1;
      phonepayAmount += p.amount;
    }
  }

  const remainingAmount = Math.max(0, totalDecidedAmount - totalPayment);

  const kpis: WeeklyPaymentKPIs = {
    total_payment: totalPayment,
    total_decided_amount: totalDecidedAmount,
    cash_count: cashCount,
    phonepay_count: phonepayCount,
    cash_amount: cashAmount,
    phonepay_amount: phonepayAmount,
    remaining_amount: remainingAmount,
  };

  return {
    payments,
    kpis,
  };
}

/**
 * Record a new weekly payment for Bhatkar or Aalyawale worker
 */
export async function recordWeeklyPayment(
  organizationId: string,
  userId: string | null,
  input: WeeklyPaymentInput
): Promise<WeeklyPayment> {
  const worker = await prisma.profiles.findFirst({
    where: { id: input.worker_id, business_unit_id: organizationId },
  });

  if (!worker) {
    throw new Error("कामगार आढळला नाही (Worker not found)");
  }

  const dayOfWeek =
    input.day_of_week?.trim() || getMarathiDay(input.payment_date);
  const amountPaise = BigInt(Math.round(input.amount * 100));

  const created = await prisma.weekly_payments.create({
    data: {
      business_unit_id: organizationId,
      worker_id: input.worker_id,
      payment_date: new Date(input.payment_date),
      day_of_week: dayOfWeek,
      amount_paise: amountPaise,
      paid_by: input.paid_by.trim(),
      payment_method: input.payment_method,
      notes: input.notes?.trim() || null,
      created_by: userId,
    },
  });

  const dateStr = created.payment_date.toISOString().split("T")[0];

  return {
    id: created.id,
    business_unit_id: created.business_unit_id,
    worker_id: created.worker_id,
    payment_date: dateStr,
    day_of_week: created.day_of_week || getMarathiDay(dateStr),
    amount: Number(created.amount_paise) / 100,
    amount_paise: created.amount_paise.toString(),
    paid_by: created.paid_by,
    payment_method: created.payment_method as WeeklyPaymentMethod,
    notes: created.notes,
    created_at: created.created_at.toISOString(),
    created_by: created.created_by,
  };
}

/**
 * Soft delete a weekly payment record
 */
export async function deleteWeeklyPayment(
  organizationId: string,
  paymentId: string
): Promise<{ id: string; success: boolean }> {
  const existing = await prisma.weekly_payments.findFirst({
    where: { id: paymentId, business_unit_id: organizationId, deleted_at: null },
  });

  if (!existing) {
    throw new Error("पेमेंट नोंद आढळली नाही (Weekly payment record not found)");
  }

  const deleted = await prisma.weekly_payments.update({
    where: { id: paymentId },
    data: {
      deleted_at: new Date(),
    },
  });

  return {
    id: deleted.id,
    success: true,
  };
}

