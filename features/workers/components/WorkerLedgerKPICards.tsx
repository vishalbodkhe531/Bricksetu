"use client";

import React from "react";
import { Flame, Coins, Clock, CheckCircle2 } from "lucide-react";
import type { Worker } from "@/features/workers/types/worker.types";
import { KPIGrid, KPICardItem } from "./KPICard";

interface WorkerLedgerKPICardsProps {
  worker: Worker;
  grandTotalEarned: number;
  grandTotalBillable: number;
  grandTotalPhysical: number;
  unpaidWeeklyEarnings: number;
  paidWeeklyEarnings: number;
  unpaidWeeksCount: number;
  paidWeeksCount: number;
  totalDaysWorked: number;
}

export function WorkerLedgerKPICards({
  worker,
  grandTotalEarned,
  grandTotalBillable,
  grandTotalPhysical,
  unpaidWeeklyEarnings,
  paidWeeklyEarnings,
  unpaidWeeksCount,
  paidWeeksCount,
  totalDaysWorked,
}: WorkerLedgerKPICardsProps) {
  const advanceBalance = Number(worker.advance_balance || 0);

  const unitLabel =
    worker.category === "DAILY_WAGE"
      ? "Days"
      : worker.category === "MONTHLY_SALARY"
        ? "Months"
        : "Bricks";

  const kpiItems: KPICardItem[] = [
    {
      id: "total_production",
      label: "Total Production",
      icon: Flame,
      iconColor: "text-amber-500",
      value: (
        <>
          {grandTotalBillable.toLocaleString()}{" "}
          <span className="text-xs font-sans font-normal text-muted-foreground">
            {unitLabel}
          </span>
        </>
      ),
      subtext: `Physical: ${grandTotalPhysical.toLocaleString()} • ${totalDaysWorked} Days Logged`,
    },
    {
      id: "gross_earned",
      label: "Gross Earned",
      icon: Coins,
      iconColor: "text-emerald-500",
      value: `₹${grandTotalEarned.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      subtext: `Rate: ₹${Number(worker.current_rate_amount || 0).toFixed(2)} ${
        worker.category === "DAILY_WAGE"
          ? "/day"
          : worker.category === "MONTHLY_SALARY"
            ? "/month"
            : "per 1,000 bricks"
      }`,
    },
    {
      id: "unpaid_weekly",
      label: "Unpaid Weekly",
      icon: Clock,
      iconColor: "text-amber-500",
      valueColor: "text-amber-600 dark:text-amber-400",
      value: `₹${unpaidWeeklyEarnings.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      subtext: `${unpaidWeeksCount} ${unpaidWeeksCount === 1 ? "Week" : "Weeks"} Ready for Payout`,
    },
    {
      id: "settled_amount",
      label: "Settled Amount",
      icon: CheckCircle2,
      iconColor: "text-emerald-500",
      valueColor: "text-emerald-600 dark:text-emerald-400",
      value: `₹${paidWeeklyEarnings.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      subtext: `${paidWeeksCount} ${paidWeeksCount === 1 ? "Week" : "Weeks"} Settled (Advance: ₹${advanceBalance.toLocaleString("en-IN")})`,
    },
  ];

  return <KPIGrid items={kpiItems} columns={4} />;
}
