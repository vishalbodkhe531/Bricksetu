"use client";

import React, { useState } from "react";
import { Factory, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table/data-table";
import { usePermissions } from "@/features/auth/hooks/usePermissions";
import { AddBatchModal } from "@/features/production/components/AddBatchModal";
import { BatchDetailModal } from "@/features/production/components/BatchDetailModal";
import { getProductionColumns } from "@/features/production/components/columns/production-columns";
import {
  useBrickTypes,
  useProductionBatches,
} from "@/features/production/hooks/useProduction";
import type { ProductionBatch } from "@/features/production/types/production.types";
import { useWorkers } from "@/features/workers/hooks/useWorkers";

export default function ProductionPage() {
  const { profile, canManageProduction: canWrite } = usePermissions();
  const orgId = profile?.organization_id ?? "";

  const { data: batches = [] } = useProductionBatches(orgId);
  const { data: brickTypes = [] } = useBrickTypes(orgId);
  const { data: workers = [] } = useWorkers(orgId);

  // Modal state
  const [showAddBatch, setShowAddBatch] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<ProductionBatch | null>(
    null,
  );

  const columns = getProductionColumns((batch) => setSelectedBatch(batch));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Factory className="h-6 w-6 text-primary" /> Production & Moulding
            Logs
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Track daily moulding output by brick type and worker
          </p>
        </div>
        {canWrite && (
          <Button onClick={() => setShowAddBatch(true)}>
            <Plus className="h-4 w-4" /> Log Production Batch
          </Button>
        )}
      </div>

      {/* Batches Table */}
      <DataTable
        columns={columns}
        data={batches}
        searchPlaceholder="Search production batches..."
        exportFileName="production_batches.csv"
      />

      {/* Modal: Log Production Batch */}
      <AddBatchModal
        isOpen={showAddBatch}
        onClose={() => setShowAddBatch(false)}
        orgId={orgId}
        brickTypes={brickTypes}
        workers={workers}
      />

      {/* Modal: Batch Detail */}
      <BatchDetailModal
        batch={selectedBatch}
        onClose={() => setSelectedBatch(null)}
      />
    </div>
  );
}
