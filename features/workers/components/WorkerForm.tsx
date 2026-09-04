"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  ArrowLeft,
  Banknote,
  Briefcase,
  Calendar,
  CheckCircle2,
  Coins,
  FileText,
  HeartHandshake,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Form,
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
  GENDER_OPTIONS,
  ID_PROOF_OPTIONS,
  RELATIONSHIP_OPTIONS,
  STATUS_OPTIONS,
  getRateLabelAndHelp,
} from "../constants/worker-options";
import {
  workerInputSchema,
  workerUpdateSchema,
} from "../schemas/worker.schema";
import {
  WorkerInput,
  WorkerUpdateInput,
  WorkerWithDetails,
} from "../types/worker.types";
import { WorkerPhotoUpload } from "./WorkerPhotoUpload";

interface WorkerFormProps {
  mode: "create" | "edit";
  initialData?: WorkerWithDetails | null;
  onSubmit: (data: WorkerInput | WorkerUpdateInput) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export function WorkerForm({
  mode,
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: WorkerFormProps) {
  const schema = mode === "create" ? workerInputSchema : workerUpdateSchema;

  const form = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: initialData?.full_name || "",
      phone: initialData?.phone || "",
      alternate_phone: initialData?.alternate_phone || "",
      address: initialData?.address || "",
      category: initialData?.category || "PIECE_RATE",
      joining_date: initialData?.joining_date
        ? initialData.joining_date.split("T")[0]
        : new Date().toISOString().split("T")[0],
      status: initialData?.status || "active",
      initial_rate_amount: initialData?.current_rate_amount || undefined,
      // Identity
      dob: initialData?.dob ? initialData.dob.split("T")[0] : "",
      gender: initialData?.gender || undefined,
      id_proof_type: initialData?.id_proof_type || "Aadhaar Card",
      id_proof_number: initialData?.id_proof_number || "",
      photo_url: initialData?.photo_url || "",
      // Opening advance
      opening_advance_amount: undefined,
      opening_advance_date: new Date().toISOString().split("T")[0],
      opening_advance_reason: "Peshgi at joining",
      // Emergency contact
      emergency_contact_name: initialData?.emergency_contact_name || "",
      emergency_contact_phone: initialData?.emergency_contact_phone || "",
      emergency_relationship: initialData?.emergency_relationship || "Spouse",
    },
  });

  const selectedCategory =
    useWatch({ control: form.control, name: "category" }) || "PIECE_RATE";
  const openingAdvanceAmount = useWatch({
    control: form.control,
    name: "opening_advance_amount",
  });

  const rateInfo = getRateLabelAndHelp(selectedCategory);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="rounded-lg border border-border bg-card p-4 sm:p-5 shadow-xs space-y-5">
          {/* Form Header */}
          <div className="flex items-center gap-2.5 border-b border-border pb-3">
            <Link href="/workers">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-xs">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h2 className="text-base font-bold text-foreground">
                {mode === "create"
                  ? "Register New Worker"
                  : "Edit Worker Profile"}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {mode === "create"
                  ? "Provide identity, employment, and opening financial details for onboarding."
                  : "Update personal, emergency, and general worker profile information."}
              </p>
            </div>
          </div>

          {/* Section 1: Basic Profile & Contact */}
          <div className="space-y-3">
            <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-primary" /> 1. Personal & Contact Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Full Name */}
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem className="space-y-1 md:col-span-1">
                    <FormLabel>
                      Full Name <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Ramesh Kumar"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Primary Phone (REQUIRED) */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="flex items-center gap-1">
                      <Phone className="h-3 w-3 text-muted-foreground" />{" "}
                      Primary Phone <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. 9876543210"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Alternate Phone */}
              <FormField
                control={form.control}
                name="alternate_phone"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="flex items-center gap-1">
                      <Phone className="h-3 w-3 text-muted-foreground" />{" "}
                      Alternate / Family Phone
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. 9123456789"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date of Birth */}
              <FormField
                control={form.control}
                name="dob"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />{" "}
                      Date of Birth
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Gender (shadCN Select) */}
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>Gender</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value || ""}
                        onValueChange={field.onChange}
                        placeholder="Select Gender"
                        options={GENDER_OPTIONS}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Residential Address (REQUIRED) */}
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="space-y-1 md:col-span-3">
                    <FormLabel className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" />{" "}
                      Residential Address <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Village / Town, Tehsil, District, State"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Section 2: Identity Proof & Photo */}
          <div className="space-y-3 pt-3 border-t border-border">
            <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-primary" /> 2. ID Verification & Photo
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* ID Proof Type (shadCN Select) */}
              <FormField
                control={form.control}
                name="id_proof_type"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>ID Document Type</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value || ""}
                        onValueChange={field.onChange}
                        placeholder="Select ID Type"
                        options={ID_PROOF_OPTIONS}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ID Proof Number */}
              <FormField
                control={form.control}
                name="id_proof_number"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>ID Number / Card No.</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. 1234 5678 9012"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Photo Upload Component */}
              <FormField
                control={form.control}
                name="photo_url"
                render={({ field }) => (
                  <WorkerPhotoUpload
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>
          </div>

          {/* Section 3: Employment Details & Pay Rate */}
          <div className="space-y-3 pt-3 border-t border-border">
            <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5 text-primary" /> 3. Employment & Rate Setup
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Category / Role (shadCN Select) */}
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

              {/* Status (shadCN Select - Edit mode only) */}
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

            {/* Initial Rate Setup */}
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
                      ₹{Number(initialData?.current_rate_amount || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="text-muted-foreground text-[11px]">
                  Note: Wage rate changes are recorded with effective date tracking via <strong>Change Rate</strong>.
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Opening Advance (Peshgi at Joining) - Create Mode Only */}
          {mode === "create" && (
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
          )}

          {/* Section 5: Emergency & Family Contact */}
          <div className="space-y-3 pt-3 border-t border-border">
            <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <HeartHandshake className="h-3.5 w-3.5 text-primary" />{" "}
              {mode === "create" ? "5" : "4"}. Emergency & Nominee Contact
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Emergency Contact Name */}
              <FormField
                control={form.control}
                name="emergency_contact_name"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>Nominee / Contact Person</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Sunita Devi"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Relationship (shadCN Select) */}
              <FormField
                control={form.control}
                name="emergency_relationship"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>Relationship</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value || ""}
                        onValueChange={field.onChange}
                        placeholder="Select Relationship"
                        options={RELATIONSHIP_OPTIONS}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Emergency Phone */}
              <FormField
                control={form.control}
                name="emergency_contact_phone"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="flex items-center gap-1">
                      <Phone className="h-3 w-3 text-muted-foreground" />{" "}
                      Contact Phone Number
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. 9876000000"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

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
                "Saving Worker Profile..."
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  {mode === "create"
                    ? "Complete Worker Registration"
                    : "Save Changes"}
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
