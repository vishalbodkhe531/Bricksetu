"use client";

import React from "react";
import { PackageCheck, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table/data-table";
import { Column } from "@/components/ui/data-table/data-table";
import { useBatchFinishedGoods } from "../../hooks/useProduction";
import type { FinishedLotOutput } from "../../types/production.types";
import { formatCostPerBrick, formatPaiseToRupees } from "../../utils/production-calculations";
import { formatDateDdMmYyyy } from "@/lib/utils";

interface BatchFinishedGoodsTabProps {
  batchId: string;
  orgId: string;
  canWrite: boolean;
  onOpenFinishedGoodsModal: () => void;
}

export function BatchFinishedGoodsTab({
  batchId,
  orgId,
  canWrite,
  onOpenFinishedGoodsModal,
}: BatchFinishedGoodsTabProps) {
  const { data: goods = [], isLoading } = useBatchFinishedGoods(batchId, orgId);

  const columns: Column<FinishedLotOutput>[] = [
    {
      accessorKey: "lot_number",
      header: "Lot Number / लॉट क्र.",
      cell: ({ row }) => (
        <span className="font-mono font-bold text-emerald-500 text-xs">
          {row.original.lot_number}
        </span>
      ),
    },
    {
      accessorKey: "brick_grade_name",
      header: "Quality Grade / प्रतवारी",
      cell: ({ row }) => (
        <span className="font-semibold text-foreground text-xs">
          {row.original.brick_grade_name}
        </span>
      ),
    },
    {
      accessorKey: "initial_quantity",
      header: "Initial Output / पक्की विटा",
      align: "right",
      cell: ({ row }) => (
        <span className="font-mono font-bold text-foreground text-xs">
          {row.original.initial_quantity.toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: "available_quantity",
      header: "Available in Stock / शिल्लक साठा",
      align: "right",
      cell: ({ row }) => (
        <span className="font-mono font-bold text-emerald-500 text-xs">
          {row.original.available_quantity.toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: "unit_cost_paise",
      header: "Unit Cost / दर वीट",
      align: "right",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {formatCostPerBrick(row.original.unit_cost_paise)}
        </span>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Transferred At / तारीख",
      cell: ({ row }) => (
        <span className="font-mono text-[11px] text-muted-foreground">
          {formatDateDdMmYyyy(row.original.created_at)}
        </span>
      ),
    },
  ];

  const totalFinishedBricks = goods.reduce((acc, g) => acc + g.initial_quantity, 0);

  return (
    <div className="space-y-4 bg-card border border-border rounded-xl p-4 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <PackageCheck className="h-4 w-4 text-emerald-500" /> Finished Goods Inventory / पक्का माल साठा
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Total Finished Goods Transferred to Stock: <span className="font-mono font-bold text-emerald-500">{totalFinishedBricks.toLocaleString()} Bricks</span>
          </p>
        </div>

        {canWrite && (
          <Button size="sm" onClick={onOpenFinishedGoodsModal} className="gap-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
            <Plus className="h-3.5 w-3.5" /> Transfer Goods to Stock / साठ्यात जमा करा
          </Button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={goods}
        loading={isLoading}
        searchPlaceholder="Search finished lots..."
      />
    </div>
  );
}
