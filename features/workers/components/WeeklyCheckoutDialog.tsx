"use client";

import React, { useState } from "react";
import { CheckCircle2, Coins, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatWeekLabel } from "../utils/getWeekBoundary";
import type { WeekBucket } from "../hooks/useWeeklyGroupedLogs";
import type { Worker, SettlementInput } from "../types/worker.types";

interface WeeklyCheckoutDialogProps {
  open: boolean;
  onClose: () => void;
  worker: Worker;
  week: WeekBucket;
  onConfirmCheckout: (input: SettlementInput) => Promise<void>;
}

export function WeeklyCheckoutDialog({
  open,
  onClose,
  worker,
  week,
  onConfirmCheckout,
}: WeeklyCheckoutDialogProps) {
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const input: SettlementInput = {
        worker_id: worker.id,
        period_start: week.weekStartSaturday,
        period_end: week.weekEndFriday,
        gross_wage: week.totalEarnedAmount,
        advances_deducted: 0,
        net_payable: week.totalEarnedAmount,
      };

      await onConfirmCheckout(input);
      toast.success(
        `Weekly checkout completed for ${worker.full_name} / भरणा पूर्ण झाला!`,
      );
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Failed to complete weekly checkout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                Weekly Settlement Checkout
              </h3>
              <p className="text-xs text-muted-foreground">साप्ताहिक भरणा</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground rounded p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3.5 py-1">
          {/* Worker Info Card */}
          <div className="p-3 rounded-lg border border-border bg-muted/40 flex items-center justify-between text-xs">
            <div>
              <p className="font-bold text-foreground">{worker.full_name}</p>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider mt-0.5">
                Category: {worker.category || "Piece Rate Worker"}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                {week.logs.length} Days Logged
              </span>
            </div>
          </div>

          {/* Week Range */}
          <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 dark:bg-amber-950/30 text-xs">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Settlement Period / कालावधी:
            </p>
            <p className="font-bold text-amber-700 dark:text-amber-300 mt-1">
              {formatWeekLabel(week.weekStartSaturday, week.weekEndFriday)}
            </p>
          </div>

          {/* Financial Summary Breakdown */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-lg border border-border bg-card">
              <p className="text-[10px] text-muted-foreground uppercase font-semibold">
                Billable Bricks
              </p>
              <p className="text-sm font-extrabold text-foreground font-mono mt-0.5">
                {week.totalBillableQty.toLocaleString()} pcs
              </p>
            </div>
            <div className="p-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-950/30">
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-semibold">
                Weekly Earned Amount
              </p>
              <p className="text-sm font-extrabold text-emerald-700 dark:text-emerald-300 font-mono mt-0.5">
                ₹{week.totalEarnedAmount.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={loading}
          >
            Cancel / रद्द करा
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleConfirm}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Coins className="h-4 w-4" />
            )}
            Confirm & Mark Paid / पैसे दिले
          </Button>
        </div>
      </div>
    </div>
  );
}
