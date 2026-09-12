"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Column } from "@/components/ui/data-table/data-table";
import type {
  RawMaterial,
  Supplier,
} from "@/features/materials/types/materials.types";

export const materialColumns: Column<RawMaterial>[] = [
  {
    accessorKey: "name",
    header: "Material Name",
    cell: ({ row }) => (
      <div className="font-semibold text-foreground">{row.original.name}</div>
    ),
  },
  {
    accessorKey: "unit",
    header: "Unit of Measure",
    cell: ({ row }) => (
      <Badge variant="outline" className="font-mono text-[10px] uppercase">
        {row.original.unit}
      </Badge>
    ),
  },
  {
    accessorKey: "reorder_level",
    header: "Reorder Level",
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
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <span className="text-muted-foreground text-xs truncate max-w-[200px] block">
        {row.original.description || "—"}
      </span>
    ),
  },
];

export const supplierColumns: Column<Supplier>[] = [
  {
    accessorKey: "name",
    header: "Supplier Name",
    cell: ({ row }) => (
      <div className="font-semibold text-foreground">{row.original.name}</div>
    ),
  },
  {
    accessorKey: "contact_person",
    header: "Contact Person",
    cell: ({ row }) => (
      <span className="text-muted-foreground text-xs">
        {row.original.contact_person || "—"}
      </span>
    ),
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {row.original.phone || "—"}
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
