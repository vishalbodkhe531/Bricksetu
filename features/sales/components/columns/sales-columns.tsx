"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Column } from "@/components/ui/data-table/data-table";
import type { Customer, SalesOrder } from "@/features/sales/types/sales.types";

export const saleColumns: Column<SalesOrder>[] = [
  {
    accessorKey: "order_date",
    header: "Order Date",
    cell: ({ row }) => (
      <span className="text-muted-foreground font-mono text-[11px]">
        {row.original.order_date}
      </span>
    ),
  },
  {
    accessorKey: "customer",
    header: "Customer",
    cell: ({ row }) => (
      <div className="font-semibold text-foreground">
        {row.original.customer?.name ?? row.original.customer_id}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    align: "center",
    cell: ({ row }) => (
      <Badge
        variant={
          row.original.status === "delivered"
            ? "success"
            : row.original.status === "partial"
              ? "warning"
              : "secondary"
        }
        className="capitalize font-mono text-[10px]"
      >
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "total_amount",
    header: "Total Amount",
    align: "right",
    cell: ({ row }) => (
      <span className="font-mono font-bold text-foreground">
        ₹
        {Number(row.original.total_amount).toLocaleString("en-IN", {
          minimumFractionDigits: 2,
        })}
      </span>
    ),
  },
];

export const customerColumns: Column<Customer>[] = [
  {
    accessorKey: "name",
    header: "Customer Name",
    cell: ({ row }) => (
      <div className="font-semibold text-foreground">{row.original.name}</div>
    ),
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => (
      <span className="text-muted-foreground font-mono text-[11px]">
        {row.original.phone || "—"}
      </span>
    ),
  },
  {
    accessorKey: "address",
    header: "Address",
    cell: ({ row }) => (
      <span className="text-muted-foreground text-xs truncate max-w-[200px] block">
        {row.original.address || "—"}
      </span>
    ),
  },
  {
    accessorKey: "gst_number",
    header: "GSTIN",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {row.original.gst_number || "—"}
      </span>
    ),
  },
];
