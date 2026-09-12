"use client";

import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useRecordAdvance } from "@/features/workers/hooks/useWorkers";

interface AdvanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  workerId: string;
  workerName: string;
  amount: string;
  dateGiven: string;
  reason: string;
  onSetField: (field: "amount" | "dateGiven" | "reason", value: string) => void;
  orgId: string;
}

export function AdvanceModal({
  isOpen,
  onClose,
  workerId,
  workerName,
  amount,
  dateGiven,
  reason,
  onSetField,
  orgId,
}: AdvanceModalProps) {
  const recordAdvance = useRecordAdvance(orgId, workerId);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workerId) return;

    recordAdvance.mutate(
      {
        worker_id: workerId,
        amount: parseFloat(amount),
        date_given: dateGiven,
        reason: reason || null,
      },
      {
        onSuccess: () => {
          toast.success("Advance recorded successfully");
          onClose();
        },
        onError: (err: Error) => {
          toast.error(err.message || "Failed to record advance");
        },
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <h3 className="text-sm font-bold text-foreground">
            Give Advance to {workerName}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
              Amount (₹) *
            </label>
            <Input
              type="number"
              step="0.01"
              min="1"
              required
              value={amount}
              onChange={(e) => onSetField("amount", e.target.value)}
              placeholder="e.g. 1000"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
              Date Given *
            </label>
            <Input
              type="date"
              required
              value={dateGiven}
              onChange={(e) => onSetField("dateGiven", e.target.value)}
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
              Reason / Notes
            </label>
            <Input
              type="text"
              value={reason}
              onChange={(e) => onSetField("reason", e.target.value)}
              placeholder="e.g. Festival advance"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={recordAdvance.isPending}>
              {recordAdvance.isPending ? "Saving..." : "Record Advance"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
