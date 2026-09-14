"use client";

import React, { useState } from "react";
import { Hammer, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useCreateBatchMouldingLog } from "../hooks/useProduction";
import type { Worker } from "@/features/workers/types/worker.types";

import { DatePicker } from "@/components/ui/date-picker";
import { FormattedNumberInput } from "@/components/ui/formatted-number-input";

interface RecordMouldingLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  batchId: string;
  orgId: string;
  workers: Worker[];
}

export function RecordMouldingLogModal({
  isOpen,
  onClose,
  batchId,
  orgId,
  workers,
}: RecordMouldingLogModalProps) {
  const createLog = useCreateBatchMouldingLog(batchId, orgId);

  const [workerId, setWorkerId] = useState("");
  const [workDate, setWorkDate] = useState("");
  const [bricksMoulded, setBricksMoulded] = useState("");
  const [ratePer1000, setRatePer1000] = useState("");
  const [notes, setNotes] = useState("");

  React.useEffect(() => {
    if (!workDate) {
      setWorkDate(new Date().toISOString().split("T")[0]);
    }
  }, [workDate]);

  if (!isOpen) return null;

  const handleWorkerChange = (wId: string) => {
    setWorkerId(wId);
    const worker = workers.find((w) => w.id === wId);
    if (worker && worker.current_rate_amount) {
      setRatePer1000(worker.current_rate_amount.toString());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!workerId) {
      toast.error("Please select a worker");
      return;
    }

    const moulded = parseInt(bricksMoulded, 10);
    const rateRupees = parseFloat(ratePer1000);

    if (!moulded || moulded <= 0) {
      toast.error("Please enter bricks moulded");
      return;
    }

    const ratePaise = Math.round((rateRupees || 0) * 100);

    createLog.mutate(
      {
        worker_id: workerId,
        work_date: workDate,
        bricks_moulded: moulded,
        rate_per_1000_paise: ratePaise,
        notes: notes || null,
      },
      {
        onSuccess: () => {
          toast.success("Moulding log recorded / पाथाई नोंद झाली!");
          onClose();
          setWorkerId("");
          setBricksMoulded("");
          setRatePer1000("");
          setNotes("");
        },
        onError: (err: Error) => {
          toast.error(err.message || "Failed to record moulding log");
        },
      },
    );
  };

  const calculatedEarned =
    ((parseInt(bricksMoulded, 10) || 0) / 1000) * (parseFloat(ratePer1000) || 0);

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Hammer className="h-5 w-5 text-amber-500" /> Log Daily Moulding / पाथाई नोंदवा
          </h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground rounded p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
              Select Worker / कामगार निवडा *
            </label>
            <select
              value={workerId}
              onChange={(e) => handleWorkerChange(e.target.value)}
              required
              className="w-full rounded-md border border-border bg-card px-3 py-2 text-xs text-foreground focus:ring-1 focus:ring-primary"
            >
              <option value="">-- Choose Worker / कामगार निवडा --</option>
              {workers.some((w) => ['BHATKAR_PATHADI', 'PATHADI', 'KACHHA_MAAL'].includes(w.category?.toUpperCase() || '')) ? (
                <>
                  <optgroup label="Pathadi / Moulding Workers (पाथाई कामगार)">
                    {workers
                      .filter((w) => ['BHATKAR_PATHADI', 'PATHADI', 'KACHHA_MAAL'].includes(w.category?.toUpperCase() || ''))
                      .map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.full_name} ({w.category}) — Rate: ₹{w.current_rate_amount || 0}/1000
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="Other Workers (इतर कामगार)">
                    {workers
                      .filter((w) => !['BHATKAR_PATHADI', 'PATHADI', 'KACHHA_MAAL'].includes(w.category?.toUpperCase() || ''))
                      .map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.full_name} ({w.category}) — Rate: ₹{w.current_rate_amount || 0}/1000
                        </option>
                      ))}
                  </optgroup>
                </>
              ) : (
                workers.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.full_name} ({w.category}) — Rate: ₹{w.current_rate_amount || 0}/1000
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                Work Date / तारीख (DD-MM-YYYY) *
              </label>
              <DatePicker
                value={workDate}
                onChange={setWorkDate}
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                Bricks Moulded / विटा संख्या *
              </label>
              <FormattedNumberInput
                value={bricksMoulded}
                onChange={setBricksMoulded}
                placeholder="e.g. 1,500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                Rate per 1,000 Bricks (₹) *
              </label>
              <FormattedNumberInput
                allowDecimal
                value={ratePer1000}
                onChange={setRatePer1000}
                placeholder="e.g. 450"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                Total Earnings (₹)
              </label>
              <div className="h-9 rounded-md border border-border bg-muted/30 px-3 py-2 text-xs font-mono font-bold text-emerald-500 flex items-center">
                ₹{calculatedEarned.toFixed(2)}
              </div>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
              Notes / टीप
            </label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Morning shift moulding batch"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createLog.isPending}>
              {createLog.isPending ? "Saving..." : "Save Moulding Log / नोंद जतन करा"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
