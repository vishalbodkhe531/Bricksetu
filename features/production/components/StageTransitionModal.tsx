"use client";

import React, { useState, useEffect } from "react";
import { GitCommit, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useCreateStageTransition } from "../hooks/useProduction";
import type { Batch, BatchStage } from "../types/production.types";
import { getNextStage, getStageOption } from "../utils/stage-helpers";

import { DatePicker } from "@/components/ui/date-picker";
import { FormattedNumberInput } from "@/components/ui/formatted-number-input";

interface StageTransitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  batch: Batch;
  orgId: string;
}

export function StageTransitionModal({
  isOpen,
  onClose,
  batch,
  orgId,
}: StageTransitionModalProps) {
  const createTransition = useCreateStageTransition(batch.id, orgId);

  const nextStage = getNextStage(batch.stage);
  const currentOpt = getStageOption(batch.stage);
  const nextOpt = nextStage ? getStageOption(nextStage) : null;

  const [toStage, setToStage] = useState<BatchStage>(nextStage || "COMPLETED");
  const [transitionDate, setTransitionDate] = useState("");
  const [inputQuantity, setInputQuantity] = useState("");
  const [outputGoodQuantity, setOutputGoodQuantity] = useState("");
  const [damagedQuantity, setDamagedQuantity] = useState("0");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!transitionDate) {
      setTransitionDate(new Date().toISOString().split("T")[0]);
    }
  }, [transitionDate]);

  useEffect(() => {
    if (nextStage) {
      setToStage(nextStage);
    }
    let baseQty = batch.moulded_quantity || batch.target_quantity;
    if (batch.stage === "DRYING" && batch.dried_quantity > 0) {
      baseQty = batch.dried_quantity;
    } else if ((batch.stage === "FIRING" || batch.stage === "SORTING") && batch.fired_good_quantity > 0) {
      baseQty = batch.fired_good_quantity;
    }
    setInputQuantity(baseQty.toString());
    setOutputGoodQuantity(baseQty.toString());
  }, [batch, nextStage]);

  if (!isOpen || !nextStage) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const inputQty = parseInt(inputQuantity, 10) || 0;
    const outputQty = parseInt(outputGoodQuantity, 10) || 0;
    const damagedQty = parseInt(damagedQuantity, 10) || 0;

    createTransition.mutate(
      {
        from_stage: batch.stage,
        to_stage: toStage,
        transition_date: transitionDate,
        input_quantity: inputQty,
        output_good_quantity: outputQty,
        damaged_quantity: damagedQty,
        notes: notes || null,
      },
      {
        onSuccess: () => {
          toast.success(
            `Stage updated to ${nextOpt?.label} / टप्पा अपडेट झाला!`,
          );
          onClose();
        },
        onError: (err: Error) => {
          toast.error(err.message || "Failed to record stage transition");
        },
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <GitCommit className="h-5 w-5 text-primary" /> Advance Stage / टप्पा
            पुढे न्या
          </h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground rounded p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="bg-muted/40 p-3 rounded-lg border border-border flex items-center justify-between text-xs font-semibold">
          <div className="space-y-0.5">
            <span className="text-muted-foreground text-[10px] block">
              Current Stage
            </span>
            <span className={currentOpt.colorClass}>
              {currentOpt.label} ({currentOpt.labelMarathi})
            </span>
          </div>

          <span className="text-muted-foreground font-bold">➔</span>

          <div className="space-y-0.5 text-right">
            <span className="text-muted-foreground text-[10px] block">
              Next Stage
            </span>
            <span className={nextOpt?.colorClass}>
              {nextOpt?.label} ({nextOpt?.labelMarathi})
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
              Transition Date / तारीख (DD-MM-YYYY) *
            </label>
            <DatePicker
              value={transitionDate}
              onChange={setTransitionDate}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                Input Qty / सुरुवातीस *
              </label>
              <FormattedNumberInput
                value={inputQuantity}
                onChange={setInputQuantity}
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                Good Output / चांगली *
              </label>
              <FormattedNumberInput
                value={outputGoodQuantity}
                onChange={setOutputGoodQuantity}
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                Damaged / खराब *
              </label>
              <FormattedNumberInput
                value={damagedQuantity}
                onChange={setDamagedQuantity}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
              Notes / कारण किंवा टीप
            </label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Drying completed, 200 bricks cracked"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createTransition.isPending}>
              {createTransition.isPending
                ? "Updating..."
                : `Confirm -> Move to ${nextOpt?.label}`}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
