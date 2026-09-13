"use client";

import React from "react";
import { Banknote, Coins, IndianRupee } from "lucide-react";
import type { Worker } from "@/features/workers/types/worker.types";
import { KPIGrid, KPICardItem } from "./KPICard";

interface WorkerKPISummaryProps {
  worker: Worker;
}

export function WorkerKPISummary({ worker }: WorkerKPISummaryProps) {
  const kpiItems: KPICardItem[] = [
    {
      id: "current_rate",
      label: "Current Rate",
      icon: Banknote,
      iconColor: "text-primary",
      value: `₹${Number(worker.current_rate_amount || 0).toFixed(2)}`,
      subtext:
        worker.category === "DAILY_WAGE"
          ? "per day"
          : worker.category === "MONTHLY_SALARY"
            ? "per month"
            : "per 1,000 moulded bricks",
    },
    {
      id: "advance_balance",
      label: "Advance Balance",
      icon: IndianRupee,
      iconColor: "text-amber-500",
      valueColor: "text-amber-600 dark:text-amber-400",
      value: `₹${Number(worker.advance_balance || 0).toFixed(2)}`,
      subtext: "Unsettled advances given",
    },
    {
      id: "total_decided_amount",
      label: "Total Decided Amount",
      icon: Coins,
      iconColor: "text-emerald-500",
      value: `₹${Number(worker.total_decided_advance_amount || 0).toLocaleString("en-IN")}`,
      subtext: "Agreed Peshgi at onboarding",
    },
  ];

  return <KPIGrid items={kpiItems} columns={3} />;
}
