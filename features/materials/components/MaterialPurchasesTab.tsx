"use client";

import React, { useState } from "react";
import { DataTable, Column } from "@/components/ui/data-table/data-table";
import { Button } from "@/components/ui/button";
import { PurchaseRecord } from "../types/materials.types";
import { useMaterialPurchases } from "../hooks/useMaterials";
import { ShoppingCart, Plus } from "lucide-react";
import { AddPurchaseDialog } from "./AddPurchaseDialog";

interface MaterialPurchasesTabProps {
  materialId: string;
  materialName?: string;
  unit: string;
  initialPurchases?: PurchaseRecord[];
  canWrite?: boolean;
  showAddDialog?: boolean;
  onAddDialogChange?: (open: boolean) => void;
}

export function MaterialPurchasesTab({
  materialId,
  materialName = "Material",
  unit,
  initialPurchases = [],
  canWrite = true,
  showAddDialog,
  onAddDialogChange,
}: MaterialPurchasesTabProps) {
  const { data: purchases = initialPurchases, isLoading } = useMaterialPurchases(materialId);
  const [internalOpen, setInternalOpen] = useState(false);

  const isDialogOpen = showAddDialog !== undefined ? showAddDialog : internalOpen;
  const setDialogOpen = onAddDialogChange || setInternalOpen;

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3 bg-card p-4 rounded-xl border shadow-xs">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-blue-500" /> Purchase Ledger / खरेदी इतिहास
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Full ledger of raw material purchases and supplier receipts
          </p>
        </div>

        {canWrite && (
          <Button
            size="sm"
            onClick={() => setDialogOpen(true)}
            className="gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Record Purchase / खरेदी नोंदवा
          </Button>
        )}
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

      <AddPurchaseDialog
        open={isDialogOpen}
        onOpenChange={setDialogOpen}
        materialId={materialId}
        materialName={materialName}
        unit={unit}
      />
    </div>
  );
}
