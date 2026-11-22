"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Supplier, PurchaseCreateInput } from "../types/materials.types";
import { purchaseCreateSchema } from "../schemas/material.schema";
import { PurchaseFieldsSection } from "./sections/PurchaseFieldsSection";
import { MaterialSupplierSection } from "./sections/MaterialSupplierSection";

interface PurchaseFormProps {
  materialName: string;
  unit: string;
  suppliers?: Supplier[];
  onSubmit: (data: PurchaseCreateInput) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export function PurchaseForm({
  materialName,
  unit,
  suppliers = [],
  onSubmit,
  onCancel,
  isSubmitting = false,
}: PurchaseFormProps) {
  const form = useForm<any>({
    resolver: zodResolver(purchaseCreateSchema) as any,
    defaultValues: {
      purchase_date: new Date().toISOString().split("T")[0],
      quantity: undefined,
      rate_per_unit: undefined,
      total_estimated_cost: undefined,
      description: "",

      // Supplier section
      supplier_mode: "none",
      supplier_id: "",
      new_supplier_name: "",
      new_supplier_contact_person: "",
      new_supplier_phone: "",
      new_supplier_address: "",
      new_supplier_gst: "",
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => onSubmit(data as PurchaseCreateInput))}
        className="space-y-4"
      >
        {/* Material Context Banner */}
        <div className="p-3 bg-muted/40 border border-border rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Material:</span>
            <span className="font-bold text-foreground">{materialName}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Unit:</span>
            <span className="font-bold uppercase font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">
              {unit}
            </span>
          </div>
        </div>

        {/* Section 1: Purchase Specs (Date, Qty, Rate, Total, Notes) */}
        <div className="space-y-3">
          <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <ShoppingCart className="h-3.5 w-3.5 text-primary" /> 1. Purchase Details / खरेदी तपशील
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <PurchaseFieldsSection
              form={form}
              unit={unit}
              dateFieldName="purchase_date"
              dateLabel="Purchase Date / खरेदी तारीख"
            />
          </div>
        </div>

        {/* Section 2: Supplier Linkage (Reused) */}
        <MaterialSupplierSection form={form} suppliers={suppliers} />

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
              disabled={isSubmitting}
              className="h-9"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting}
            className="gap-2 px-5 h-9"
          >
            {isSubmitting ? (
              "Recording Purchase..."
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Record Purchase / खरेदी नोंदवा
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

