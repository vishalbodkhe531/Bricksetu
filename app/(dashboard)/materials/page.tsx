"use client";

import React, { useState } from "react";
import { Package, Plus, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table/data-table";
import { usePermissions } from "@/features/auth/hooks/usePermissions";
import { AddRawMaterialModal } from "@/features/materials/components/AddRawMaterialModal";
import { AddSupplierModal } from "@/features/materials/components/AddSupplierModal";
import {
  materialColumns,
  supplierColumns,
} from "@/features/materials/components/columns/material-columns";
import {
  useRawMaterialsList,
  useSuppliersList,
} from "@/features/materials/hooks/useMaterials";

export default function MaterialsPage() {
  const { profile, canManageInventory: canWrite } = usePermissions();
  const orgId = profile?.organization_id ?? "";

  const [activeTab, setActiveTab] = useState<"materials" | "suppliers">(
    "materials",
  );

  const { data: materials = [] } = useRawMaterialsList(orgId);
  const { data: suppliers = [] } = useSuppliersList(orgId);

  // Modals
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [showAddSupplier, setShowAddSupplier] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" /> Raw Materials &
            Suppliers
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage coal, clay, sand, diesel, and registered supplier contacts
          </p>
        </div>
        {canWrite && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowAddSupplier(true)}
            >
              <Truck className="h-4 w-4" /> Add Supplier
            </Button>
            <Button onClick={() => setShowAddMaterial(true)}>
              <Plus className="h-4 w-4" /> Add Material
            </Button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {(["materials", "suppliers"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "materials" ? "Raw Materials" : "Suppliers Directory"}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "materials" ? (
        <DataTable
          columns={materialColumns}
          data={materials}
          searchPlaceholder="Search materials..."
          showExport={false}
        />
      ) : (
        <DataTable
          columns={supplierColumns}
          data={suppliers}
          searchPlaceholder="Search suppliers..."
          showExport={false}
        />
      )}

      {/* Modal: Add Material */}
      <AddRawMaterialModal
        isOpen={showAddMaterial}
        onClose={() => setShowAddMaterial(false)}
        orgId={orgId}
      />

      {/* Modal: Add Supplier */}
      <AddSupplierModal
        isOpen={showAddSupplier}
        onClose={() => setShowAddSupplier(false)}
        orgId={orgId}
      />
    </div>
  );
}
