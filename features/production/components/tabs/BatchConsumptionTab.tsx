"use client";

import React from "react";
import { Fuel, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table/data-table";
import { Column } from "@/components/ui/data-table/data-table";
import { useBatchConsumption } from "../../hooks/useProduction";
import type { MaterialConsumption } from "../../types/production.types";
import { formatPaiseToRupees } from "../../utils/production-calculations";
import { formatDateDdMmYyyy } from "@/lib/utils";

interface BatchConsumptionTabProps {
  batchId: string;
  orgId: string;
  canWrite: boolean;
  onOpenConsumptionModal: () => void;
}

export function BatchConsumptionTab({
  batchId,
  orgId,
  canWrite,
  onOpenConsumptionModal,
}: BatchConsumptionTabProps) {
  const { data: consumptions = [], isLoading } = useBatchConsumption(batchId, orgId);

  const columns: Column<MaterialConsumption>[] = [
    {
      accessorKey: "consumption_date",
      header: "Date / तारीख",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {formatDateDdMmYyyy(row.original.consumption_date)}
        </span>
      ),
    },
    {
      accessorKey: "material_name",
      header: "Material / इंधन नाव",
      cell: ({ row }) => (
        <div>
          <span className="font-semibold text-foreground text-xs block">
            {row.original.material_name}
          </span>
          {row.original.lot_number && (
            <span className="text-[10px] text-muted-foreground font-mono">
              Lot #{row.original.lot_number}
            </span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "quantity",
      header: "Quantity Used / वापरलेले प्रमाण",
      align: "right",
      cell: ({ row }) => (
        <span className="font-mono font-semibold text-foreground text-xs">
          {row.original.quantity} {row.original.material_unit}
        </span>
      ),
    },
    {
      accessorKey: "cost_paise",
      header: "Total Cost / एकूण खर्च",
      align: "right",
      cell: ({ row }) => (
        <span className="font-mono font-bold text-amber-500 text-xs">
          {formatPaiseToRupees(row.original.cost_paise)}
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

  const totalMaterialCost = consumptions.reduce((acc, c) => acc + c.cost_paise, 0);

  return (
    <div className="space-y-4 bg-card border border-border rounded-xl p-4 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Fuel className="h-4 w-4 text-amber-500" /> Material & Fuel Usage / इंधन वापर नोंदी
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Total Material Cost: <span className="font-mono font-bold text-amber-500">{formatPaiseToRupees(totalMaterialCost)}</span>
          </p>
        </div>

        {canWrite && (
          <Button size="sm" onClick={onOpenConsumptionModal} className="gap-1 text-xs">
            <Plus className="h-3.5 w-3.5" /> Record Material Usage / इंधन वापर नोंदवा
          </Button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={consumptions}
        loading={isLoading}
        searchPlaceholder="Search material consumption..."
      />
    </div>
  );
}
