"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Column } from "@/components/ui/data-table/data-table";
import type {
  InventoryTransaction,
  StockSummary,
} from "@/features/inventory/types/inventory.types";

export const summaryColumns: Column<StockSummary>[] = [
  {
    accessorKey: "item_name",
    header: "Item Name",
    cell: ({ row }) => (
      <div className="font-semibold text-foreground">
        {row.original.item_name}
      </div>
    ),
  },
  {
    accessorKey: "item_type",
    header: "Type",
    cell: ({ row }) => (
      <Badge variant="outline" className="capitalize font-mono text-[10px]">
        {row.original.item_type.replace("_", " ")}
      </Badge>
    ),
  },
  {
    accessorKey: "unit",
    header: "Unit",
    cell: ({ row }) => (
      <span className="text-muted-foreground text-xs">{row.original.unit}</span>
    ),
  },
  {
    accessorKey: "stock",
    header: "Current Stock",
    align: "right",
    cell: ({ row }) => (
      <span className="font-mono font-bold text-foreground">
        {Number(row.original.stock).toLocaleString()}
      </span>
    ),
  },
];

export const transactionColumns: Column<InventoryTransaction>[] = [
  {
    accessorKey: "transaction_date",
    header: "Date",
    cell: ({ row }) => (
      <span className="text-muted-foreground font-mono text-[11px]">
        {row.original.transaction_date}
      </span>
    ),
  },
  {
    accessorKey: "item_type",
    header: "Item Type",
    cell: ({ row }) => (
      <Badge variant="outline" className="capitalize font-mono text-[10px]">
        {row.original.item_type.replace("_", " ")}
      </Badge>
    ),
  },
  {
    accessorKey: "transaction_type",
    header: "Type",
    align: "center",
    cell: ({ row }) => (
      <Badge
        variant={
          row.original.transaction_type === "in" ? "success" : "destructive"
        }
      >
        {row.original.transaction_type.toUpperCase()}
      </Badge>
    ),
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
    align: "right",
    cell: ({ row }) => {
      const isIn = row.original.transaction_type === "in";
      return (
        <span
          className={`font-mono font-bold ${
            isIn
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-destructive"
          }`}
        >
          {isIn ? `+${row.original.quantity}` : `-${row.original.quantity}`}
        </span>
      );
    },
  },
];
