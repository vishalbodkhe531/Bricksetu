"use client";

import React from "react";
import Link from "next/link";
import { Package, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table/data-table";
import { usePermissions } from "@/features/auth/hooks/usePermissions";
import { materialColumns } from "@/features/materials/components/columns/material-columns";
import { useRawMaterialsList } from "@/features/materials/hooks/useMaterials";

export default function MaterialsPage() {
  const { profile, canManageInventory: canWrite } = usePermissions();
  const orgId = profile?.organization_id ?? "";

  const { data: materials = [], isLoading } = useRawMaterialsList(orgId);

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-4 rounded-xl border border-border shadow-xs">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" /> Materials & Purchases / इंधन व कच्चा माल
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage coal, clay, sand, diesel, supplier links, stock levels, and purchase records.
          </p>
        </div>

        {canWrite && (
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/materials/new">
              <Button variant="default" size="sm" className="gap-1.5">
                <Plus className="h-4 w-4" /> Add Material / कच्चा माल नोंदवा
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Main Unified Data Table */}
      <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden p-1">
        <DataTable
          columns={materialColumns}
          data={materials}
          loading={isLoading}
          searchPlaceholder="Search materials by name, unit, or supplier..."
          showExport={true}
          exportFileName="raw_materials.csv"
        />
      </div>
    </div>
  );
}
