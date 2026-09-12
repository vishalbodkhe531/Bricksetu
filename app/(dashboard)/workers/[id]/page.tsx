"use client";

import { use, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle, ArrowLeft, Clock, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePermissions } from "@/features/auth/hooks/usePermissions";
import { RateChangeDialog } from "@/features/workers/components/RateChangeDialog";
import { WorkerDeactivateDialog } from "@/features/workers/components/WorkerDeactivateDialog";
import { EmbeddedRecordWorkForm } from "@/features/workers/components/EmbeddedRecordWorkForm";
import { WorkerIdentityHeader } from "@/features/workers/components/WorkerIdentityHeader";
import { WorkerKPISummary } from "@/features/workers/components/WorkerKPISummary";
import { WorkerDetailTabs } from "@/features/workers/components/WorkerDetailTabs";
import { WorkerProfileTab } from "@/features/workers/components/WorkerProfileTab";
import { WorkerLedgerTab } from "@/features/workers/components/WorkerLedgerTab";
import {
  useWorkerDetail,
  useDailyWorkLogs,
  useChangeWorkerRate,
  useDeactivateWorker,
} from "@/features/workers/hooks/useWorkers";

interface WorkerDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function WorkerDetailPage({ params }: WorkerDetailPageProps) {
  const resolvedParams = use(params);
  const workerId = resolvedParams.id;
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab");

  const { profile, canManageWorkers: canWrite } = usePermissions();
  const orgId = profile?.organization_id ?? "";

  const { data: worker, isLoading: loading } = useWorkerDetail(workerId);
  const { data: dailyWorkData } = useDailyWorkLogs({ workerId });

  const changeWorkerRate = useChangeWorkerRate(orgId, workerId);
  const deactivateWorker = useDeactivateWorker(orgId);

  const isNoDailyWorkRole =
    worker?.category === "BHATKAR" || worker?.category === "AALYAWALE";

  // Tab State
  const [activeTab, setActiveTab] = useState<
    "profile" | "record_work" | "ledger"
  >(
    initialTab === "record_work" && !isNoDailyWorkRole
      ? "record_work"
      : initialTab === "ledger"
        ? "ledger"
        : "profile",
  );

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "record_work" && !isNoDailyWorkRole) {
      setActiveTab("record_work");
    } else if (tab === "ledger" || tab === "profile") {
      setActiveTab(tab);
    }
  }, [searchParams, isNoDailyWorkRole]);

  // Modal Dialog states
  const [showRateDialog, setShowRateDialog] = useState(false);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <Clock className="h-4 w-4 animate-spin text-primary" /> Loading worker
          record...
        </div>
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="space-y-3">
        <Link href="/workers">
          <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Roster
          </Button>
        </Link>
        <div className="p-6 text-center border border-border rounded-lg bg-card">
          <AlertCircle className="h-7 w-7 text-destructive mx-auto mb-2" />
          <h2 className="text-sm font-bold text-foreground">
            Worker Not Found
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            The requested worker record does not exist or was removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Identity Header Card */}
      <WorkerIdentityHeader
        worker={worker}
        canWrite={canWrite}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenRateDialog={() => setShowRateDialog(true)}
        onOpenDeactivateDialog={() => setShowDeactivateDialog(true)}
        hideRecordWork={isNoDailyWorkRole}
      />

      {/* KPI Ledger Summary Cards */}
      <WorkerKPISummary worker={worker} />

      {/* Navigation Tabs */}
      <WorkerDetailTabs
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        canWrite={canWrite}
        logCount={dailyWorkData?.logs?.length ?? 0}
        hideRecordWork={isNoDailyWorkRole}
      />

      {/* Tab 1: Profile & Verification Details */}
      {activeTab === "profile" && (
        <WorkerProfileTab
          worker={worker}
          canWrite={canWrite}
          onOpenRateDialog={() => setShowRateDialog(true)}
        />
      )}

      {/* Tab 2: Embedded Record Daily Work Form */}
      {activeTab === "record_work" && (
        <div className="rounded-b-lg border border-border bg-card p-4 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Coins className="h-4 w-4 text-amber-500" /> Record Daily Work /
                दैनंदिन काम नोंदवा
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Log daily production for {worker.full_name} using Pinjrya count
                or direct quantity.
              </p>
            </div>
          </div>

          <EmbeddedRecordWorkForm
            worker={worker}
            orgId={orgId}
            onSuccess={() => setActiveTab("ledger")}
          />
        </div>
      )}

      {/* Tab 3: Daily Work Ledger & Logs */}
      {activeTab === "ledger" && (
        <WorkerLedgerTab
          worker={worker}
          dailyWorkData={dailyWorkData}
          orgId={orgId}
          canWrite={canWrite}
          onSwitchToRecordWork={() => setActiveTab("record_work")}
        />
      )}

      {/* Rate Change Dialog */}
      {showRateDialog && (
        <RateChangeDialog
          open={showRateDialog}
          onClose={() => setShowRateDialog(false)}
          workerId={worker.id}
          workerName={worker.full_name}
          currentRate={worker.current_rate_amount || 0}
          onSubmitRateChange={async (data) => {
            await changeWorkerRate.mutateAsync(data);
          }}
        />
      )}

      {/* Deactivate Worker Dialog */}
      {showDeactivateDialog && (
        <WorkerDeactivateDialog
          open={showDeactivateDialog}
          onClose={() => setShowDeactivateDialog(false)}
          workerId={worker.id}
          workerName={worker.full_name}
          advanceBalance={worker.advance_balance || 0}
          onConfirmDeactivate={async (id) => {
            await deactivateWorker.mutateAsync(id);
          }}
        />
      )}
    </div>
  );
}
