"use client";

import React from "react";
import { Factory, Calendar, Clock, GitCommit, Layers, Hammer, Fuel, Coins, PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Batch, BatchKPIs } from "../../types/production.types";
import { BatchProgressBar } from "../BatchProgressBar";
import { BatchStatusBadge } from "../BatchStatusBadge";
import { formatCostPerBrick, formatPaiseToRupees } from "../../utils/production-calculations";
import { formatDateDdMmYyyy } from "@/lib/utils";

interface BatchOverviewTabProps {
  batch: Batch;
  kpis: BatchKPIs;
  canWrite: boolean;
  onOpenStageModal: () => void;
  onOpenMouldingModal: () => void;
  onOpenConsumptionModal: () => void;
  onOpenFinishedGoodsModal: () => void;
}

export function BatchOverviewTab({
  batch,
  kpis,
  canWrite,
  onOpenStageModal,
  onOpenMouldingModal,
  onOpenConsumptionModal,
  onOpenFinishedGoodsModal,
}: BatchOverviewTabProps) {
  return (
    <div className="space-y-6">
      {/* Batch Header Progress Card */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-foreground font-mono">
                {batch.batch_number}
              </h2>
              <BatchStatusBadge stage={batch.stage} status={batch.status} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Brick Type: <span className="font-semibold text-foreground">{batch.brick_type?.name ?? "Standard Brick"}</span>
              {batch.brick_type?.dimensions && ` (${batch.brick_type.dimensions})`}
            </p>
          </div>

          {canWrite && batch.status === "IN_PROGRESS" && (
            <div className="flex items-center gap-2 flex-wrap">
              <Button size="sm" variant="outline" onClick={onOpenMouldingModal}>
                <Hammer className="h-3.5 w-3.5 text-amber-500" /> Log Moulding
              </Button>
              <Button size="sm" variant="outline" onClick={onOpenConsumptionModal}>
                <Fuel className="h-3.5 w-3.5 text-amber-500" /> Record Material
              </Button>
              <Button size="sm" variant="default" onClick={onOpenStageModal}>
                <GitCommit className="h-3.5 w-3.5" /> Advance Stage
              </Button>
              {batch.stage === "SORTING" && (
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={onOpenFinishedGoodsModal}>
                  <PackageCheck className="h-3.5 w-3.5" /> Transfer Stock
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <BatchProgressBar currentStage={batch.stage} />
      </div>

      {/* Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Production Details */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border pb-2">
            <Factory className="h-4 w-4 text-primary" /> Production Information / बॅच तपशील
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted-foreground">Start Date / सुरुवात:</span>
              <span className="font-mono font-semibold">{formatDateDdMmYyyy(batch.start_date)}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted-foreground">End Date / पूर्ण तारीख:</span>
              <span className="font-mono font-semibold">{batch.end_date ? formatDateDdMmYyyy(batch.end_date) : "In Progress / चालू"}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted-foreground">Target Bricks / उद्दिष्ट:</span>
              <span className="font-mono font-bold text-foreground">{kpis.target_quantity.toLocaleString()}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted-foreground">Moulded Bricks / पाडलेली वीट:</span>
              <span className="font-mono font-semibold text-amber-500">{kpis.moulded_quantity.toLocaleString()}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted-foreground">Fired Good / पक्की वीट:</span>
              <span className="font-mono font-bold text-emerald-500">{kpis.fired_good_quantity.toLocaleString()}</span>
            </div>

            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Damaged & Loss / नुकसान:</span>
              <span className="font-mono font-semibold text-destructive">{kpis.damaged_quantity.toLocaleString()} ({kpis.wastage_percentage}%)</span>
            </div>
          </div>
        </div>

        {/* Financial Breakdown */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border pb-2">
            <Coins className="h-4 w-4 text-amber-500" /> Financial & Costing Breakdown / उत्पादन खर्च
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted-foreground">Labour Moulding Cost / पाथाई मजुरी:</span>
              <span className="font-mono font-semibold">{formatPaiseToRupees(kpis.total_moulding_labour_cost_paise)}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted-foreground">Fuel & Material Cost / इंधन खर्च:</span>
              <span className="font-mono font-semibold">{formatPaiseToRupees(kpis.total_material_cost_paise)}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted-foreground">Other Expenses / इतर खर्च:</span>
              <span className="font-mono font-semibold">{formatPaiseToRupees(kpis.total_expense_cost_paise)}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-border/50 font-bold bg-muted/30 p-1.5 rounded">
              <span className="text-foreground">Total Production Cost / एकूण खर्च:</span>
              <span className="font-mono text-primary">{formatPaiseToRupees(kpis.total_production_cost_paise)}</span>
            </div>

            <div className="flex justify-between py-1 font-bold text-emerald-500 bg-emerald-500/10 p-1.5 rounded border border-emerald-500/20">
              <span>Cost Per Brick / एका विटेचा खर्च:</span>
              <span className="font-mono">{formatCostPerBrick(kpis.cost_per_brick_paise)}</span>
            </div>
          </div>
        </div>
      </div>

      {batch.notes && (
        <div className="bg-card border border-border rounded-xl p-4 shadow-xs">
          <h4 className="text-xs font-semibold text-muted-foreground mb-1">Notes / टीप:</h4>
          <p className="text-xs text-foreground bg-muted/30 p-2.5 rounded border border-border/50">{batch.notes}</p>
        </div>
      )}
    </div>
  );
}
