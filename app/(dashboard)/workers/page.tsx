"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Filter, Layers, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table/data-table";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePermissions } from "@/features/auth/hooks/usePermissions";
import { AdvanceModal } from "@/features/workers/components/AdvanceModal";
import { BulkRecordWorkSheet } from "@/features/workers/components/BulkRecordWorkSheet";
import { getWorkerColumns } from "@/features/workers/components/columns/worker-columns";
import { RateChangeDialog } from "@/features/workers/components/RateChangeDialog";
import { WorkerDeactivateDialog } from "@/features/workers/components/WorkerDeactivateDialog";
import { WORKER_TABS } from "@/features/workers/constants/worker-options";
import { useAdvanceForm } from "@/features/workers/hooks/useAdvanceForm";
import { useFilteredWorkers } from "@/features/workers/hooks/useFilteredWorkers";
import {
  useChangeWorkerRate,
  useDeactivateWorker,
  useWorkers,
} from "@/features/workers/hooks/useWorkers";
import type { Worker } from "@/features/workers/types/worker.types";

export default function WorkersPage() {
  const { profile, canManageWorkers: canWrite } = usePermissions();
  const orgId = profile?.organization_id ?? "";

  const [includeInactive, setIncludeInactive] = useState(false);
  const { data: workers = [], isLoading: loadingWorkers } = useWorkers(
    orgId,
    includeInactive,
  );

  const deactivateWorker = useDeactivateWorker(orgId);
  const changeWorkerRate = useChangeWorkerRate(orgId, "");

  // Dialog States
  const [rateChangeWorker, setRateChangeWorker] = useState<Worker | null>(
    null,
  );
  const [deactivateWorkerItem, setDeactivateWorkerItem] =
    useState<Worker | null>(null);
  const [showBulkRecordSheet, setShowBulkRecordSheet] = useState(false);

  // Advance Form Hook
  const {
    state: advanceState,
    closeAdvance,
    setField: setAdvanceField,
  } = useAdvanceForm();

  // Tabbed Filtering State & Helper Hook
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const { counts, filteredWorkers } = useFilteredWorkers(workers, activeTab);

  // Table Columns Definition
  const workerColumns = getWorkerColumns(canWrite, {
    onDeactivate: (worker) => setDeactivateWorkerItem(worker),
  });

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-4 rounded-xl border border-border shadow-xs">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" /> Workers Roster / कामगार
            सूची
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage worker profiles, daily work logging, piece rates, and advance
            balances.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer select-none mr-1">
            <input
              type="checkbox"
              checked={includeInactive}
              onChange={(e) => setIncludeInactive(e.target.checked)}
              className="rounded border-border text-primary focus:ring-primary/50"
            />
            <Filter className="h-3 w-3" /> Show Deactivated
          </label>

          {canWrite && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBulkRecordSheet(true)}
              >
                <Layers className="h-3.5 w-3.5 text-primary" /> Bulk Entry / काम
                नोंदवा
              </Button>

              <Link href="/workers/new">
                <Button variant="default" size="sm">
                  <Plus className="h-3.5 w-3.5" /> Add Worker
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Tabbed Filter Bar */}
      <div className="border-b border-border bg-card rounded-t-xl px-2 pt-2 flex gap-1 overflow-x-auto">
        <TabsList className="bg-transparent p-0 gap-1 h-auto flex flex-nowrap">
          {WORKER_TABS.map((t) => {
            const count = counts[t.id] ?? 0;
            const isActive = activeTab === t.id;
            return (
              <TabsTrigger
                key={t.id}
                value={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-3.5 py-2 text-xs font-bold transition-all border-b-2 rounded-t-lg rounded-b-none shrink-0 ${
                  isActive
                    ? "border-primary text-primary bg-primary/10"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {t.label}
                <span
                  className={`ml-1.5 px-1 py-0.4 text-[10px] font-mono rounded-full ${
                    isActive
                      ? "bg-primary text-primary-foreground font-bold"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {count}
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </div>

      {/* Data Table */}
      <div className="bg-card border border-border border-t-0 rounded-b-xl shadow-xs overflow-hidden">
        <DataTable
          columns={workerColumns}
          data={filteredWorkers}
          loading={loadingWorkers}
          searchKey="full_name"
          searchPlaceholder="Search सर्व मजूर by name, phone..."
        />
      </div>

      {/* Dialog: Change Rate */}
      {rateChangeWorker && (
        <RateChangeDialog
          open={!!rateChangeWorker}
          onClose={() => setRateChangeWorker(null)}
          workerId={rateChangeWorker.id}
          workerName={rateChangeWorker.full_name}
          currentRate={rateChangeWorker.current_rate_amount || 0}
          onSubmitRateChange={async (data) => {
            await changeWorkerRate.mutateAsync(data);
          }}
        />
      )}

      {/* Dialog: Deactivate Worker */}
      {deactivateWorkerItem && (
        <WorkerDeactivateDialog
          open={!!deactivateWorkerItem}
          onClose={() => setDeactivateWorkerItem(null)}
          workerId={deactivateWorkerItem.id}
          workerName={deactivateWorkerItem.full_name}
          advanceBalance={deactivateWorkerItem.advance_balance}
          onConfirmDeactivate={async (id) => {
            await deactivateWorker.mutateAsync(id);
          }}
        />
      )}

      {/* Modal: Give Advance */}
      {advanceState.isOpen && (
        <AdvanceModal
          isOpen={advanceState.isOpen}
          onClose={closeAdvance}
          workerId={advanceState.workerId}
          workerName={advanceState.workerName}
          amount={advanceState.amount}
          dateGiven={advanceState.dateGiven}
          reason={advanceState.reason}
          onSetField={setAdvanceField}
          orgId={orgId}
        />
      )}

      {/* Sheet: Bulk Record Work */}
      <BulkRecordWorkSheet
        open={showBulkRecordSheet}
        onOpenChange={setShowBulkRecordSheet}
        orgId={orgId}
        workers={workers}
      />
    </div>
  );
}
