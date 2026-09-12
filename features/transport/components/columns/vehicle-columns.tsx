"use client";

import React from "react";
import { Column } from "@/components/ui/data-table/data-table";
import type { Vehicle } from "@/features/transport/types/transport.types";

export const vehicleColumns: Column<Vehicle>[] = [
  {
    accessorKey: "registration_number",
    header: "Registration #",
    cell: ({ row }) => (
      <span className="font-mono font-bold text-foreground">
        {row.original.registration_number}
      </span>
    ),
  },
  {
    accessorKey: "driver_name",
    header: "Assigned Driver",
    cell: ({ row }) => (
      <span className="text-muted-foreground text-xs">
        {row.original.driver_name || "—"}
      </span>
    ),
  },
  {
    accessorKey: "capacity_details",
    header: "Capacity Details",
    cell: ({ row }) => (
      <span className="text-muted-foreground text-xs">
        {row.original.capacity_details || "—"}
      </span>
    ),
  },
];
