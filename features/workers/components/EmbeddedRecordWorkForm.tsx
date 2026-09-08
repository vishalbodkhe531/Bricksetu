"use client";

import React, { useState } from "react";
import {
  Calendar,
  Coins,
  Calculator,
  Info,
  CheckCircle2,
  Loader2,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { workersApi } from "@/features/workers/api/workers.api";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/queryKeys";

import { isRateEditableForCategory } from "@/features/workers/utils/rate-permissions";

interface EmbeddedRecordWorkFormProps {
  worker: {
    id: string;
    full_name: string;
    category?: string | null;
    current_rate_amount?: number;
  };
  orgId: string;
  onSuccess?: () => void;
}

const VALID_CATEGORIES = ["AALYAWALE", "KACHA_MAAL", "PAKKA_MAAL", "BHATKAR"] as const;

export function EmbeddedRecordWorkForm({
  worker,
  orgId,
  onSuccess,
}: EmbeddedRecordWorkFormProps) {
  const qc = useQueryClient();

  const [workDate, setWorkDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [entryMode, setEntryMode] = useState<
    "PINJRI_COUNT" | "DIRECT_COUNT" | "SHIFT_COUNT"
  >("PINJRI_COUNT");

  const [pinjriCount, setPinjriCount] = useState<string>("50");
  const [directQty, setDirectQty] = useState<string>("1000");
  const [shiftCount, setShiftCount] = useState<string>("1");

  const [batchNumber, setBatchNumber] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Determine category from worker profile or default to AALYAWALE
  const category = VALID_CATEGORIES.includes(worker.category as any)
    ? (worker.category as "AALYAWALE" | "KACHA_MAAL" | "PAKKA_MAAL" | "BHATKAR")
    : "AALYAWALE";

  const isRateEditable = isRateEditableForCategory(category);

  const [customRate, setCustomRate] = useState<string>(
    worker.current_rate_amount !== undefined && worker.current_rate_amount !== null
      ? String(worker.current_rate_amount)
      : "0"
  );

  const effectiveRate = parseFloat(customRate) || 0;

  // Pinjri rule: 1 Pinjri = 22 raw bricks made, 20 billable bricks earned
  const numPinjri = parseFloat(pinjriCount) || 0;
  const pinjriRawMade = Math.round(numPinjri * 22);
  const pinjriBillableEarned = Math.round(numPinjri * 20);
  const pinjriEarnedAmount = (pinjriBillableEarned * effectiveRate) / 1000;

  // Direct piece
  const numDirect = parseFloat(directQty) || 0;
  const directEarnedAmount = (numDirect * effectiveRate) / 1000;

  // Shift calculation
  const numShift = parseFloat(shiftCount) || 1;
  const shiftEarnedAmount = numShift * effectiveRate;

  // Summary computed values
  const physicalQty =
    entryMode === "PINJRI_COUNT"
      ? pinjriRawMade
      : entryMode === "DIRECT_COUNT"
      ? numDirect
      : Math.round(numShift * 1000);

  const billableQty =
    entryMode === "PINJRI_COUNT"
      ? pinjriBillableEarned
      : entryMode === "DIRECT_COUNT"
      ? numDirect
      : Math.round(numShift * 1000);

  const earnedAmount =
    entryMode === "PINJRI_COUNT"
      ? pinjriEarnedAmount
      : entryMode === "DIRECT_COUNT"
      ? directEarnedAmount
      : shiftEarnedAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!workDate) {
      toast.error("Please select a work date");
      return;
    }

    if (entryMode === "PINJRI_COUNT" && numPinjri <= 0) {
      toast.error("Please enter a valid Pinjri count");
      return;
    }

    if (entryMode === "DIRECT_COUNT" && numDirect <= 0) {
      toast.error("Please enter a valid brick quantity");
      return;
    }

    const inputQuantity =
      entryMode === "PINJRI_COUNT"
        ? numPinjri
        : entryMode === "SHIFT_COUNT"
        ? numShift
        : numDirect;

    setIsSubmitting(true);

    try {
      await workersApi.recordDailyWork({
        worker_id: worker.id,
        work_date: workDate,
        category,
        entry_mode: entryMode,
        input_quantity: inputQuantity,
        rate_per_unit: effectiveRate,
        reference_no: batchNumber || null,
        notes: notes || null,
      });

      toast.success(
        `Daily work recorded successfully: ₹${earnedAmount.toFixed(2)}`
      );

      // Invalidate all worker queries so ledger table & summaries refresh instantly
      await qc.invalidateQueries({
        queryKey: queryKeys.workers.all,
        refetchType: "all",
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to record daily work log");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Top Banner Info */}
      <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Coins className="h-4 w-4 text-amber-500 shrink-0" />
          <div>
            <span className="font-bold text-foreground">
              {worker.full_name}
            </span>{" "}
            <span className="text-muted-foreground">
              • Category: <strong className="text-amber-500 font-mono">{category}</strong>
            </span>{" "}
            <span className="text-muted-foreground">
              • Current Rate: ₹{effectiveRate.toFixed(2)} / 1,000 bricks
            </span>
          </div>
        </div>
        <span className="text-[10px] font-mono font-semibold bg-amber-500/20 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded">
          Quick Entry / जलद नोंद
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Column: Form Fields */}
        <div className="space-y-3.5">
          {/* Work Date */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-primary" /> Work Date / कामाची
              तारीख
            </label>
            <input
              type="date"
              value={workDate}
              onChange={(e) => setWorkDate(e.target.value)}
              className="w-full bg-background border border-input rounded-md px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              required
            />
          </div>

          {/* Entry Mode Selector */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-primary" /> Work Type / काम प्रकार
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setEntryMode("PINJRI_COUNT")}
                className={`py-2 px-2 rounded-md text-xs font-semibold border transition-all flex flex-col items-center justify-center gap-0.5 ${
                  entryMode === "PINJRI_COUNT"
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-muted/30 text-muted-foreground border-border hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <span>Pinjrya / पिंजऱ्या</span>
                <span className="text-[9px] opacity-80 font-normal">
                  (22/20 Rule)
                </span>
              </button>

              <button
                type="button"
                onClick={() => setEntryMode("DIRECT_COUNT")}
                className={`py-2 px-2 rounded-md text-xs font-semibold border transition-all flex flex-col items-center justify-center gap-0.5 ${
                  entryMode === "DIRECT_COUNT"
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-muted/30 text-muted-foreground border-border hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <span>Direct Bricks</span>
                <span className="text-[9px] opacity-80 font-normal">
                  (Exact Count)
                </span>
              </button>

              <button
                type="button"
                onClick={() => setEntryMode("SHIFT_COUNT")}
                className={`py-2 px-2 rounded-md text-xs font-semibold border transition-all flex flex-col items-center justify-center gap-0.5 ${
                  entryMode === "SHIFT_COUNT"
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-muted/30 text-muted-foreground border-border hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <span>Shift Work</span>
                <span className="text-[9px] opacity-80 font-normal">
                  (Day/Half)
                </span>
              </button>
            </div>
          </div>

          {/* Mode-Specific Input Fields */}
          {entryMode === "PINJRI_COUNT" && (
            <div className="space-y-1.5 bg-amber-500/5 p-3 rounded-lg border border-amber-500/20">
              <label className="text-[11px] font-bold text-amber-600 dark:text-amber-400 mb-1 flex items-center justify-between">
                <span>Pinjrya / पिंजऱ्या (Count)</span>
                <span className="text-[10px] font-normal text-muted-foreground">
                  १ पिंजरी = २२ विटा
                </span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={pinjriCount}
                  onChange={(e) => setPinjriCount(e.target.value)}
                  placeholder="e.g. 50"
                  className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm font-bold font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
                <span className="absolute right-3 top-2.5 text-xs text-muted-foreground font-semibold">
                  Pinjri
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                <Info className="h-3 w-3 text-amber-500 shrink-0" /> Standard Rule:
                22 raw bricks made yielding 20 billable bricks earned per Pinjri.
              </p>
            </div>
          )}

          {entryMode === "DIRECT_COUNT" && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-muted-foreground mb-1 block">
                Total Bricks Quantity / विटांची संख्या
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={directQty}
                onChange={(e) => setDirectQty(e.target.value)}
                placeholder="e.g. 1000"
                className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm font-bold font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          )}

          {entryMode === "SHIFT_COUNT" && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-muted-foreground mb-1 block">
                Shift Count / शिफ्ट प्रमाण
              </label>
              <select
                value={shiftCount}
                onChange={(e) => setShiftCount(e.target.value)}
                className="w-full bg-background border border-input rounded-md px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="1">1.0 Full Shift / पूर्ण दिवस</option>
                <option value="0.5">0.5 Half Shift / अर्धा दिवस</option>
                <option value="1.5">1.5 Shift</option>
                <option value="2">2.0 Double Shift</option>
              </select>
            </div>
          )}

          {/* Rate Input Field */}
          <div className="space-y-1 bg-muted/20 p-2.5 rounded-md border border-border">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Coins className="h-3.5 w-3.5 text-amber-500" />
                Work Rate / दर ({entryMode === "SHIFT_COUNT" ? "₹ / shift" : "₹ / 1,000 bricks"})
              </span>
              {isRateEditable ? (
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                  Editable Rate
                </span>
              ) : (
                <span className="text-[10px] text-muted-foreground font-mono">
                  Fixed Rate
                </span>
              )}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-xs font-semibold text-muted-foreground">
                ₹
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={customRate}
                onChange={(e) => setCustomRate(e.target.value)}
                disabled={!isRateEditable}
                placeholder="Rate"
                className={`w-full bg-background border border-input rounded-md pl-7 pr-3 py-1.5 text-xs font-bold font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                  !isRateEditable ? "opacity-70 cursor-not-allowed bg-muted/50" : ""
                }`}
              />
            </div>
          </div>

          {/* Batch Number & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground block mb-1">
                Batch / Reference (Optional)
              </label>
              <input
                type="text"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                placeholder="e.g. Batch-A1"
                className="w-full bg-background border border-input rounded-md px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label className="text-[10px] font-semibold text-muted-foreground block mb-1">
                Notes / टिप्पणी (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Section 4 Moulding"
                className="w-full bg-background border border-input rounded-md px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Live Computation Preview & Submit Card */}
        <div className="flex flex-col justify-between p-4 bg-muted/20 border border-border rounded-lg space-y-4">
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-border pb-2">
              <Calculator className="h-4 w-4 text-emerald-500" /> Computation Summary
            </h4>

            {entryMode === "PINJRI_COUNT" && (
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-border/50">
                  <span className="text-muted-foreground">Pinjri Count:</span>
                  <span className="font-bold font-mono text-foreground">
                    {numPinjri} Pinjri
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-border/50">
                  <span className="text-muted-foreground">
                    Raw Made (22 Ratio):
                  </span>
                  <span className="font-semibold font-mono text-foreground">
                    {pinjriRawMade.toLocaleString()} Bricks
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-border/50">
                  <span className="text-muted-foreground">
                    Billable (20 Ratio):
                  </span>
                  <span className="font-bold font-mono text-primary">
                    {pinjriBillableEarned.toLocaleString()} Bricks
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-border/50">
                  <span className="text-muted-foreground">Pay Rate:</span>
                  <span className="font-mono text-foreground">
                    ₹{effectiveRate.toFixed(2)} / 1K
                  </span>
                </div>
              </div>
            )}

            {entryMode !== "PINJRI_COUNT" && (
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-border/50">
                  <span className="text-muted-foreground">Recorded Qty:</span>
                  <span className="font-bold font-mono text-foreground">
                    {physicalQty.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-border/50">
                  <span className="text-muted-foreground">Pay Rate:</span>
                  <span className="font-mono text-foreground">
                    ₹{effectiveRate.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* Total Highlight Card */}
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-center space-y-0.5 mt-2">
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                Total Earned Amount / एकुण मजुरी
              </span>
              <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 block tabular-nums">
                ₹{earnedAmount.toFixed(2)}
              </span>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full gap-2 text-xs h-10 font-bold shadow-xs bg-amber-500 hover:bg-amber-600 text-slate-950 hover:text-white transition-all"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving Log...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" /> Save Daily Work / काम सेव्ह करा
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
