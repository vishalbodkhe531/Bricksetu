"use client";

import React from "react";
import { DollarSign } from "lucide-react";
import { DataTable } from "@/components/ui/data-table/data-table";
import { Column } from "@/components/ui/data-table/data-table";
import { useBatchExpenses } from "../../hooks/useProduction";
import type { BatchExpense } from "../../types/production.types";
import { formatPaiseToRupees } from "../../utils/production-calculations";
import { formatDateDdMmYyyy } from "@/lib/utils";

interface BatchExpensesTabProps {
  batchId: string;
  orgId: string;
}

export function BatchExpensesTab({ batchId, orgId }: BatchExpensesTabProps) {
  const { data: expenses = [], isLoading } = useBatchExpenses(batchId, orgId);

  const columns: Column<BatchExpense>[] = [
    {
      accessorKey: "expense_date",
      header: "Date / तारीख",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {formatDateDdMmYyyy(row.original.expense_date)}
        </span>
      ),
    },
    {
      accessorKey: "category_name",
      header: "Category / वर्ग",
      cell: ({ row }) => (
        <span className="font-semibold text-foreground text-xs">
          {row.original.category_name}
        </span>
      ),
    },
    {
      accessorKey: "payee_name",
      header: "Paid To / कोणाला दिले",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {row.original.payee_name || "—"}
        </span>
      ),
    },
    {
      accessorKey: "payment_method_name",
      header: "Payment Method",
      cell: ({ row }) => (
        <span className="text-[11px] font-mono text-muted-foreground">
          {row.original.payment_method_name}
        </span>
      ),
    },
    {
      accessorKey: "amount_paise",
      header: "Amount / रक्कम",
      align: "right",
      cell: ({ row }) => (
        <span className="font-mono font-bold text-foreground text-xs">
          {formatPaiseToRupees(row.original.amount_paise)}
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

  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount_paise, 0);

  return (
    <div className="space-y-4 bg-card border border-border rounded-xl p-4 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-primary" /> Batch Expenses / या बॅचचा इतर खर्च
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Total Indirect Expenses: <span className="font-mono font-bold text-primary">{formatPaiseToRupees(totalExpenses)}</span>
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={expenses}
        loading={isLoading}
        searchPlaceholder="Search batch expenses..."
      />
    </div>
  );
}
