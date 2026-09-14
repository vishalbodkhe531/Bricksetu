"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Flame,
  GitCommit,
  Hammer,
  Fuel,
  Coins,
  PackageCheck,
  FileText,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { usePermissions } from "@/features/auth/hooks/usePermissions";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios/axiosInstance";

import {
  useBatchDetail,
  useBrickGrades,
} from "@/features/production/hooks/useProduction";
import { BatchStatusBadge } from "@/features/production/components/BatchStatusBadge";
import { BatchProgressBar } from "@/features/production/components/BatchProgressBar";
import { BATCH_DETAIL_TABS } from "@/features/production/constants/production-options";

import { BatchOverviewTab } from "@/features/production/components/tabs/BatchOverviewTab";
import { BatchStageTab } from "@/features/production/components/tabs/BatchStageTab";
import { BatchMouldingTab } from "@/features/production/components/tabs/BatchMouldingTab";
import { BatchConsumptionTab } from "@/features/production/components/tabs/BatchConsumptionTab";
import { BatchExpensesTab } from "@/features/production/components/tabs/BatchExpensesTab";
import { BatchFinishedGoodsTab } from "@/features/production/components/tabs/BatchFinishedGoodsTab";

import { StageTransitionModal } from "@/features/production/components/StageTransitionModal";
import { RecordConsumptionModal } from "@/features/production/components/RecordConsumptionModal";
import { RecordMouldingLogModal } from "@/features/production/components/RecordMouldingLogModal";
import { RecordFinishedGoodsModal } from "@/features/production/components/RecordFinishedGoodsModal";

export default function BatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { profile } = useAuth();
  const orgId = profile?.organization_id ?? "";
  const { canManageProduction: canWrite } = usePermissions();

  const [activeTab, setActiveTab] = useState<string>("overview");

  // Modals state
  const [isStageModalOpen, setIsStageModalOpen] = useState(false);
  const [isMouldingModalOpen, setIsMouldingModalOpen] = useState(false);
  const [isConsumptionModalOpen, setIsConsumptionModalOpen] = useState(false);
  const [isFinishedGoodsModalOpen, setIsFinishedGoodsModalOpen] = useState(false);

  // Detail & lookups queries
  const {
    data: detail,
    isLoading,
    refetch,
    isRefetching,
  } = useBatchDetail(id, orgId);

  const { data: brickGrades = [] } = useBrickGrades(orgId);

  // Fetch active workers for Moulding Log modal
  const { data: workers = [] } = useQuery({
    queryKey: ["workers", "active-list", orgId],
    queryFn: () => api.get("/workers").then((r) => r.data),
    enabled: !!orgId,
  });

  if (isLoading || !detail) {
    return (
      <div className="p-8 space-y-4 max-w-7xl mx-auto">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-24 w-full bg-muted animate-pulse rounded-xl" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const { batch, kpis } = detail;

  const tabIcons: Record<string, React.ElementType> = {
    overview: FileText,
    stages: GitCommit,
    moulding: Hammer,
    consumption: Fuel,
    expenses: Coins,
    finished_goods: PackageCheck,
  };

  return (
    <div className="space-y-4">
      {/* Top Identity Header Card */}
      <div className="rounded-lg border border-border bg-card p-4 shadow-xs relative overflow-hidden space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/production">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-xs">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base font-bold tracking-tight text-foreground font-mono">
                  {batch.batch_number}
                </h1>
                <BatchStatusBadge stage={batch.stage} status={batch.status} />
              </div>

              <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
                <span className="font-medium">
                  Brick Type: <span className="font-semibold text-foreground">{batch.brick_type?.name ?? "Standard Brick"}</span>
                  {batch.brick_type?.dimensions && ` (${batch.brick_type.dimensions})`}
                </span>
                <span className="font-mono">• Created by: {batch.created_by_name ?? "System"}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto shrink-0 sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isRefetching}
              className="rounded-full h-8 px-2.5 sm:px-3.5 text-[11px] font-semibold gap-1.5 w-full sm:w-auto justify-center"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? "animate-spin" : ""}`} /> Refresh
            </Button>

            {canWrite && batch.status === "IN_PROGRESS" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsMouldingModalOpen(true)}
                  className="rounded-full h-8 px-2.5 sm:px-3.5 text-[11px] font-semibold gap-1.5 w-full sm:w-auto justify-center"
                >
                  <Hammer className="h-3.5 w-3.5 text-amber-500" /> Log Moulding
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsConsumptionModalOpen(true)}
                  className="rounded-full h-8 px-2.5 sm:px-3.5 text-[11px] font-semibold gap-1.5 w-full sm:w-auto justify-center"
                >
                  <Fuel className="h-3.5 w-3.5 text-amber-500" /> Material
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setIsStageModalOpen(true)}
                  className="rounded-full h-8 px-2.5 sm:px-3.5 text-[11px] font-semibold gap-1.5 w-full sm:w-auto justify-center"
                >
                  <GitCommit className="h-3.5 w-3.5" /> Advance Stage
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Progress Bar inside Top Card */}
        <BatchProgressBar currentStage={batch.stage} />
      </div>

      {/* Tabs Navigation Bar */}
      <div className="border-b border-border">
        <nav className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-px">
          {BATCH_DETAIL_TABS.map((tab) => {
            const IconComp = tabIcons[tab.id] || FileText;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "border-primary text-primary font-bold bg-primary/5 rounded-t-lg"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40"
                }`}
              >
                <IconComp className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === "overview" && (
          <BatchOverviewTab
            batch={batch}
            kpis={kpis}
            canWrite={canWrite}
            onOpenStageModal={() => setIsStageModalOpen(true)}
            onOpenMouldingModal={() => setIsMouldingModalOpen(true)}
            onOpenConsumptionModal={() => setIsConsumptionModalOpen(true)}
            onOpenFinishedGoodsModal={() => setIsFinishedGoodsModalOpen(true)}
          />
        )}

        {activeTab === "stages" && (
          <BatchStageTab
            batchId={batch.id}
            orgId={orgId}
            canWrite={canWrite}
            onOpenStageModal={() => setIsStageModalOpen(true)}
          />
        )}

        {activeTab === "moulding" && (
          <BatchMouldingTab
            batchId={batch.id}
            orgId={orgId}
            canWrite={canWrite}
            onOpenMouldingModal={() => setIsMouldingModalOpen(true)}
          />
        )}

        {activeTab === "consumption" && (
          <BatchConsumptionTab
            batchId={batch.id}
            orgId={orgId}
            canWrite={canWrite}
            onOpenConsumptionModal={() => setIsConsumptionModalOpen(true)}
          />
        )}

        {activeTab === "expenses" && (
          <BatchExpensesTab batchId={batch.id} orgId={orgId} />
        )}

        {activeTab === "finished_goods" && (
          <BatchFinishedGoodsTab
            batchId={batch.id}
            orgId={orgId}
            canWrite={canWrite}
            onOpenFinishedGoodsModal={() => setIsFinishedGoodsModalOpen(true)}
          />
        )}
      </div>

      {/* Modals */}
      {isStageModalOpen && (
        <StageTransitionModal
          isOpen={isStageModalOpen}
          onClose={() => setIsStageModalOpen(false)}
          batch={batch}
          orgId={orgId}
        />
      )}

      {isConsumptionModalOpen && (
        <RecordConsumptionModal
          isOpen={isConsumptionModalOpen}
          onClose={() => setIsConsumptionModalOpen(false)}
          batchId={batch.id}
          orgId={orgId}
        />
      )}

      {isMouldingModalOpen && (
        <RecordMouldingLogModal
          isOpen={isMouldingModalOpen}
          onClose={() => setIsMouldingModalOpen(false)}
          batchId={batch.id}
          orgId={orgId}
          workers={workers}
        />
      )}

      {isFinishedGoodsModalOpen && (
        <RecordFinishedGoodsModal
          isOpen={isFinishedGoodsModalOpen}
          onClose={() => setIsFinishedGoodsModalOpen(false)}
          batchId={batch.id}
          orgId={orgId}
          grades={brickGrades}
          kpis={kpis}
        />
      )}
    </div>
  );
}
