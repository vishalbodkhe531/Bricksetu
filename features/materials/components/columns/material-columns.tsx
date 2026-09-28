"use client";

import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Column } from "@/components/ui/data-table/data-table";
import type { MaterialListItem } from "@/features/materials/types/materials.types";
import { ChevronRight, AlertTriangle } from "lucide-react";

export const materialColumns: Column<MaterialListItem>[] = [
  {
    accessorKey: "name",
    header: "Material Name / माल नाव",
    cell: ({ row }) => {
      const isLowStock =
        row.original.reorder_level != null &&
        row.original.available_stock <= row.original.reorder_level;

      return (
        <div className="flex items-center gap-2">
          <Link
            href={`/materials/${row.original.id}`}
            className="font-bold text-foreground hover:text-primary hover:underline transition-colors flex items-center gap-1.5"
          >
            {row.original.name}
          </Link>
          <Badge variant="outline" className="font-mono text-[9px] uppercase px-1 py-0">
            {row.original.code}
          </Badge>
          {isLowStock && (
            <Badge variant="destructive" className="text-[9px] px-1 py-0 gap-0.5 animate-pulse">
              <AlertTriangle className="h-2.5 w-2.5" /> Low Stock
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "unit",
    header: "Unit of Measure",
    cell: ({ row }) => (
      <Badge variant="secondary" className="font-mono text-[10px] uppercase font-bold">
        {row.original.unit}
      </Badge>
    ),
  },
  {
    accessorKey: "primary_supplier_name",
    header: "Primary Supplier / पुरवठादार",
    cell: ({ row }) => (
      <span className="text-xs font-semibold text-foreground">
        {row.original.primary_supplier_name || "—"}
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
          className={`font-mono text-xs font-bold ${
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
    accessorKey: "total_purchases",
    header: "Purchases",
    align: "center",
    cell: ({ row }) => (
      <span className="font-mono text-xs font-medium text-muted-foreground">
        {row.original.total_purchases}
      </span>
    ),
  },
  {
    accessorKey: "reorder_level",
    header: "Reorder Alert",
    align: "right",
    cell: ({ row }) => (
      <span className="font-mono text-muted-foreground text-xs">
        {row.original.reorder_level != null
          ? row.original.reorder_level.toLocaleString()
          : "—"}
      </span>
    ),
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        variant={row.original.is_active ? "success" : "secondary"}
        className="text-[10px] py-0 px-1.5"
      >
        {row.original.is_active ? "Active" : "Inactive"}
      </Badge>
    ),
  },
  {
    id: "actions",
    header: "",
    align: "right",
    cell: ({ row }) => (
      <Link href={`/materials/${row.original.id}`}>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-primary">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </Link>
    ),
  },
];
