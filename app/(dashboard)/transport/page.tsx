"use client";

import React, { useState } from "react";
import { Plus, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table/data-table";
import { usePermissions } from "@/features/auth/hooks/usePermissions";
import { AddVehicleModal } from "@/features/transport/components/AddVehicleModal";
import { vehicleColumns } from "@/features/transport/components/columns/vehicle-columns";
import { useVehicles } from "@/features/transport/hooks/useTransport";

export default function TransportPage() {
  const { profile, canManageInventory: canWrite } = usePermissions();
  const orgId = profile?.organization_id ?? "";

  const { data: vehicles = [] } = useVehicles(orgId);

  // Modal
  const [showAddVehicle, setShowAddVehicle] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Truck className="h-6 w-6 text-primary" /> Transport & Fleet
            Vehicles
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Vehicle fleet management and driver registrations for material
            inward & dispatches
          </p>
        </div>
        {canWrite && (
          <Button onClick={() => setShowAddVehicle(true)}>
            <Plus className="h-4 w-4" /> Register Vehicle
          </Button>
        )}
      </div>

      {/* Content */}
      <DataTable
        columns={vehicleColumns}
        data={vehicles}
        searchPlaceholder="Search fleet vehicles..."
        showExport={false}
      />

      {/* Modal: Add Vehicle */}
      <AddVehicleModal
        isOpen={showAddVehicle}
        onClose={() => setShowAddVehicle(false)}
        orgId={orgId}
      />
    </div>
  );
}
