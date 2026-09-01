import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import {
  getProductionSummary,
  getWorkerSettlementsReport,
  getInventoryStockReport,
  getSalesSummaryReport,
  getPaymentSummaryReport,
  type ReportType,
} from '@/features/reports/services/reports.service';

export const runtime = 'nodejs';

const VALID_REPORT_TYPES: ReportType[] = [
  'production-summary',
  'worker-settlements',
  'inventory-stock',
  'sales-summary',
  'payment-summary',
];

export async function GET(
  req: Request,
  { params }: { params: Promise<{ reportType: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { reportType } = await params;

    if (!VALID_REPORT_TYPES.includes(reportType as ReportType)) {
      return NextResponse.json(
        { error: `Unknown report type: ${reportType}` },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate') ?? undefined;
    const endDate = searchParams.get('endDate') ?? undefined;
    const orgId = user.organization_id;

    let data: unknown;

    switch (reportType as ReportType) {
      case 'production-summary':
        data = await getProductionSummary(orgId, startDate, endDate);
        break;
      case 'worker-settlements':
        data = await getWorkerSettlementsReport(orgId, startDate, endDate);
        break;
      case 'inventory-stock':
        data = await getInventoryStockReport(orgId);
        break;
      case 'sales-summary':
        data = await getSalesSummaryReport(orgId, startDate, endDate);
        break;
      case 'payment-summary':
        data = await getPaymentSummaryReport(orgId, startDate, endDate);
        break;
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error(`[GET /api/reports/${(await params).reportType}]`, error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
