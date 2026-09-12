"use client";

import React from "react";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Column } from "@/components/ui/data-table/data-table";
import type { ProductionBatch } from "@/features/production/types/production.types";

export function getProductionColumns(
  onSelectBatch: (batch: ProductionBatch) => void,
): Column<ProductionBatch>[] {
  return [
    {
      accessorKey: "production_date",
      header: "Date",
      cell: ({ row }) => (
        <span className="text-muted-foreground font-mono text-[11px]">
          {row.original.production_date}
        </span>
      ),
    },
    {
      accessorKey: "brick_type",
      header: "Brick Type",
      cell: ({ row }) => (
        <div className="font-semibold text-foreground">
          {row.original.brick_type?.name ?? "Standard Brick"}
        </div>
      ),
    },
    {
      accessorKey: "worker_name",
      header: "Moulding Worker",
      cell: ({ row }) => (
        <span className="text-muted-foreground text-xs">
          {row.original.worker_name ?? "—"}
        </span>
      ),
    },
    {
      accessorKey: "bricks_moulded",
      header: "Bricks Moulded",
      align: "right",
      cell: ({ row }) => (
        <span className="font-mono font-bold text-foreground">
          {row.original.bricks_moulded.toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: "notes",
      header: "Notes",
      cell: ({ row }) => (
        <span className="text-muted-foreground text-xs truncate max-w-[200px] block">
          {row.original.notes || "—"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Action",
      align: "center",
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-[11px] gap-1 cursor-pointer"
          onClick={() => onSelectBatch(row.original)}
        >
          <Eye className="h-3.5 w-3.5" /> View
        </Button>
      ),
    },
  ];
}
