"use client";

import { Button } from "@/components/ui/button";
import { Column } from "@/components/ui/data-table/data-table";
import type { Batch } from "@/features/production/types/production.types";
import { formatDateDdMmYyyy } from "@/lib/utils";
import { Eye } from "lucide-react";
import Link from "next/link";
import { BatchStatusBadge } from "../BatchStatusBadge";

export function getProductionColumns(): Column<Batch>[] {
  return [
    {
      accessorKey: "batch_number",
      header: "Bhatti # / भट्टी क्र.",
      cell: ({ row }) => (
        <div>
          <Link
            href={`/production/${row.original.id}`}
            className="font-mono font-bold text-primary hover:underline block text-xs"
          >
            {row.original.batch_number}
          </Link>
          <span className="text-[10px] text-muted-foreground">
            {row.original.created_by_name ?? "System"}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "brick_type",
      header: "Brick Type / प्रकार",
      cell: ({ row }) => (
        <div>
          <div className="font-semibold text-foreground text-xs">
            {row.original.brick_type?.name ?? "Standard Brick"}
          </div>
          {row.original.brick_type?.dimensions && (
            <span className="text-[10px] text-muted-foreground font-mono">
              {row.original.brick_type.dimensions}
            </span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "stage",
      header: "Current Stage / टप्पा",
      cell: ({ row }) => (
        <BatchStatusBadge
          stage={row.original.stage}
          status={row.original.status}
          size="sm"
        />
      ),
    },
    {
      accessorKey: "target_quantity",
      header: "Target / उद्दिष्ट",
      align: "right",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.original.target_quantity.toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: "moulded_quantity",
      header: "Moulded / पाडलेली",
      align: "right",
      cell: ({ row }) => (
        <span className="font-mono font-semibold text-amber-500 text-xs">
          {row.original.moulded_quantity.toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: "fired_good_quantity",
      header: "Fired Good / पक्की वीट",
      align: "right",
      cell: ({ row }) => (
        <span className="font-mono font-bold text-emerald-500 text-xs">
          {row.original.fired_good_quantity > 0
            ? row.original.fired_good_quantity.toLocaleString()
            : "—"}
        </span>
      ),
    },
    {
      accessorKey: "start_date",
      header: "Start Date / तारीख",
      cell: ({ row }) => (
        <span className="text-muted-foreground font-mono text-[11px]">
          {formatDateDdMmYyyy(row.original.start_date)}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Action",
      align: "center",
      cell: ({ row }) => (
        <Link href={`/production/${row.original.id}`}>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-[11px] gap-1 cursor-pointer"
          >
            <Eye className="h-3.5 w-3.5" /> Open Bhatti
          </Button>
        </Link>
      ),
    },
  ];
}
