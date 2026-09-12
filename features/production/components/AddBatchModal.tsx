"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useCreateProductionBatch } from "@/features/production/hooks/useProduction";

interface AddBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  orgId: string;
  brickTypes: any[];
  workers: any[];
}

export function AddBatchModal({
  isOpen,
  onClose,
  orgId,
  brickTypes,
  workers,
}: AddBatchModalProps) {
  const createBatch = useCreateProductionBatch(orgId);

  const [brickTypeId, setBrickTypeId] = useState("");
  const [workerId, setWorkerId] = useState("");
  const [productionDate, setProductionDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [bricksMoulded, setBricksMoulded] = useState("");
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    createBatch.mutate(
      {
        brick_type_id: brickTypeId,
        worker_id: workerId || null,
        production_date: productionDate,
        bricks_moulded: parseInt(bricksMoulded, 10),
        notes: notes || null,
      },
      {
        onSuccess: () => {
          toast.success("Production batch logged successfully");
          onClose();
          setBrickTypeId("");
          setWorkerId("");
          setBricksMoulded("");
          setNotes("");
        },
        onError: (err: Error) => {
          toast.error(err.message || "Failed to log production batch");
        },
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="text-base font-bold text-foreground">
            Log Production Batch
          </h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground rounded p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleCreateBatch} className="space-y-3">
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
              Brick Type *
            </label>
            <select
              value={brickTypeId}
              onChange={(e) => setBrickTypeId(e.target.value)}
              required
              className="w-full rounded border border-border bg-card px-3 py-2 text-xs text-foreground focus:ring-1 focus:ring-primary"
            >
              <option value="">-- Select Brick Type --</option>
              {brickTypes.map((bt) => (
                <option key={bt.id} value={bt.id}>
                  {bt.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
              Moulding Worker
            </label>
            <select
              value={workerId}
              onChange={(e) => setWorkerId(e.target.value)}
              className="w-full rounded border border-border bg-card px-3 py-2 text-xs text-foreground focus:ring-1 focus:ring-primary"
            >
              <option value="">-- Choose Worker (Optional) --</option>
              {workers.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.full_name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                Production Date *
              </label>
              <Input
                type="date"
                value={productionDate}
                onChange={(e) => setProductionDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                Bricks Moulded *
              </label>
              <Input
                type="number"
                min="1"
                value={bricksMoulded}
                onChange={(e) => setBricksMoulded(e.target.value)}
                placeholder="e.g. 1500"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
              Notes / Observations
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
            <Button type="submit" disabled={createBatch.isPending}>
              {createBatch.isPending ? "Saving..." : "Save Batch"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
