import { prisma } from '@/lib/prisma';

export type ReportType =
  | 'production-summary'
  | 'worker-settlements'
  | 'inventory-stock'
  | 'sales-summary'
  | 'payment-summary';

export interface ProductionSummaryRow {
  production_date: string;
  brick_type_name: string;
  worker_name: string | null;
  bricks_moulded: number;
}

export interface WorkerSettlementRow {
  worker_name: string;
  period_start: string;
  period_end: string;
  gross_wage: number;
  advances_deducted: number;
  net_payable: number;
  status: string;
  paid_on: string | null;
}

export interface InventoryStockRow {
  item_type: string;
  item_id: string;
  stock: number;
}

export interface SalesSummaryRow {
  order_date: string;
  customer_name: string;
  status: string;
  total_amount: number;
  items_count: number;
}

export interface PaymentSummaryRow {
  payment_date: string;
  customer_name: string;
  amount: number;
  payment_mode: string | null;
  sales_order_status: string | null;
}

export async function getProductionSummary(
  organizationId: string,
  startDate?: string,
  endDate?: string
): Promise<ProductionSummaryRow[]> {
  const where: any = { business_unit_id: organizationId };
  if (startDate) where.start_date = { gte: new Date(startDate) };
  if (endDate) where.start_date = { ...where.start_date, lte: new Date(endDate) };

  const batches = await prisma.batches.findMany({
    where,
    include: {
      brick_types: true,
      users: { select: { full_name: true } },
    },
    orderBy: { start_date: 'desc' },
  });

  return batches.map((b) => ({
    production_date: b.start_date.toISOString().split('T')[0],
    brick_type_name: b.brick_types?.name ?? 'Unknown',
    worker_name: b.users?.full_name ?? null,
    bricks_moulded: b.moulded_quantity,
  }));
}

export async function getWorkerSettlementsReport(
  organizationId: string,
  startDate?: string,
  endDate?: string
): Promise<WorkerSettlementRow[]> {
  const where: any = { business_unit_id: organizationId };
  if (startDate) where.period_start_date = { gte: new Date(startDate) };
  if (endDate) where.period_start_date = { ...where.period_start_date, lte: new Date(endDate) };

  const settlements = await prisma.settlements.findMany({
    where,
    include: {
      profiles: true,
    },
    orderBy: { period_start_date: 'desc' },
  });

  return settlements.map((s) => ({
    worker_name: s.profiles?.full_name ?? 'Unknown',
    period_start: s.period_start_date.toISOString().split('T')[0],
    period_end: s.period_end_date.toISOString().split('T')[0],
    gross_wage: Number(s.gross_amount_paise) / 100,
    advances_deducted: 0,
    net_payable: Number(s.gross_amount_paise) / 100,
    status: s.status,
    paid_on: s.approved_at ? s.approved_at.toISOString().split('T')[0] : null,
  }));
}

export async function getInventoryStockReport(organizationId: string): Promise<InventoryStockRow[]> {
  const stockGrouped = await prisma.stock_ledger.groupBy({
    by: ['brick_type_id'],
    where: { business_unit_id: organizationId },
    _sum: { quantity_change: true },
  });

  return stockGrouped.map((s) => ({
    item_type: 'brick',
    item_id: s.brick_type_id,
    stock: s._sum.quantity_change || 0,
  }));
}

export async function getSalesSummaryReport(
  organizationId: string,
  startDate?: string,
  endDate?: string
): Promise<SalesSummaryRow[]> {
  const where: any = { business_unit_id: organizationId };
  if (startDate) where.sale_date = { gte: new Date(startDate) };
  if (endDate) where.sale_date = { ...where.sale_date, lte: new Date(endDate) };

  const records = await prisma.records.findMany({
    where,
    include: {
      customers: true,
    },
    orderBy: { sale_date: 'desc' },
  });

  return records.map((r) => ({
    order_date: r.sale_date.toISOString().split('T')[0],
    customer_name: r.customers?.name ?? 'Unknown',
    status: 'COMPLETED',
    total_amount: Number(r.total_amount_paise) / 100,
    items_count: 1,
  }));
}

export async function getPaymentSummaryReport(
  organizationId: string,
  startDate?: string,
  endDate?: string
): Promise<PaymentSummaryRow[]> {
  const where: any = { business_unit_id: organizationId };
  if (startDate) where.payment_date = { gte: new Date(startDate) };
  if (endDate) where.payment_date = { ...where.payment_date, lte: new Date(endDate) };

  const payments = await prisma.payments.findMany({
    where,
    include: {
      payment_methods: true,
    },
    orderBy: { payment_date: 'desc' },
  });

  return payments.map((p) => ({
    payment_date: p.payment_date.toISOString().split('T')[0],
    customer_name: p.party_id || 'Customer',
    amount: Number(p.amount_paise) / 100,
    payment_mode: p.payment_methods?.name || 'Cash',
    sales_order_status: 'COMPLETED',
  }));
}
