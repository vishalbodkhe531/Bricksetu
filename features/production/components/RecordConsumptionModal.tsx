"use client";

import React, { useState } from "react";
import { Fuel, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios/axiosInstance";
import { useCreateBatchConsumption } from "../hooks/useProduction";
import { DatePicker } from "@/components/ui/date-picker";
import { FormattedNumberInput } from "@/components/ui/formatted-number-input";

interface RecordConsumptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  batchId: string;
  orgId: string;
}

interface MaterialLotOption {
  id: string;
  lot_number: string;
  material_name: string;
  material_unit: string;
  available_quantity: number;
  unit_cost_paise: number;
}

export function RecordConsumptionModal({
  isOpen,
  onClose,
  batchId,
  orgId,
}: RecordConsumptionModalProps) {
  const createConsumption = useCreateBatchConsumption(batchId, orgId);

  // Fetch available material lots
  const { data: lots = [], isLoading: loadingLots } = useQuery<MaterialLotOption[]>({
    queryKey: ["materials", "available-lots", orgId],
    queryFn: () => api.get("/materials/lots").then((r) => r.data),
    enabled: isOpen && !!orgId,
  });

  const [lotId, setLotId] = useState("");
  const [consumptionDate, setConsumptionDate] = useState("");
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");

  React.useEffect(() => {
    if (!consumptionDate) {
      setConsumptionDate(new Date().toISOString().split("T")[0]);
    }
  }, [consumptionDate]);

  if (!isOpen) return null;

  const selectedLot = lots.find((l) => l.id === lotId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!lotId) {
      toast.error("Please select a material lot");
      return;
    }

    const qty = parseFloat(quantity);
    if (!qty || qty <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    if (selectedLot && qty > selectedLot.available_quantity) {
      toast.error(
        `Quantity exceeds available lot stock (${selectedLot.available_quantity} ${selectedLot.material_unit})`,
      );
      return;
    }

    createConsumption.mutate(
      {
        material_lot_id: lotId,
        consumption_date: consumptionDate,
        quantity: qty,
        notes: notes || null,
      },
      {
        onSuccess: () => {
          toast.success("Material consumption recorded / इंधन वापर नोंदवला!");
          onClose();
          setLotId("");
          setQuantity("");
          setNotes("");
        },
        onError: (err: Error) => {
          toast.error(err.message || "Failed to record consumption");
        },
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Fuel className="h-5 w-5 text-amber-500" /> Record Material Usage / इंधन वापर नोंदवा
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
              Select Material Lot / साहित्य साठा *
            </label>
            <select
              value={lotId}
              onChange={(e) => setLotId(e.target.value)}
              required
              disabled={lots.length === 0}
              className="w-full rounded-md border border-border bg-card px-3 py-2 text-xs text-foreground focus:ring-1 focus:ring-primary disabled:opacity-50"
            >
              <option value="">
                {lots.length === 0 ? "-- No Material Lots Available / साठा उपलब्ध नाही --" : "-- Choose Material Lot / साहित्य निवडा --"}
              </option>
              {lots.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.material_name} (Lot #{l.lot_number}) — Available: {l.available_quantity} {l.material_unit}
                </option>
              ))}
            </select>
            {lots.length === 0 && !loadingLots && (
              <p className="text-[11px] text-amber-500 mt-1 flex items-center gap-1">
                ⚠️ No material inventory lots available. Add stock via Materials / Inventory module.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                Date / तारीख (DD-MM-YYYY) *
              </label>
              <DatePicker
                value={consumptionDate}
                onChange={setConsumptionDate}
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                Quantity Used ({selectedLot?.material_unit ?? "Units"}) *
              </label>
              <FormattedNumberInput
                allowDecimal
                value={quantity}
                onChange={setQuantity}
                placeholder="e.g. 2.5"
                required
              />
            </div>
          </div>

          {selectedLot && (
            <div className="bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-lg text-xs flex justify-between items-center text-amber-500 font-medium">
              <span>Estimated Cost:</span>
              <span className="font-mono font-bold">
                ₹{(((parseFloat(quantity) || 0) * selectedLot.unit_cost_paise) / 100).toFixed(2)}
              </span>
            </div>
          )}

          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
              Notes / टीप
            </label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Firing shift coal usage (10 tons)"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createConsumption.isPending}>
              {createConsumption.isPending ? "Recording..." : "Record Usage / वापर नोंदवा"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
