"use client";

import React from "react";
import { GitCommit, Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table/data-table";
import { Column } from "@/components/ui/data-table/data-table";
import { useStageTransitions } from "../../hooks/useProduction";
import type { StageTransition } from "../../types/production.types";
import { BatchStatusBadge } from "../BatchStatusBadge";
import { formatDateDdMmYyyy } from "@/lib/utils";

interface BatchStageTabProps {
  batchId: string;
  orgId: string;
  canWrite: boolean;
  onOpenStageModal: () => void;
}

export function BatchStageTab({
  batchId,
  orgId,
  canWrite,
  onOpenStageModal,
}: BatchStageTabProps) {
  const { data: transitions = [], isLoading } = useStageTransitions(batchId, orgId);

  const columns: Column<StageTransition>[] = [
    {
      accessorKey: "transition_date",
      header: "Date / तारीख",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {formatDateDdMmYyyy(row.original.transition_date)}
        </span>
      ),
    },
    {
      accessorKey: "from_stage",
      header: "Transition / बदल",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-xs">
          <BatchStatusBadge stage={row.original.from_stage} showMarathi={false} size="sm" />
          <ArrowRight className="h-3 w-3 text-muted-foreground" />
          <BatchStatusBadge stage={row.original.to_stage} showMarathi={false} size="sm" />
        </div>
      ),
    },
    {
      accessorKey: "input_quantity",
      header: "Input Qty / सुरुवातीस",
      align: "right",
      cell: ({ row }) => (
        <span className="font-mono text-xs">
          {row.original.input_quantity.toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: "output_good_quantity",
      header: "Good Output / सुखरूप",
      align: "right",
      cell: ({ row }) => (
        <span className="font-mono font-semibold text-emerald-500 text-xs">
          {row.original.output_good_quantity.toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: "damaged_quantity",
      header: "Damaged / नुकसान",
      align: "right",
      cell: ({ row }) => (
        <span className="font-mono font-semibold text-destructive text-xs">
          {row.original.damaged_quantity.toLocaleString()}
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
    {
      accessorKey: "created_by_name",
      header: "Recorded By",
      cell: ({ row }) => (
        <span className="text-[11px] text-muted-foreground">
          {row.original.created_by_name ?? "System"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4 bg-card border border-border rounded-xl p-4 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <GitCommit className="h-4 w-4 text-primary" /> Stage Transitions / टप्पा बदलांची नोंद
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Audit history of batch stage progression and wastage at each stage
          </p>
        </div>

        {canWrite && (
          <Button size="sm" onClick={onOpenStageModal} className="gap-1 text-xs">
            <Plus className="h-3.5 w-3.5" /> Advance Stage / पुढील टप्पा
          </Button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={transitions}
        loading={isLoading}
        searchPlaceholder="Search stage history..."
      />
    </div>
  );
}
