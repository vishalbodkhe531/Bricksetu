"use client";

import React, { useState, useEffect } from "react";
import { Fuel, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios/axiosInstance";
import { useCreateBatchConsumption } from "../hooks/useProduction";
import { DatePicker } from "@/components/ui/date-picker";
import { FormattedNumberInput } from "@/components/ui/formatted-number-input";
import { Select, SelectOption } from "@/components/ui/select";

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

interface RawMaterialCatalogItem {
  id: string;
  name: string;
  unit: string;
}

const KILN_PRESET_MATERIALS = [
  { name: "Coal / दगडी कोळसा", unit: "Ton", defaultRateRupees: 8500 },
  { name: "Wood / लाकूड", unit: "Ton", defaultRateRupees: 4500 },
  { name: "Sawdust / लाकडी भुसा", unit: "Brass", defaultRateRupees: 3000 },
  { name: "Soil & Clay / माती", unit: "Brass", defaultRateRupees: 1200 },
];

export function RecordConsumptionModal({
  isOpen,
  onClose,
  batchId,
  orgId,
}: RecordConsumptionModalProps) {
  const createConsumption = useCreateBatchConsumption(batchId, orgId);

  // Fetch available material lots
  const { data: lots = [] } = useQuery<MaterialLotOption[]>({
    queryKey: ["materials", "available-lots", orgId],
    queryFn: () => api.get("/materials/lots").then((r) => r.data),
    enabled: isOpen && !!orgId,
  });

  // Fetch raw materials catalog
  const { data: rawMaterials = [] } = useQuery<RawMaterialCatalogItem[]>({
    queryKey: ["materials", "catalog", orgId],
    queryFn: () => api.get("/materials").then((r) => r.data),
    enabled: isOpen && !!orgId,
  });

  const [selectionKey, setSelectionKey] = useState<string>("");
  const [selectedLotId, setSelectedLotId] = useState<string>("");
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>("");
  const [materialName, setMaterialName] = useState<string>("");
  const [materialUnit, setMaterialUnit] = useState<string>("Unit");
  const [unitRate, setUnitRate] = useState<string>("");
  const [consumptionDate, setConsumptionDate] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  useEffect(() => {
    if (isOpen && !consumptionDate) {
      setConsumptionDate(new Date().toISOString().split("T")[0]);
    }
  }, [isOpen, consumptionDate]);

  if (!isOpen) return null;

  const handleSelectionChange = (key: string) => {
    setSelectionKey(key);

    if (!key) {
      setSelectedLotId("");
      setSelectedMaterialId("");
      setMaterialName("");
      setMaterialUnit("Unit");
      setUnitRate("");
      return;
    }

    if (key.startsWith("lot:")) {
      const lotId = key.replace("lot:", "");
      const lot = lots.find((l) => l.id === lotId);
      if (lot) {
        setSelectedLotId(lot.id);
        setSelectedMaterialId("");
        setMaterialName(lot.material_name);
        setMaterialUnit(lot.material_unit || "Unit");
        setUnitRate((lot.unit_cost_paise / 100).toString());
      }
    } else if (key.startsWith("mat:")) {
      const matId = key.replace("mat:", "");
      const mat = rawMaterials.find((m) => m.id === matId);
      if (mat) {
        setSelectedLotId("");
        setSelectedMaterialId(mat.id);
        setMaterialName(mat.name);
        setMaterialUnit(mat.unit || "Unit");
        setUnitRate("");
      }
    } else if (key.startsWith("std:")) {
      const idx = parseInt(key.replace("std:", ""), 10);
      const preset = KILN_PRESET_MATERIALS[idx];
      if (preset) {
        setSelectedLotId("");
        setSelectedMaterialId("");
        setMaterialName(preset.name);
        setMaterialUnit(preset.unit);
        setUnitRate(preset.defaultRateRupees.toString());
      }
    } else if (key === "custom") {
      setSelectedLotId("");
      setSelectedMaterialId("");
      setMaterialName("");
      setMaterialUnit("Unit");
      setUnitRate("");
    }
  };

  const calculatedTotalCost = (parseFloat(quantity) || 0) * (parseFloat(unitRate) || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!materialName.trim()) {
      toast.error("Please select or enter a material name");
      return;
    }

    const qty = parseFloat(quantity);
    if (!qty || qty <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    createConsumption.mutate(
      {
        material_lot_id: selectedLotId || null,
        material_id: selectedMaterialId || null,
        material_name: materialName.trim(),
        material_unit: materialUnit.trim() || "Unit",
        unit_cost_rupees: parseFloat(unitRate) || 0,
        consumption_date: consumptionDate,
        quantity: qty,
        notes: notes.trim() || null,
      },
      {
        onSuccess: () => {
          toast.success("Material usage recorded / इंधन वापर नोंदवला!");
          onClose();
          setSelectionKey("");
          setSelectedLotId("");
          setSelectedMaterialId("");
          setMaterialName("");
          setMaterialUnit("Unit");
          setUnitRate("");
          setQuantity("");
          setNotes("");
        },
        onError: (err: Error) => {
          toast.error(err.message || "Failed to record material usage");
        },
      },
    );
  };

  const selectOptions: SelectOption[] = [
    ...lots.map((l) => ({
      value: `lot:${l.id}`,
      label: `${l.material_name} (Lot #${l.lot_number}) — Available: ${l.available_quantity} ${l.material_unit}`,
    })),
    ...rawMaterials.map((m) => ({
      value: `mat:${m.id}`,
      label: `${m.name} (${m.unit})`,
    })),
    ...KILN_PRESET_MATERIALS.map((preset, idx) => ({
      value: `std:${idx}`,
      label: `${preset.name} (${preset.unit})`,
    })),
    {
      value: "custom",
      label: "+ Add Other / नवीन साहित्य नाव टाका",
    },
  ];

  const isCustomMode = selectionKey === "custom";

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Fuel className="h-5 w-5 text-amber-500" /> Record Material Usage / इंधन वापर नोंदवा
          </h3>
          <button
            onClick={onClose}
            type="button"
            className="text-muted-foreground hover:text-foreground rounded p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Custom ShadCN Select */}
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
              Select Material or Fuel / इंधन किंवा साहित्य निवडा *
            </label>
            <Select
              value={selectionKey}
              onValueChange={handleSelectionChange}
              placeholder="-- Choose Material / इंधन निवडा --"
              options={selectOptions}
            />
          </div>

          {/* Custom Material Input Fields */}
          {isCustomMode && (
            <div className="grid grid-cols-3 gap-3 p-3 bg-muted/30 rounded-lg border border-border/60">
              <div className="col-span-2">
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                  Material Name / साहित्याचे नाव *
                </label>
                <Input
                  value={materialName}
                  onChange={(e) => setMaterialName(e.target.value)}
                  placeholder="e.g. Rice Husk / डिझेल"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                  Unit / एकक
                </label>
                <Input
                  value={materialUnit}
                  onChange={(e) => setMaterialUnit(e.target.value)}
                  placeholder="e.g. Ton, Litres"
                  required
                />
              </div>
            </div>
          )}

          {/* Date & Quantity */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                Usage Date / तारीख (DD-MM-YYYY) *
              </label>
              <DatePicker
                value={consumptionDate}
                onChange={setConsumptionDate}
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                Quantity Used ({materialUnit || "Units"}) *
              </label>
              <FormattedNumberInput
                allowDecimal
                value={quantity}
                onChange={setQuantity}
                placeholder="e.g. 5.5"
                required
              />
            </div>
          </div>

          {/* Rate & Total Cost Calculation */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                Rate / दर (₹ per {materialUnit || "unit"})
              </label>
              <FormattedNumberInput
                allowDecimal
                value={unitRate}
                onChange={setUnitRate}
                placeholder="e.g. 8500"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                Total Estimated Cost / एकूण खर्च (₹)
              </label>
              <div className="h-9 px-3 flex items-center rounded-md border border-amber-500/30 bg-amber-500/10 font-mono font-bold text-amber-600 dark:text-amber-400 text-xs">
                ₹ {calculatedTotalCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
              Notes / टिप्पणी (Optional)
            </label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Shift 1 firing fuel usage, coal batch loading"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel / रद्द करा
            </Button>
            <Button type="submit" disabled={createConsumption.isPending}>
              {createConsumption.isPending ? "Recording..." : "Record Usage / नोंदवा"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
