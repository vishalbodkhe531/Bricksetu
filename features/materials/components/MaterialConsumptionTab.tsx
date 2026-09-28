"use client";

import React from "react";
import { DataTable, Column } from "@/components/ui/data-table/data-table";
import { ConsumptionRecord } from "../types/materials.types";
import { useMaterialConsumption } from "../hooks/useMaterials";
import { Flame } from "lucide-react";

interface MaterialConsumptionTabProps {
  materialId: string;
  unit: string;
  initialConsumption?: ConsumptionRecord[];
}

export function MaterialConsumptionTab({
  materialId,
  unit,
  initialConsumption = [],
}: MaterialConsumptionTabProps) {
  const { data: consumption = initialConsumption, isLoading } = useMaterialConsumption(materialId);

  const columns: Column<ConsumptionRecord>[] = [
    {
      accessorKey: "consumption_date",
      header: "Date of Usage",
      cell: ({ row }) => (
        <span className="font-mono text-xs font-semibold text-foreground">
          {row.original.consumption_date}
        </span>
      ),
    },
    {
      accessorKey: "batch_name",
      header: "Production Bhatti / Batch",
      cell: ({ row }) => (
        <span className="font-semibold text-foreground">
          {row.original.batch_name || "General Firing"}
        </span>
      ),
    },
    {
      accessorKey: "quantity",
      header: `Quantity Consumed (${unit.toUpperCase()})`,
      align: "right",
      cell: ({ row }) => (
        <span className="font-mono font-bold text-amber-600">
          {row.original.quantity.toLocaleString()} {unit}
        </span>
      ),
    },
    {
      accessorKey: "cost",
      header: "Material Cost (₹)",
      align: "right",
      cell: ({ row }) => (
        <span className="font-mono text-muted-foreground">
          {row.original.cost > 0
            ? `₹${row.original.cost.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
            : "—"}
        </span>
      ),
    },
    {
      accessorKey: "notes",
      header: "Notes & Remarks",
      cell: ({ row }) => (
        <span className="text-muted-foreground text-xs truncate max-w-[200px] block">
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
            <Flame className="h-4 w-4 text-amber-500" /> Material Consumption Logs / इंधन/वापर नोंद
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Log of fuel and material usage recorded during production batch firing cycles
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden p-1">
        <DataTable
          columns={columns}
          data={consumption}
          loading={isLoading}
          searchPlaceholder="Search usage by date or batch code..."
          showExport={true}
          exportFileName={`consumption_${materialId}.csv`}
        />
      </div>
    </div>
  );
}
