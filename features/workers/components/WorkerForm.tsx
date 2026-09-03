"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  workerInputSchema,
  workerUpdateSchema,
  WorkerInput,
  WorkerUpdateInput,
  WorkerWithDetails,
} from "../types/worker.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  User,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Banknote,
  ShieldAlert,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

interface WorkerFormProps {
  mode: "create" | "edit";
  initialData?: WorkerWithDetails | null;
  onSubmit: (data: WorkerInput | WorkerUpdateInput) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

const CATEGORY_OPTIONS = [
  { value: "PIECE_RATE", label: "Piece Rate Moulder (Pathaiwala)" },
  { value: "DAILY_WAGE", label: "Daily Wage / Rojdari (Fireman / Loader)" },
  { value: "MONTHLY_SALARY", label: "Monthly Salary (Staff / Manager)" },
];

export function WorkerForm({
  mode,
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: WorkerFormProps) {
  const schema = mode === "create" ? workerInputSchema : workerUpdateSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: initialData?.full_name || "",
      phone: initialData?.phone || "",
      address: initialData?.address || "",
      category: initialData?.category || "PIECE_RATE",
      joining_date: initialData?.joining_date
        ? initialData.joining_date.split("T")[0]
        : new Date().toISOString().split("T")[0],
      status: initialData?.status || "active",
      initial_rate_amount: initialData?.current_rate_amount || undefined,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* <div className="flex items-center justify-between"> */}
      {/* </div> */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-6">
        <div className="flex items-center gap-2">
          <Link href="/workers">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="border-b border-border pb-4">
            <h2 className="text-lg font-bold text-foreground">
              {mode === "create"
                ? "Register New Worker"
                : "Edit Worker Profile"}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {mode === "create"
                ? "Enter worker registration details to add them to your kiln roster."
                : "Update general personal and contact details for this worker."}
            </p>
          </div>
        </div>

        {/* Section 1: Basic Profile */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-primary" /> Basic Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Full Name <span className="text-destructive">*</span>
              </label>
              <Input
                {...register("full_name")}
                placeholder="e.g. Ramesh Kumar"
                className={errors.full_name ? "border-destructive" : ""}
              />
              {errors.full_name && (
                <p className="text-[11px] text-destructive font-medium">
                  {String(errors.full_name.message)}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <Phone className="h-3 w-3 text-muted-foreground" /> Phone Number
              </label>
              <Input
                {...register("phone")}
                placeholder="e.g. 9876543210"
                className={errors.phone ? "border-destructive" : ""}
              />
              {errors.phone && (
                <p className="text-[11px] text-destructive font-medium">
                  {String(errors.phone.message)}
                </p>
              )}
            </div>

            {/* Worker Category / Role */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <Briefcase className="h-3 w-3 text-muted-foreground" /> Category
                / Role
              </label>
              <select
                {...register("category")}
                className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Joining Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3 text-muted-foreground" /> Joining
                Date
              </label>
              <Input type="date" {...register("joining_date")} />
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Status
              </label>
              <select
                {...register("status")}
                className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive (Deactivated)</option>
              </select>
            </div>

            {/* Address */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3 text-muted-foreground" /> Residential
                Address
              </label>
              <Input
                {...register("address")}
                placeholder="Village / Town, District, State"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Moulding Pay Rate (Create Mode Only) */}
        {mode === "create" ? (
          <div className="space-y-3 pt-3 border-t border-border">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Banknote className="h-3.5 w-3.5 text-primary" /> Initial Moulding
              Rate (Piece Rate)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Piece Rate (₹ per 1,000 Bricks)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("initial_rate_amount")}
                  placeholder="e.g. 450.00"
                />
                <p className="text-[11px] text-muted-foreground">
                  Default rate paid for moulding 1,000 raw bricks. Can be
                  updated later with effective date history.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-muted/20 rounded-lg border border-border flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Banknote className="h-4 w-4 text-primary" />
              <div>
                <span className="font-semibold text-foreground block">
                  Current Piece Rate
                </span>
                <span className="text-muted-foreground">
                  ₹{Number(initialData?.current_rate_amount || 0).toFixed(2)}{" "}
                  per 1,000 bricks
                </span>
              </div>
            </div>
            <div className="text-muted-foreground text-[11px]">
              Note: Pay rate changes must be recorded via the{" "}
              <strong>Change Rate</strong> action with effective date tracking.
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting} className="gap-2">
            {isSubmitting ? (
              "Saving Worker Record..."
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                {mode === "create" ? "Create Worker" : "Save Changes"}
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
