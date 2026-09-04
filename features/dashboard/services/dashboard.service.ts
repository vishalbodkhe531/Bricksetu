import { prisma } from '@/lib/prisma';

export interface DashboardSummary {
  total_workers: number;
  total_production_today: number;
  total_sales_pending: number;
  total_payments_received: number;
  recent_production: Array<{
    production_date: string;
    brick_type_name: string;
    bricks_moulded: number;
    worker_name: string | null;
  }>;
  recent_payments: Array<{
    payment_date: string;
    customer_name: string;
    amount: number;
    payment_mode: string | null;
  }>;
  stock_summary: Array<{
    item_id: string;
    item_type: string;
    stock: number;
  }>;
}

/**
 * Dashboard service — server-only Prisma implementation.
 * Uses Promise.all for parallel database queries.
 */
export async function getDashboardSummary(organizationId: string): Promise<DashboardSummary> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    workersCount,
    batchesToday,
    pendingSalesCount,
    paymentsAggregate,
    recentBatches,
    recentPayments,
    stockGrouped,
  ] = await Promise.all([
    // Active workers
    prisma.profiles.count({
      where: { business_unit_id: organizationId, is_active: true },
    }),

    // Moulded quantity today
    prisma.batches.aggregate({
      where: {
        business_unit_id: organizationId,
        start_date: { gte: today },
      },
      _sum: { moulded_quantity: true },
    }),

    // Pending sales count (e.g. records created)
    prisma.records.count({
      where: { business_unit_id: organizationId },
    }),

    // Total payments received (sum of amount_paise)
    prisma.payments.aggregate({
      where: { business_unit_id: organizationId },
      _sum: { amount_paise: true },
    }),

    // Recent production (last 10)
    prisma.batches.findMany({
      where: { business_unit_id: organizationId },
      include: {
        brick_types: true,
        users: { select: { full_name: true } },
      },
      orderBy: { start_date: 'desc' },
      take: 10,
    }),

    // Recent payments (last 5)
    prisma.payments.findMany({
      where: { business_unit_id: organizationId },
      include: {
        payment_methods: true,
      },
      orderBy: { payment_date: 'desc' },
      take: 5,
    }),

    // Stock summary grouped
    prisma.stock_ledger.groupBy({
      by: ['brick_type_id'],
      where: { business_unit_id: organizationId },
      _sum: { quantity_change: true },
    }),
  ]);

  const totalWorkers = workersCount;
  const productionToday = batchesToday._sum.moulded_quantity || 0;
  const pendingSales = pendingSalesCount;
  const totalPayments = Number(paymentsAggregate._sum.amount_paise || BigInt(0)) / 100;

  const recentProduction = recentBatches.map((b: any) => ({
    production_date: b.start_date.toISOString().split('T')[0],
    brick_type_name: b.brick_types?.name ?? 'Unknown',
    bricks_moulded: b.moulded_quantity,
    worker_name: b.users?.full_name ?? null,
  }));

  const recentPaymentsList = recentPayments.map((p: any) => ({
    payment_date: p.payment_date.toISOString().split('T')[0],
    customer_name: p.party_id || 'Customer',
    amount: Number(p.amount_paise) / 100,
    payment_mode: p.payment_methods?.name || 'Cash',
  }));

  const stockSummary = stockGrouped.map((s: any) => ({
    item_id: s.brick_type_id,
    item_type: 'brick',
    stock: s._sum.quantity_change || 0,
  }));

  return {
    total_workers: totalWorkers,
    total_production_today: productionToday,
    total_sales_pending: pendingSales,
    total_payments_received: totalPayments,
    recent_production: recentProduction,
    recent_payments: recentPaymentsList,
    stock_summary: stockSummary,
  };
}
