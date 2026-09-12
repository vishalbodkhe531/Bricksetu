"use client";

import React from "react";
import { Banknote, Coins, IndianRupee } from "lucide-react";
import type { Worker } from "@/features/workers/types/worker.types";

interface WorkerKPISummaryProps {
  worker: Worker;
}

export function WorkerKPISummary({ worker }: WorkerKPISummaryProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div className="p-3 rounded-lg border border-border bg-card shadow-xs space-y-0.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
          <Banknote className="h-3 w-3 text-primary" /> Current Rate
        </span>
        <span className="text-lg font-bold font-mono text-foreground block tabular-nums">
          ₹{Number(worker.current_rate_amount || 0).toFixed(2)}
        </span>
        <span className="text-[10px] text-muted-foreground">
          {worker.category === "DAILY_WAGE"
            ? "per day"
            : worker.category === "MONTHLY_SALARY"
              ? "per month"
              : "per 1,000 moulded bricks"}
        </span>
      </div>

      <div className="p-3 rounded-lg border border-border bg-card shadow-xs space-y-0.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
          <IndianRupee className="h-3 w-3 text-amber-500" /> Advance Balance
        </span>
        <span className="text-lg font-bold font-mono text-amber-600 dark:text-amber-400 block tabular-nums">
          ₹{Number(worker.advance_balance || 0).toFixed(2)}
        </span>
        <span className="text-[10px] text-muted-foreground">
          Unsettled advances given
        </span>
      </div>

      <div className="p-3 rounded-lg border border-border bg-card shadow-xs space-y-0.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
          <Coins className="h-3 w-3 text-emerald-500" /> Total Decided Amount
        </span>
        <span className="text-lg font-bold font-mono text-foreground block tabular-nums">
          ₹
          {Number(worker.total_decided_advance_amount || 0).toLocaleString(
            "en-IN",
          )}
        </span>
        <span className="text-[10px] text-muted-foreground">
          Agreed Peshgi at onboarding
        </span>
      </div>
    </div>
  );
}
