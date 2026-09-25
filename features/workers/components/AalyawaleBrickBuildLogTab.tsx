"use client";

import React from "react";
import {
  Hammer,
  Calendar,
  Layers,
  Coins,
  Flame,
  CheckCircle2,
  Lock,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getMarathiDay, formatDateDdMmYyyy } from "@/features/workers/utils/date-utils";
import type { Worker } from "@/features/workers/types/worker.types";

interface AalyawaleBrickBuildLogTabProps {
  worker: Worker;
  dailyWorkData: any;
  isLoading?: boolean;
}

export function AalyawaleBrickBuildLogTab({
  worker,
  dailyWorkData,
  isLoading = false,
}: AalyawaleBrickBuildLogTabProps) {
  const logs = dailyWorkData?.logs || [];

  // Filter logs to show only direct daily work logs recorded for this worker (excluding auto-generated cross logs from Kachha Maal)
  const aalyawaleLogs = logs.filter((l: any) => !l.is_auto_generated);

  // Compute KPI metrics
  const totalPhysicalBricks = aalyawaleLogs.reduce(
    (sum: number, l: any) => sum + (Number(l.physical_quantity) || 0),
    0
  );
  const totalBillableBricks = aalyawaleLogs.reduce(
    (sum: number, l: any) => sum + (Number(l.billable_quantity) || 0),
    0
  );
  const totalEarnedAmount = aalyawaleLogs.reduce(
    (sum: number, l: any) => sum + (Number(l.earned_amount) || 0),
    0
  );

  // Unique Bhattis worked on
  const uniqueBhattis = Array.from(
    new Set(
      aalyawaleLogs
        .map((l: any) => l.batch_number)
        .filter((b: any): b is string => Boolean(b))
    )
  );

  return (
    <div className="space-y-4">
      {/* 1. Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-card border border-border rounded-xl p-3.5 shadow-xs flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <Hammer className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Total Bricks Built / एकूण रचलेली वीट
            </p>
            <p className="text-base font-bold font-mono text-amber-500">
              {totalPhysicalBricks.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-3.5 shadow-xs flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <Coins className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Total Earned / एकूण मजुरी
            </p>
            <p className="text-base font-bold font-mono text-emerald-500">
              ₹{totalEarnedAmount.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-3.5 shadow-xs flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Flame className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Bhattis Worked / काम केलेल्या भट्ट्या
            </p>
            <p className="text-base font-bold font-mono text-foreground">
              {uniqueBhattis.length}
            </p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-3.5 shadow-xs flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Total Entries / एकूण नोंदी
            </p>
            <p className="text-base font-bold font-mono text-foreground">
              {aalyawaleLogs.length}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Brick Build Log Table */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Layers className="h-4 w-4 text-amber-500" /> Daily Brick Build Log / आल्यावाले दैनिक वीट रचना नोंदवही
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Daily record of bricks built/stacked at Bhatti kilns by {worker.full_name}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="border border-border rounded-lg p-8 flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-primary" /> Loading brick build logs...
          </div>
        ) : aalyawaleLogs.length > 0 ? (
          <div className="border border-border rounded-lg overflow-x-auto shadow-xs">
            <table className="w-full min-w-160 text-xs text-left border-collapse">
              <thead className="bg-muted/60 text-muted-foreground border-b border-border font-semibold uppercase text-[10px] tracking-wider whitespace-nowrap">
                <tr>
                  <th className="py-3 px-3.5">Day / वार</th>
                  <th className="py-3 px-3.5">Date / तारीख</th>
                  <th className="py-3 px-3.5">Bhatti / भट्टी</th>
                  <th className="py-3 px-3.5">Entry Mode</th>
                  <th className="py-3 px-3.5 text-right">Physical Qty</th>
                  <th className="py-3 px-3.5 text-right">Billable Qty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 font-mono">
                {aalyawaleLogs.map((log: any) => {
                  return (
                    <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-3.5 font-sans font-semibold text-amber-600 dark:text-amber-400 text-xs whitespace-nowrap">
                        {getMarathiDay(log.work_date)}
                      </td>
                      <td className="py-3 px-3.5 font-semibold text-foreground whitespace-nowrap">
                        {formatDateDdMmYyyy(log.work_date)}
                      </td>
                      <td className="py-3 px-3.5 font-sans whitespace-nowrap">
                        {log.batch_number ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary border border-primary/20">
                            <Flame className="h-3 w-3 text-primary" />
                            {log.batch_number}
                          </span>
                        ) : (
                          <span className="text-muted-foreground italic text-[11px]">—</span>
                        )}
                      </td>
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        {log.entry_mode === "PINJRI_COUNT" ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                            {log.input_quantity?.toLocaleString()} Pinjri
                          </span>
                        ) : (
                          <Badge variant="outline" className="text-[10px] font-sans">
                            {log.entry_mode === "SHIFT_COUNT" ? "Shift" : "Direct Bricks"}
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-3.5 text-right text-muted-foreground font-semibold whitespace-nowrap">
                        {log.physical_quantity?.toLocaleString()}
                      </td>
                      <td className="py-3 px-3.5 text-right font-bold text-foreground whitespace-nowrap">
                        {log.billable_quantity?.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-muted/80 font-bold border-t-2 border-border text-foreground text-xs font-mono">
                <tr>
                  <td colSpan={4} className="py-3 px-3.5 font-sans uppercase text-[10px] tracking-wider text-muted-foreground">
                    Total Bricks Built / एकूण वीट रचना
                  </td>
                  <td className="py-3 px-3.5 text-right text-muted-foreground">
                    {totalPhysicalBricks.toLocaleString()}
                  </td>
                  <td className="py-3 px-3.5 text-right font-extrabold text-foreground">
                    {totalBillableBricks.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic py-4 text-center">
            No brick build logs recorded yet for this Aalyawale worker.
          </p>
        )}
      </div>
    </div>
  );
}
