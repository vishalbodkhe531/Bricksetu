'use server';

import { ActionResult, formatPgError } from '@/lib/utils';
import { getReportData } from './queries';

export async function getReportDataAction(reportType: string, searchParams?: any): Promise<ActionResult> {
  try {
    const data = await getReportData(reportType, searchParams);
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: formatPgError(err) };
  }
}
