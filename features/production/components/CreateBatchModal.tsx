"use client";

import React, { useState } from "react";
import { Factory, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useCreateProductionBatch } from "../hooks/useProduction";
import type { BrickType } from "../types/production.types";

import { DatePicker } from "@/components/ui/date-picker";
import { FormattedNumberInput } from "@/components/ui/formatted-number-input";

interface CreateBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  orgId: string;
  brickTypes: BrickType[];
}

export function CreateBatchModal({
  isOpen,
  onClose,
  orgId,
  brickTypes,
}: CreateBatchModalProps) {
  const createBatch = useCreateProductionBatch(orgId);

  const [batchName, setBatchName] = useState("");
  const [brickTypeId, setBrickTypeId] = useState("");
  const [targetQuantity, setTargetQuantity] = useState("100000");
  const [startDate, setStartDate] = useState("");
  const [expectedEndDate, setExpectedEndDate] = useState("");
  const [notes, setNotes] = useState("");

  React.useEffect(() => {
    if (!startDate) {
      setStartDate(new Date().toISOString().split("T")[0]);
    }
  }, [startDate]);

  React.useEffect(() => {
    if (brickTypes.length > 0 && !brickTypeId) {
      setBrickTypeId(brickTypes[0].id);
    }
  }, [brickTypes, brickTypeId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    createBatch.mutate(
      {
        batch_name: batchName || null,
        brick_type_id: brickTypeId || "",
        target_quantity: parseInt(targetQuantity, 10),
        start_date: startDate,
        expected_end_date: expectedEndDate || null,
        notes: notes || null,
      },
      {
        onSuccess: () => {
          toast.success("New production bhatti created successfully / नवीन भट्टी नोंदवली");
          onClose();
          setBatchName("");
          setBrickTypeId("");
          setTargetQuantity("100000");
          setExpectedEndDate("");
          setNotes("");
        },
        onError: (err: Error) => {
          toast.error(err.message || "Failed to create bhatti");
        },
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Factory className="h-5 w-5 text-primary" /> Create Production Bhatti / नवीन भट्टी
          </h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground rounded p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
              Bhatti Name / Description (भट्टीचे नाव / शीर्षक)
            </label>
            <Input
              value={batchName}
              onChange={(e) => setBatchName(e.target.value)}
              placeholder="e.g. Season 2026 Bhatti #1 / आवान क्र. १"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
              Brick Type / विटेचा प्रकार *
            </label>
            <select
              value={brickTypeId}
              onChange={(e) => setBrickTypeId(e.target.value)}
              className="w-full rounded-md border border-border bg-card px-3 py-2 text-xs text-foreground focus:ring-1 focus:ring-primary"
            >
              {brickTypes.length === 0 ? (
                <option value="">Standard Red Brick (9" x 4" x 3")</option>
              ) : (
                <>
                  <option value="">-- Select Brick Type / प्रकार निवडा --</option>
                  {brickTypes.map((bt) => (
                    <option key={bt.id} value={bt.id}>
                      {bt.name} {bt.dimensions ? `(${bt.dimensions})` : ""}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
              Target Quantity / उद्दिष्ट विटा *
            </label>
            <FormattedNumberInput
              value={targetQuantity}
              onChange={setTargetQuantity}
              placeholder="e.g. 1,00,000"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                Start Date / सुरुवातीची तारीख (DD-MM-YYYY) *
              </label>
              <DatePicker
                value={startDate}
                onChange={setStartDate}
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                Expected End Date / अपेक्षित पूर्ण तारीख (DD-MM-YYYY)
              </label>
              <DatePicker
                value={expectedEndDate}
                onChange={setExpectedEndDate}
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
              Notes / टीप (Optional)
            </label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Season 2026 Bhatti #1 - Red Bricks"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createBatch.isPending}>
              {createBatch.isPending ? "Creating..." : "Create Bhatti / भट्टी तयार करा"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
