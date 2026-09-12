"use client";

import React from "react";
import { Column } from "@/components/ui/data-table/data-table";
import type { ReportType } from "@/features/reports/api/reports.api";

export function getReportColumns(
  selectedReportType: ReportType,
): Column<any>[] {
  switch (selectedReportType) {
    case "production-summary":
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
          accessorKey: "brick_type_name",
          header: "Brick Type",
          cell: ({ row }) => (
            <span className="font-semibold text-foreground">
              {row.original.brick_type_name}
            </span>
          ),
        },
        {
          accessorKey: "worker_name",
          header: "Worker",
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
              {Number(row.original.bricks_moulded).toLocaleString()}
            </span>
          ),
        },
      ];

    case "worker-settlements":
      return [
        {
          accessorKey: "worker_name",
          header: "Worker Name",
          cell: ({ row }) => (
            <span className="font-semibold text-foreground">
              {row.original.worker_name}
            </span>
          ),
        },
        {
          accessorKey: "period_start",
          header: "Period",
          cell: ({ row }) => (
            <span className="text-muted-foreground font-mono text-[11px]">
              {row.original.period_start} → {row.original.period_end}
            </span>
          ),
        },
        {
          accessorKey: "gross_wage",
          header: "Gross Wage",
          align: "right",
          cell: ({ row }) => (
            <span className="font-mono font-semibold">
              ₹{Number(row.original.gross_wage).toFixed(2)}
            </span>
          ),
        },
        {
          accessorKey: "advances_deducted",
          header: "Advances",
          align: "right",
          cell: ({ row }) => (
            <span className="font-mono text-amber-600">
              ₹{Number(row.original.advances_deducted).toFixed(2)}
            </span>
          ),
        },
        {
          accessorKey: "net_payable",
          header: "Net Payable",
          align: "right",
          cell: ({ row }) => (
            <span className="font-mono font-bold text-emerald-600">
              ₹{Number(row.original.net_payable).toFixed(2)}
            </span>
          ),
        },
      ];

    case "inventory-stock":
      return [
        {
          accessorKey: "item_name",
          header: "Item Name",
          cell: ({ row }) => (
            <span className="font-semibold text-foreground">
              {row.original.item_name}
            </span>
          ),
        },
        {
          accessorKey: "item_type",
          header: "Item Type",
          cell: ({ row }) => (
            <span className="font-mono text-xs text-muted-foreground">
              {row.original.item_type}
            </span>
          ),
        },
        {
          accessorKey: "stock",
          header: "Current Stock",
          align: "right",
          cell: ({ row }) => (
            <span className="font-mono font-bold">
              {Number(row.original.stock).toLocaleString()}
            </span>
          ),
        },
      ];

    case "sales-summary":
      return [
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
          accessorKey: "customer_name",
          header: "Customer",
          cell: ({ row }) => (
            <span className="font-semibold text-foreground">
              {row.original.customer_name}
            </span>
          ),
        },
        {
          accessorKey: "status",
          header: "Status",
          cell: ({ row }) => (
            <span className="capitalize font-mono text-xs">
              {row.original.status}
            </span>
          ),
        },
        {
          accessorKey: "total_amount",
          header: "Total Amount",
          align: "right",
          cell: ({ row }) => (
            <span className="font-mono font-bold">
              ₹{Number(row.original.total_amount).toLocaleString("en-IN")}
            </span>
          ),
        },
      ];

    case "payment-summary":
      return [
        {
          accessorKey: "payment_date",
          header: "Payment Date",
          cell: ({ row }) => (
            <span className="text-muted-foreground font-mono text-[11px]">
              {row.original.payment_date}
            </span>
          ),
        },
        {
          accessorKey: "customer_name",
          header: "Customer",
          cell: ({ row }) => (
            <span className="font-semibold text-foreground">
              {row.original.customer_name}
            </span>
          ),
        },
        {
          accessorKey: "payment_mode",
          header: "Mode",
          cell: ({ row }) => (
            <span className="uppercase font-mono text-xs">
              {row.original.payment_mode || "—"}
            </span>
          ),
        },
        {
          accessorKey: "amount",
          header: "Amount",
          align: "right",
          cell: ({ row }) => (
            <span className="font-mono font-bold text-emerald-600">
              ₹{Number(row.original.amount).toLocaleString("en-IN")}
            </span>
          ),
        },
      ];

    default:
      return [];
  }
}
