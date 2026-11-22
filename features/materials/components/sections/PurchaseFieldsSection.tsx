"use client";

import React from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FormattedNumberInput } from "@/components/ui/formatted-number-input";
import { Layers, AlignLeft, IndianRupee, Coins, Calendar } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

interface PurchaseFieldsSectionProps {
  form: UseFormReturn<any>;
  unit?: string;
  dateFieldName?: "purchase_date" | "material_date";
  dateLabel?: string;
}

export function PurchaseFieldsSection({
  form,
  unit,
  dateFieldName = "purchase_date",
  dateLabel = "Purchase / Import Date / नोंदणी तारीख",
}: PurchaseFieldsSectionProps) {
  const unitLabel = unit ? `(${unit.toUpperCase()})` : "";
  const rateUnitLabel = unit ? `per ${unit}` : "per Unit";

  return (
    <>
      {/* Import / Purchase Date */}
      <FormField
        control={form.control}
        name={dateFieldName}
        render={({ field }) => (
          <FormItem className="space-y-1">
            <FormLabel className="flex items-center gap-1 text-xs">
              <Calendar className="h-3 w-3 text-muted-foreground" /> {dateLabel}
            </FormLabel>
            <FormControl>
              <Input
                type="date"
                {...field}
                value={field.value || new Date().toISOString().split("T")[0]}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Quantity */}
      <FormField
        control={form.control}
        name="quantity"
        render={({ field }) => (
          <FormItem className="space-y-1">
            <FormLabel className="flex items-center gap-1 text-xs">
              <Layers className="h-3 w-3 text-muted-foreground" /> Quantity / प्रमाण {unitLabel}{" "}
              <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <FormattedNumberInput
                allowDecimal
                placeholder="e.g. 10"
                value={field.value ?? ""}
                onChange={(rawVal) => {
                  const val = rawVal === "" ? "" : Number(rawVal);
                  field.onChange(val);
                  const currentRate = form.getValues("rate_per_unit");
                  if (
                    val !== "" &&
                    currentRate !== undefined &&
                    currentRate !== "" &&
                    !isNaN(Number(val)) &&
                    !isNaN(Number(currentRate))
                  ) {
                    const computedTotal =
                      Math.round(Number(val) * Number(currentRate) * 100) / 100;
                    form.setValue("total_estimated_cost", computedTotal, {
                      shouldValidate: true,
                    });
                  } else {
                    form.setValue("total_estimated_cost", undefined, {
                      shouldValidate: true,
                    });
                  }
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Rate per Unit */}
      <FormField
        control={form.control}
        name="rate_per_unit"
        render={({ field }) => (
          <FormItem className="space-y-1">
            <FormLabel className="flex items-center gap-1 text-xs">
              <IndianRupee className="h-3 w-3 text-muted-foreground" /> Rate / दर (₹ {rateUnitLabel}){" "}
              <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <FormattedNumberInput
                allowDecimal
                placeholder={`e.g. 4,500 (₹ ${rateUnitLabel})`}
                value={field.value ?? ""}
                onChange={(rawVal) => {
                  const val = rawVal === "" ? "" : Number(rawVal);
                  field.onChange(val);
                  const qty = form.getValues("quantity");
                  if (
                    val !== "" &&
                    qty !== undefined &&
                    qty !== "" &&
                    !isNaN(Number(val)) &&
                    !isNaN(Number(qty))
                  ) {
                    const computedTotal =
                      Math.round(Number(val) * Number(qty) * 100) / 100;
                    form.setValue("total_estimated_cost", computedTotal, {
                      shouldValidate: true,
                    });
                  } else {
                    form.setValue("total_estimated_cost", undefined, {
                      shouldValidate: true,
                    });
                  }
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Total Estimated Cost (Auto-calculated display card) */}
      <FormField
        control={form.control}
        name="total_estimated_cost"
        render={({ field }) => {
          const formattedValue =
            field.value !== undefined &&
            field.value !== null &&
            field.value !== "" &&
            !isNaN(Number(field.value))
              ? Number(field.value).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              : "0.00";

          return (
            <FormItem className="space-y-1">
              <FormLabel className="flex items-center gap-1 text-xs">
                <Coins className="h-3 w-3 text-muted-foreground" /> Total Estimated Cost / एकूण खर्च (₹)
              </FormLabel>
              <FormControl>
                <div className="h-10 px-4 rounded-xl border border-amber-200/90 bg-[#FFF6EB] dark:bg-amber-950/20 dark:border-amber-800/50 flex items-center transition-all">
                  <span className="font-semibold text-amber-600 dark:text-amber-400 text-sm">
                    ₹ {formattedValue}
                  </span>
                </div>
              </FormControl>
              <p className="text-[10px] text-muted-foreground">
                Quantity × Rate = Total / प्रमाण × दर = एकूण खर्च
              </p>
              <FormMessage />
            </FormItem>
          );
        }}
      />

      {/* Description / Notes */}
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem className="space-y-1 md:col-span-3">
            <FormLabel className="flex items-center gap-1 text-xs">
              <AlignLeft className="h-3 w-3 text-muted-foreground" /> Description & Notes / तपशील
            </FormLabel>
            <FormControl>
              <Input
                placeholder="e.g. Grade-A quality, delivered by truck MH-12-AB-1234"
                {...field}
                value={field.value || ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}

