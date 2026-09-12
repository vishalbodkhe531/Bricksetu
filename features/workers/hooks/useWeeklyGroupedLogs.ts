import { useMemo } from "react";
import { LogGroup } from "./useGroupedDailyLogs";
import { getWeekEndFriday, getWeekStartSaturday } from "../utils/getWeekBoundary";

export interface WeekBucket {
  id: string;
  weekEndFriday: string;
  weekStartSaturday: string;
  logs: LogGroup[];
  totalEarnedAmount: number;
  totalPhysicalQty: number;
  totalBillableQty: number;
  totalEntries: number;
}

export function useWeeklyGroupedLogs(groupedDailyLogs: LogGroup[] | undefined): WeekBucket[] {
  return useMemo(() => {
    if (!groupedDailyLogs || groupedDailyLogs.length === 0) return [];

    const map = new Map<string, WeekBucket>();

    for (const logGroup of groupedDailyLogs) {
      const fridayDate = getWeekEndFriday(logGroup.work_date);
      const saturdayDate = getWeekStartSaturday(fridayDate);
      const key = `week_${fridayDate}`;

      const existing = map.get(key);
      const entriesCount = logGroup.items?.length || 1;

      if (existing) {
        existing.logs.push(logGroup);
        existing.totalEarnedAmount += Number(logGroup.earned_amount || 0);
        existing.totalPhysicalQty += Number(logGroup.physical_quantity || 0);
        existing.totalBillableQty += Number(logGroup.billable_quantity || 0);
        existing.totalEntries += entriesCount;
      } else {
        map.set(key, {
          id: key,
          weekEndFriday: fridayDate,
          weekStartSaturday: saturdayDate,
          logs: [logGroup],
          totalEarnedAmount: Number(logGroup.earned_amount || 0),
          totalPhysicalQty: Number(logGroup.physical_quantity || 0),
          totalBillableQty: Number(logGroup.billable_quantity || 0),
          totalEntries: entriesCount,
        });
      }
    }

    return Array.from(map.values());
  }, [groupedDailyLogs]);
}
