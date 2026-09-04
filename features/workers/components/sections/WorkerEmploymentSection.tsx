"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Banknote, Briefcase, Calendar, CheckCircle2 } from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  CATEGORY_OPTIONS,
  STATUS_OPTIONS,
} from "../../constants/worker-options";

interface WorkerEmploymentSectionProps {
  form: UseFormReturn<any>;
  mode: "create" | "edit";
  rateInfo: { label: string; placeholder: string; help: string };
  initialRateAmount?: number;
}

export function WorkerEmploymentSection({
  form,
  mode,
  rateInfo,
  initialRateAmount,
}: WorkerEmploymentSectionProps) {
  return (
    <div className="space-y-3 pt-3 border-t border-border">
      <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
        <Briefcase className="h-3.5 w-3.5 text-primary" /> 3. Employment & Rate Setup
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Category / Role */}
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel>
                Category / Role <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Select
                  value={field.value || ""}
                  onValueChange={field.onChange}
                  placeholder="Select Role Category"
                  options={CATEGORY_OPTIONS}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Joining Date */}
        <FormField
          control={form.control}
          name="joining_date"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-muted-foreground" /> Joining Date
              </FormLabel>
              <FormControl>
                <Input type="date" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Status */}
        {mode === "edit" ? (
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel>Status</FormLabel>
                <FormControl>
                  <Select
                    value={field.value || ""}
                    onValueChange={field.onChange}
                    placeholder="Select Status"
                    options={STATUS_OPTIONS}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : (
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">
              Initial Status
            </label>
            <div className="px-3 py-2 border border-border rounded-md bg-muted/20 text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" /> Active Roster Worker
            </div>
          </div>
        )}
      </div>

      {/* Rate Display / Input */}
      {mode === "create" ? (
        <div className="mt-2.5 p-3 rounded-lg border border-primary/20 bg-primary/5 space-y-1.5">
          <div className="flex items-center gap-1.5">
            <Banknote className="h-3.5 w-3.5 text-primary" />
            <span className="text-[11px] font-bold text-foreground uppercase tracking-wide">
              {rateInfo.label}
            </span>
          </div>
          <div className="max-w-md space-y-1">
            <FormField
              control={form.control}
              name="initial_rate_amount"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder={rateInfo.placeholder}
                      className="bg-card h-9"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <p className="text-[11px] text-muted-foreground">
              {rateInfo.help}
            </p>
          </div>
        </div>
      ) : (
        <div className="p-2.5 bg-muted/20 rounded-md border border-border flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Banknote className="h-3.5 w-3.5 text-primary" />
            <div>
              <span className="font-semibold text-foreground block">
                Current Rate Record
              </span>
              <span className="text-muted-foreground text-[11px]">
                ₹{Number(initialRateAmount || 0).toFixed(2)}
              </span>
            </div>
          </div>
          <div className="text-muted-foreground text-[11px]">
            Note: Wage rate changes are recorded with effective date tracking via <strong>Change Rate</strong>.
          </div>
        </div>
      )}
    </div>
  );
}
