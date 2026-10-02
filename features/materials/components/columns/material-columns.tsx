"use client";

import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Column } from "@/components/ui/data-table/data-table";
import type { MaterialListItem } from "@/features/materials/types/materials.types";
import { formatDateDdMmYyyy } from "@/lib/utils";
import { Eye, AlertTriangle } from "lucide-react";

export const materialColumns: Column<MaterialListItem>[] = [
  {
    accessorKey: "name",
    header: "Material Name",
    cell: ({ row }) => {
      const isLowStock =
        row.original.reorder_level != null &&
        row.original.available_stock <= row.original.reorder_level;

      return (
        <div className="flex items-center gap-2">
          <Link
            href={`/materials/${row.original.id}`}
            className="font-bold text-primary hover:underline text-xs"
          >
            {row.original.name}
          </Link>
          {isLowStock && (
            <Badge variant="destructive" className="text-[10px] px-1 py-0 gap-0.5">
              <AlertTriangle className="h-2.5 w-2.5" /> Low Stock
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "material_date",
    header: "Date",
    cell: ({ row }) => (
      <span className="text-muted-foreground font-mono text-[11px]">
        {formatDateDdMmYyyy(row.original.material_date)}
      </span>
    ),
  },
  {
    accessorKey: "primary_supplier_name",
    header: "Primary Supplier",
    cell: ({ row }) => (
      <span className="text-xs font-semibold text-foreground">
        {row.original.primary_supplier_name || "—"}
      </span>
    ),
  },
  {
    accessorKey: "primary_supplier_phone",
    header: "Phone",
    cell: ({ row }) => (
      <span className="font-mono text-xs">
        {row.original.primary_supplier_phone || "—"}
      </span>
    ),
  },
  {
    accessorKey: "unit",
    header: "Unit of Measure",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground uppercase">
        {row.original.unit}
      </span>
    ),
  },
  {
    accessorKey: "available_stock",
    header: "Available Stock",
    align: "right",
    cell: ({ row }) => {
      const isLowStock =
        row.original.reorder_level != null &&
        row.original.available_stock <= row.original.reorder_level;

      return (
        <span
          className={`font-mono text-xs font-semibold ${
            isLowStock ? "text-destructive" : "text-foreground"
          }`}
        >
          {row.original.available_stock.toLocaleString()}{" "}
          <span className="text-[10px] font-normal uppercase text-muted-foreground">
            {row.original.unit}
          </span>
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "Action",
    align: "center",
    cell: ({ row }) => (
      <Link href={`/materials/${row.original.id}`}>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-[11px] gap-1 cursor-pointer"
        >
          <Eye className="h-3.5 w-3.5" /> Open Material
        </Button>
      </Link>
    ),
  },
];
