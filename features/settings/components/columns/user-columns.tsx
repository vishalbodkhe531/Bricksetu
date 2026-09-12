"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Column } from "@/components/ui/data-table/data-table";
import type { UserProfile } from "@/features/settings/types/settings.types";

export const userColumns: Column<UserProfile>[] = [
  {
    accessorKey: "full_name",
    header: "Full Name",
    cell: ({ row }) => (
      <div className="font-semibold text-foreground font-sans">
        {row.original.full_name}
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email Address",
    cell: ({ row }) => (
      <span className="text-muted-foreground font-mono text-[11px]">
        {row.original.email}
      </span>
    ),
  },
  {
    accessorKey: "role",
    header: "Role",
    align: "center",
    cell: ({ row }) => (
      <Badge
        variant={
          row.original.role === "owner"
            ? "default"
            : row.original.role === "manager"
              ? "secondary"
              : "outline"
        }
        className="uppercase font-mono text-[10px]"
      >
        {row.original.role}
      </Badge>
    ),
  },
];
