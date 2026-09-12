"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Column } from "@/components/ui/data-table/data-table";
import type { Payment } from "@/features/payments/types/payment.types";

export const paymentColumns: Column<Payment>[] = [
  {
    accessorKey: "payment_date",
    header: "Date",
    cell: ({ row }) => (
      <span className="text-muted-foreground font-mono text-[11px]">
        {row.original.payment_date}
      </span>
    ),
  },
  {
    accessorKey: "customers",
    header: "Customer",
    cell: ({ row }) => (
      <div>
        <div className="font-bold text-foreground">
          {row.original.customer?.name ?? "General Payment"}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "amount",
    header: "Amount",
    align: "right",
    cell: ({ row }) => (
      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
        ₹
        {Number(row.original.amount).toLocaleString("en-IN", {
          minimumFractionDigits: 2,
        })}
      </span>
    ),
  },
  {
    accessorKey: "payment_mode",
    header: "Mode",
    align: "center",
    cell: ({ row }) => (
      <Badge variant="outline" className="uppercase font-mono text-[10px]">
        {row.original.payment_mode}
      </Badge>
    ),
  },
  {
    accessorKey: "reference_number",
    header: "Ref #",
    cell: ({ row }) => (
      <span className="font-mono text-muted-foreground text-xs">
        {row.original.reference_number || "—"}
      </span>
    ),
  },
];
