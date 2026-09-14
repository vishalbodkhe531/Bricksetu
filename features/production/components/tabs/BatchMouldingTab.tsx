"use client";

import React from "react";
import { Hammer, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table/data-table";
import { Column } from "@/components/ui/data-table/data-table";
import { useBatchMouldingLogs } from "../../hooks/useProduction";
import type { MouldingLog } from "../../types/production.types";
import { formatPaiseToRupees } from "../../utils/production-calculations";
import { formatDateDdMmYyyy } from "@/lib/utils";

interface BatchMouldingTabProps {
  batchId: string;
  orgId: string;
  canWrite: boolean;
  onOpenMouldingModal: () => void;
}

export function BatchMouldingTab({
  batchId,
  orgId,
  canWrite,
  onOpenMouldingModal,
}: BatchMouldingTabProps) {
  const { data: logs = [], isLoading } = useBatchMouldingLogs(batchId, orgId);

  const columns: Column<MouldingLog>[] = [
    {
      accessorKey: "work_date",
      header: "Date / तारीख",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {formatDateDdMmYyyy(row.original.work_date)}
        </span>
      ),
    },
    {
      accessorKey: "worker_name",
      header: "Worker / कामगार नाव",
      cell: ({ row }) => (
        <span className="font-semibold text-foreground text-xs">
          {row.original.worker_name}
        </span>
      ),
    },
    {
      accessorKey: "bricks_moulded",
      header: "Bricks Moulded / पाडलेली वीट",
      align: "right",
      cell: ({ row }) => (
        <span className="font-mono font-bold text-amber-500 text-xs">
          {row.original.bricks_moulded.toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: "rate_per_1000_paise",
      header: "Rate / 1000",
      align: "right",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {formatPaiseToRupees(row.original.rate_per_1000_paise)}
        </span>
      ),
    },
    {
      accessorKey: "earned_amount_paise",
      header: "Earned Labour / मजुरी रक्कम्",
      align: "right",
      cell: ({ row }) => (
        <span className="font-mono font-bold text-emerald-500 text-xs">
          {formatPaiseToRupees(row.original.earned_amount_paise)}
        </span>
      ),
    },
    {
      accessorKey: "notes",
      header: "Notes / टीप",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground truncate max-w-50 block">
          {row.original.notes || "—"}
        </span>
      ),
    },
  ];

  const totalMoulded = logs.reduce((acc, l) => acc + l.bricks_moulded, 0);
  const totalLabourPaise = logs.reduce((acc, l) => acc + l.earned_amount_paise, 0);

  return (
    <div className="space-y-4 bg-card border border-border rounded-xl p-4 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Hammer className="h-4 w-4 text-amber-500" /> Moulding Logs / पाथाई नोंदी
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Total Moulded: <span className="font-mono font-bold text-amber-500">{totalMoulded.toLocaleString()}</span> | Total Labour: <span className="font-mono font-bold text-emerald-500">{formatPaiseToRupees(totalLabourPaise)}</span>
          </p>
        </div>

        {canWrite && (
          <Button size="sm" onClick={onOpenMouldingModal} className="gap-1 text-xs">
            <Plus className="h-3.5 w-3.5" /> Log Daily Moulding / पाथाई नोंदवा
          </Button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={logs}
        loading={isLoading}
        searchPlaceholder="Search moulding logs..."
      />
    </div>
  );
}
