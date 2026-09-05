"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";
import { AlertTriangle, Coins } from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface WorkerOpeningAdvanceSectionProps {
  form: UseFormReturn<any>;
  openingAdvanceAmount?: number;
}

export function WorkerOpeningAdvanceSection({
  form,
  openingAdvanceAmount,
}: WorkerOpeningAdvanceSectionProps) {
  return (
    <div className="space-y-3 pt-3 border-t border-border">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
          <Coins className="h-3.5 w-3.5" /> 4. Opening Advance (Peshgi at Onboarding)
        </h3>
        <span className="text-[11px] font-medium text-muted-foreground">
          Optional
        </span>
      </div>

      <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/5 space-y-3">
        <p className="text-xs text-muted-foreground">
          If advance payment (peshgi) was handed to the worker prior to moulding, enter it here to populate their ledger balance immediately.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Advance Amount */}
          <FormField
            control={form.control}
            name="opening_advance_amount"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel>Advance Amount (₹)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="1"
                    min="0"
                    placeholder="e.g. 5000"
                    className="bg-card h-9"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Date Given */}
          <FormField
            control={form.control}
            name="opening_advance_date"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel>Date Handed Over</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    className="bg-card h-9"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Reason / Notes */}
          <FormField
            control={form.control}
            name="opening_advance_reason"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel>Notes / Reason</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. Peshgi advance at joining"
                    className="bg-card h-9"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {Number(openingAdvanceAmount) > 0 && (
          <div className="flex items-center gap-2 p-2 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-medium border border-amber-500/20">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            <span>
              Worker will be initialized with an outstanding advance ledger balance of{" "}
              <strong>
                ₹{Number(openingAdvanceAmount).toLocaleString("en-IN")}
              </strong>
              .
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
