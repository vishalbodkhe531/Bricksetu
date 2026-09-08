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
  totalDecidedAmount?: number;
}

export function WorkerOpeningAdvanceSection({
  form,
  openingAdvanceAmount,
  totalDecidedAmount,
}: WorkerOpeningAdvanceSectionProps) {
  return (
    <div className="space-y-3 pt-3 border-t border-border">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
          <Coins className="h-3.5 w-3.5" /> 4. Opening Advance (Peshgi at
          Onboarding)
        </h3>
        <span className="text-[11px] font-medium text-muted-foreground">
          Optional
        </span>
      </div>

      <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/5 space-y-3">
        <p className="text-xs text-muted-foreground">
          If advance payment (peshgi) was agreed or handed to the worker prior
          to moulding, enter the details here.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Total Decided Amount */}
          <FormField
            control={form.control}
            name="total_decided_advance_amount"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel>Total Decided Amount (₹)</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="e.g. 50,000"
                    className="bg-card h-9"
                    value={
                      field.value !== undefined &&
                      field.value !== null &&
                      field.value !== ""
                        ? Number(field.value).toLocaleString("en-IN")
                        : ""
                    }
                    onChange={(e) => {
                      const raw = e.target.value.replace(/,/g, "");
                      if (raw === "") {
                        field.onChange("");
                      } else if (!isNaN(Number(raw))) {
                        field.onChange(Number(raw));
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Advance Amount Paid */}
          <FormField
            control={form.control}
            name="opening_advance_amount"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel>Advance Amount Paid (₹)</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="e.g. 5,000"
                    className="bg-card h-9"
                    value={
                      field.value !== undefined &&
                      field.value !== null &&
                      field.value !== ""
                        ? Number(field.value).toLocaleString("en-IN")
                        : ""
                    }
                    onChange={(e) => {
                      const raw = e.target.value.replace(/,/g, "");
                      if (raw === "") {
                        field.onChange("");
                      } else if (!isNaN(Number(raw))) {
                        field.onChange(Number(raw));
                      }
                    }}
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
                    placeholder="e.g. Initial advance payment"
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

        {(Number(openingAdvanceAmount) > 0 ||
          Number(totalDecidedAmount) > 0) && (
          <div className="flex items-center gap-2 p-2 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-medium border border-amber-500/20">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            <span>
              {Number(totalDecidedAmount) > 0 && (
                <>
                  Total agreed Peshgi:{" "}
                  <strong>
                    ₹{Number(totalDecidedAmount).toLocaleString("en-IN")}
                  </strong>
                  .{" "}
                </>
              )}
              {Number(openingAdvanceAmount) > 0 ? (
                <>
                  Worker will be initialized with an outstanding advance ledger
                  balance of{" "}
                  <strong>
                    ₹{Number(openingAdvanceAmount).toLocaleString("en-IN")}
                  </strong>
                  .
                </>
              ) : (
                <>No initial advance paid yet.</>
              )}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
