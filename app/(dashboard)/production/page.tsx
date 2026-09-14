"use client";

import React, { useState } from "react";
import { Plus, Factory, Flame, Hammer, Target, TrendingUp, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table/data-table";
import { useAuth } from "@/context/AuthContext";
import { usePermissions } from "@/features/auth/hooks/usePermissions";
import { KPIGrid, KPICardItem } from "@/features/workers/components/KPICard";
import {
  useProductionBatches,
  useBrickTypes,
  useProductionAnalytics,
} from "@/features/production/hooks/useProduction";
import { getProductionColumns } from "@/features/production/components/columns/production-columns";
import { BATCH_FILTER_TABS } from "@/features/production/constants/production-options";
import { CreateBatchModal } from "@/features/production/components/CreateBatchModal";
import { formatCostPerBrick } from "@/features/production/utils/production-calculations";

export default function ProductionPage() {
  const { profile } = useAuth();
  const orgId = profile?.organization_id ?? "";
  const { canManageProduction } = usePermissions();

  const [selectedStageTab, setSelectedStageTab] = useState("ALL");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Queries
  const filterParams = React.useMemo(() => {
    if (selectedStageTab === "IN_PROGRESS") {
      return { status: "IN_PROGRESS" };
    }
    if (selectedStageTab !== "ALL") {
      return { stage: selectedStageTab };
    }
    return undefined;
  }, [selectedStageTab]);

  const { data: batches = [], isLoading, refetch, isRefetching } = useProductionBatches(orgId, filterParams);

  // Lazy load brick types only when Create Modal opens
  const { data: brickTypes = [] } = useBrickTypes(orgId, { enabled: !!orgId && isCreateModalOpen });
  const { data: analytics } = useProductionAnalytics(orgId);

  const columns = getProductionColumns();

  const kpiItems: KPICardItem[] = [
    {
      id: "total_batches",
      label: "Total Bhatti",
      value: analytics?.total_batches ?? 0,
      subtext: `Active: ${analytics?.active_batches ?? 0}`,
      icon: Factory,
      iconColor: "text-primary",
    },
    {
      id: "moulded_bricks",
      label: "Moulded Bricks",
      value: (analytics?.total_bricks_moulded ?? 0).toLocaleString(),
      subtext: "Total raw bricks",
      icon: Hammer,
      iconColor: "text-amber-500",
      valueColor: "text-amber-500",
    },
    {
      id: "fired_good",
      label: "Fired Good Bricks",
      value: (analytics?.total_fired_good ?? 0).toLocaleString(),
      subtext: "Ready for sale",
      icon: Flame,
      iconColor: "text-emerald-500",
      valueColor: "text-emerald-500",
    },
    {
      id: "avg_yield",
      label: "Average Yield",
      value: `${analytics?.avg_yield_percentage ?? 0}%`,
      subtext: "Output ratio",
      icon: Target,
      iconColor: "text-emerald-500",
    },
    {
      id: "cost_per_brick",
      label: "Avg Cost / Brick",
      value: formatCostPerBrick(analytics?.avg_cost_per_brick_paise ?? 0),
      subtext: "Production cost",
      icon: TrendingUp,
      iconColor: "text-primary",
    },
    {
      id: "completed_batches",
      label: "Completed Bhatti",
      value: analytics?.completed_batches ?? 0,
      subtext: "Full lifecycle complete",
      icon: Factory,
      iconColor: "text-emerald-500",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-4 rounded-xl border border-border shadow-xs">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
            <Factory className="h-5 w-5 text-primary" /> Production & Bhatti Operations / भट्टी उत्पादन व्यवस्थापन
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Track brick production lifecycle, bhatti batches, stage transitions, moulding logs, and material consumption
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="gap-1 text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? "animate-spin" : ""}`} /> Refresh
          </Button>

          {canManageProduction && (
            <Button size="sm" onClick={() => setIsCreateModalOpen(true)} className="gap-1 text-xs">
              <Plus className="h-4 w-4" /> Create Production Bhatti / नवीन भट्टी
            </Button>
          )}
        </div>
      </div>

      {/* Production Analytics Top KPI Cards (3 columns x 2 rows) */}
      <KPIGrid items={kpiItems} columns={3} />

      {/* Stage Tab Filters & Data Table */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-xs space-y-4">
        {/* Stage Tabs Bar */}
        <div className="flex items-center gap-1 border-b border-border pb-3 overflow-x-auto no-scrollbar">
          {BATCH_FILTER_TABS.map((tab) => {
            const isActive = selectedStageTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedStageTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {tab.label}
                <span className="opacity-75 font-normal ml-1">({tab.labelMarathi})</span>
              </button>
            );
          })}
        </div>

        {/* Table Header & Search */}
        <DataTable
          columns={columns}
          data={batches}
          loading={isLoading}
          searchPlaceholder="Search by batch number or brick type..."
        />
      </div>

      {/* Create Batch Modal */}
      {isCreateModalOpen && (
        <CreateBatchModal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            if (selectedStageTab !== "ALL" && selectedStageTab !== "MOULDING" && selectedStageTab !== "IN_PROGRESS") {
              setSelectedStageTab("ALL");
            }
            refetch();
          }}
          orgId={orgId}
          brickTypes={brickTypes}
        />
      )}
    </div>
  );
}
