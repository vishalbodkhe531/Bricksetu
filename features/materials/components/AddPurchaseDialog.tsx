"use client";

import React from "react";
import { X, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

import { Supplier, PurchaseCreateInput } from "../types/materials.types";
import { useAddPurchase, useSuppliersList } from "../hooks/useMaterials";
import { PurchaseForm } from "./PurchaseForm";

interface AddPurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  materialId: string;
  materialName: string;
  unit: string;
  suppliers?: Supplier[];
  onSuccess?: () => void;
}

export function AddPurchaseDialog({
  open,
  onOpenChange,
  materialId,
  materialName,
  unit,
  suppliers: propSuppliers,
  onSuccess,
}: AddPurchaseDialogProps) {
  const { data: fetchedSuppliers = [] } = useSuppliersList();
  const suppliers = propSuppliers && propSuppliers.length > 0 ? propSuppliers : fetchedSuppliers;
  const addPurchase = useAddPurchase(materialId);

  if (!open) return null;

  const handleSubmit = async (data: PurchaseCreateInput) => {
    try {
      await addPurchase.mutateAsync(data);
      toast.success("Purchase recorded successfully / खरेदी यशस्वीपणे नोंदवली");
      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      toast.error(
        err.message || "Failed to record purchase / खरेदी नोंदवण्यात त्रुटी आली"
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-card border border-border rounded-xl max-w-3xl w-full p-4 sm:p-6 space-y-4 shadow-xl relative animate-in fade-in zoom-in-95 duration-150 my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                Record New Purchase / नवीन खरेदी नोंदवा
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Add fresh stock and import history for {materialName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-muted-foreground hover:text-foreground rounded p-1.5 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <PurchaseForm
          materialName={materialName}
          unit={unit}
          suppliers={suppliers}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={addPurchase.isPending}
        />
      </div>
    </div>
  );
}

