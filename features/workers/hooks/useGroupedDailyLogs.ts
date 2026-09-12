import { useMemo } from "react";

export interface LogGroupItem {
  id: string;
  aalyawala_id?: string | null;
  aalyawala_name?: string | null;
  bhatkar_id?: string | null;
  bhatkar_name?: string | null;
  kachha_maal_id?: string | null;
  kachha_maal_name?: string | null;
  input_quantity: number;
  physical_quantity: number;
  billable_quantity: number;
  earned_amount: number;
  is_auto_generated: boolean;
  is_primary: boolean;
}

export interface LogGroup {
  id: string;
  batch_id?: string | null;
  work_date: string;
  entry_mode: string;
  input_quantity: number;
  physical_quantity: number;
  billable_quantity: number;
  rate: number;
  earned_amount: number;
  bhatkar_name?: string | null;
  kachha_maal_name?: string | null;
  is_auto_generated: boolean;
  is_primary: boolean;
  items: LogGroupItem[];
}

export function useGroupedDailyLogs(logs: any[] | undefined): LogGroup[] {
  return useMemo(() => {
    if (!logs || logs.length === 0) return [];

    const groupMap = new Map<string, LogGroup>();

    for (const log of logs) {
      const datePart = log.work_date ? log.work_date.split("T")[0] : "";
      const key = log.log_group_id
        ? `group_${log.log_group_id}`
        : log.batch_id
          ? `batch_${log.batch_id}`
          : `${datePart}_${log.entry_mode}_${log.rate}_${log.id}`;
      const existing = groupMap.get(key);

      const item: LogGroupItem = {
        id: log.id,
        aalyawala_id: log.aalyawala_id,
        aalyawala_name:
          log.aalyawala_name || log.batch_number || log.reference_no || null,
        bhatkar_id: log.bhatkar_id,
        bhatkar_name: log.bhatkar_name || null,
        kachha_maal_id: log.kachha_maal_id || null,
        kachha_maal_name: log.kachha_maal_name || null,
        input_quantity: Number(log.input_quantity || 0),
        physical_quantity: Number(log.physical_quantity || 0),
        billable_quantity: Number(log.billable_quantity || 0),
        earned_amount: Number(log.earned_amount || 0),
        is_auto_generated: log.is_auto_generated ?? false,
        is_primary: log.is_primary ?? true,
      };

      if (existing) {
        existing.input_quantity += Number(log.input_quantity || 0);
        existing.physical_quantity += Number(log.physical_quantity || 0);
        existing.billable_quantity += Number(log.billable_quantity || 0);
        existing.earned_amount += Number(log.earned_amount || 0);
        if (!existing.bhatkar_name && log.bhatkar_name) {
          existing.bhatkar_name = log.bhatkar_name;
        }
        if (!existing.kachha_maal_name && log.kachha_maal_name) {
          existing.kachha_maal_name = log.kachha_maal_name;
        }
        existing.items.push(item);
      } else {
        groupMap.set(key, {
          id: log.id,
          batch_id: log.batch_id,
          work_date: log.work_date,
          entry_mode: log.entry_mode,
          input_quantity: Number(log.input_quantity || 0),
          physical_quantity: Number(log.physical_quantity || 0),
          billable_quantity: Number(log.billable_quantity || 0),
          rate: Number(log.rate || 0),
          earned_amount: Number(log.earned_amount || 0),
          bhatkar_name: log.bhatkar_name || null,
          kachha_maal_name: log.kachha_maal_name || null,
          is_auto_generated: log.is_auto_generated ?? false,
          is_primary: log.is_primary ?? true,
          items: [item],
        });
      }
    }

    return Array.from(groupMap.values());
  }, [logs]);
}
