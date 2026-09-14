"use client";

import React, { useState } from "react";
import { PackageCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useCreateFinishedGoods } from "../hooks/useProduction";
import type { BrickGrade, BatchKPIs } from "../types/production.types";
import { FormattedNumberInput } from "@/components/ui/formatted-number-input";

interface RecordFinishedGoodsModalProps {
  isOpen: boolean;
  onClose: () => void;
  batchId: string;
  orgId: string;
  grades: BrickGrade[];
  kpis?: BatchKPIs;
}

export function RecordFinishedGoodsModal({
  isOpen,
  onClose,
  batchId,
  orgId,
  grades,
  kpis,
}: RecordFinishedGoodsModalProps) {
  const createGoods = useCreateFinishedGoods(batchId, orgId);

  const defaultCostRupees = kpis?.cost_per_brick_paise
    ? (kpis.cost_per_brick_paise / 100).toFixed(2)
    : "1.20";

  const [gradeId, setGradeId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unitCostRupees, setUnitCostRupees] = useState(defaultCostRupees);

  React.useEffect(() => {
    if (grades.length > 0 && !gradeId) {
      setGradeId(grades[0].id);
    }
  }, [grades, gradeId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!gradeId) {
      toast.error("Please select a brick grade");
      return;
    }

    const qty = parseInt(quantity, 10);
    if (!qty || qty <= 0) {
      toast.error("Please enter valid quantity");
      return;
    }

    const unitCostPaise = Math.round(parseFloat(unitCostRupees || "0") * 100);

    createGoods.mutate(
      {
        brick_grade_id: gradeId,
        quantity: qty,
        unit_cost_paise: unitCostPaise,
      },
      {
        onSuccess: () => {
          toast.success(
            "Finished goods output transferred to inventory! / पक्का माल स्टॉक मध्ये जमा झाला",
          );
          onClose();
          setGradeId("");
          setQuantity("");
        },
        onError: (err: Error) => {
          toast.error(err.message || "Failed to output finished goods");
        },
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <PackageCheck className="h-5 w-5 text-emerald-500" /> Transfer to Stock / साठा नोंदवा (Inventory)
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
              Brick Grade / विटेची प्रतवारी (Quality) *
            </label>
            <select
              value={gradeId}
              onChange={(e) => setGradeId(e.target.value)}
              required
              className="w-full rounded-md border border-border bg-card px-3 py-2 text-xs text-foreground focus:ring-1 focus:ring-primary"
            >
              <option value="">-- Choose Quality Grade / प्रतवारी निवडा --</option>
              {grades.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.code})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                Quantity Output / पक्की विटा *
              </label>
              <FormattedNumberInput
                value={quantity}
                onChange={setQuantity}
                placeholder="e.g. 50,000"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                Unit Cost per Brick (₹) *
              </label>
              <FormattedNumberInput
                allowDecimal
                value={unitCostRupees}
                onChange={setUnitCostRupees}
                placeholder="e.g. 4.50"
                required
              />
            </div>
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded-lg text-xs flex justify-between items-center text-emerald-500 font-medium">
            <span>Total Valuation:</span>
            <span className="font-mono font-bold">
              ₹{(((parseInt(quantity, 10) || 0) * (parseFloat(unitCostRupees) || 0))).toLocaleString()}
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createGoods.isPending}>
              {createGoods.isPending ? "Transferring..." : "Add to Inventory / साठ्यात जमा करा"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
