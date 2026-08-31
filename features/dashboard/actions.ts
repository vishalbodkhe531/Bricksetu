'use server';

import { getDashboardSummary } from './queries';
import { ActionResult, formatPgError } from '@/lib/utils';

export async function getDashboardSummaryAction(): Promise<ActionResult> {
  try {
    const data = await getDashboardSummary();
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: formatPgError(err) };
  }
}
