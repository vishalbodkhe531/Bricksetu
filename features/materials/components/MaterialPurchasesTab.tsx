"use client";

import React from "react";
import { DataTable, Column } from "@/components/ui/data-table/data-table";
import { PurchaseRecord } from "../types/materials.types";
import { useMaterialPurchases } from "../hooks/useMaterials";
import { ShoppingCart } from "lucide-react";

interface MaterialPurchasesTabProps {
  materialId: string;
  unit: string;
  initialPurchases?: PurchaseRecord[];
}

export function MaterialPurchasesTab({
  materialId,
  unit,
  initialPurchases = [],
}: MaterialPurchasesTabProps) {
  const { data: purchases = initialPurchases, isLoading } = useMaterialPurchases(materialId);

  const columns: Column<PurchaseRecord>[] = [
    {
      accessorKey: "purchase_number",
      header: "Purchase #",
      cell: ({ row }) => (
        <span className="font-mono text-xs font-semibold text-foreground">
          {row.original.purchase_number}
        </span>
      ),
    },
    {
      accessorKey: "purchase_date",
      header: "Purchase Date",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.original.purchase_date}
        </span>
      ),
    },
    {
      accessorKey: "supplier_name",
      header: "Supplier Name",
      cell: ({ row }) => (
        <span className="font-semibold text-foreground">
          {row.original.supplier_name}
        </span>
      ),
    },
    {
      accessorKey: "quantity",
      header: `Quantity (${unit.toUpperCase()})`,
      align: "right",
      cell: ({ row }) => (
        <span className="font-mono font-bold text-foreground">
          {row.original.quantity.toLocaleString()} {unit}
        </span>
      ),
    },
    {
      accessorKey: "unit_price",
      header: "Unit Price (₹)",
      align: "right",
      cell: ({ row }) => (
        <span className="font-mono text-muted-foreground">
          ₹{row.original.unit_price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      accessorKey: "total_amount",
      header: "Total Amount (₹)",
      align: "right",
      cell: ({ row }) => (
        <span className="font-mono font-bold text-emerald-600">
          ₹{row.original.total_amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      accessorKey: "notes",
      header: "Notes",
      cell: ({ row }) => (
        <span className="text-muted-foreground text-xs truncate max-w-[150px] block">
          {row.original.notes || "—"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-3 bg-card p-4 rounded-xl border shadow-xs">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-blue-500" /> Purchase Ledger / खरेदी इतिहास
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Full ledger of raw material purchases and supplier receipts
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden p-1">
        <DataTable
          columns={columns}
          data={purchases}
          loading={isLoading}
          searchPlaceholder="Search purchase by supplier or purchase number..."
          showExport={true}
          exportFileName={`purchases_${materialId}.csv`}
        />
      </div>
    </div>
  );
}
