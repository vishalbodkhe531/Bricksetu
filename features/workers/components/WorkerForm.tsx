"use client";

import React, { useState } from "react";
import { useForm, useWatch, Controller } from "react-hook-form";
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
import { Select } from "@/components/ui/select";
import {
  User,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Banknote,
  ArrowLeft,
  CheckCircle2,
  FileText,
  HeartHandshake,
  Coins,
  Camera,
  Upload,
  X,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

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

const GENDER_OPTIONS = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
];

const ID_PROOF_OPTIONS = [
  { value: "Aadhaar Card", label: "Aadhaar Card" },
  { value: "Voter ID", label: "Voter ID" },
  { value: "PAN Card", label: "PAN Card" },
  { value: "Driving License", label: "Driving License" },
  { value: "Other", label: "Other ID Proof" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive (Deactivated)" },
];

const RELATIONSHIP_OPTIONS = [
  { value: "Spouse", label: "Spouse (Husband/Wife)" },
  { value: "Parent", label: "Parent (Father/Mother)" },
  { value: "Sibling", label: "Sibling (Brother/Sister)" },
  { value: "Relative", label: "Relative" },
  { value: "Friend", label: "Friend" },
  { value: "Other", label: "Other" },
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
    control,
    setValue,
    formState: { errors },
  } = useForm<any>({
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

  const selectedCategory = useWatch({ control, name: "category" }) || "PIECE_RATE";
  const openingAdvanceAmount = useWatch({ control, name: "opening_advance_amount" });
  const photoUrlValue = useWatch({ control, name: "photo_url" });

  const [previewPhoto, setPreviewPhoto] = useState<string | null>(initialData?.photo_url || null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Photo file selection handler — Cloudinary-ready callback
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Photo file size must be less than 5MB");
        return;
      }
      // Create object URL for instant preview
      const objectUrl = URL.createObjectURL(file);
      setPreviewPhoto(objectUrl);
      setValue("photo_url", objectUrl, { shouldValidate: true });

      // NOTE: Cloudinary upload hook will be invoked here upon Cloudinary setup:
      // const uploadedUrl = await uploadToCloudinary(file);
      // setValue("photo_url", uploadedUrl);
    }
  };

  const handleRemovePhoto = () => {
    setPreviewPhoto(null);
    setValue("photo_url", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getRateLabelAndHelp = () => {
    switch (selectedCategory) {
      case "DAILY_WAGE":
        return {
          label: "Initial Daily Rate (₹ per Day)",
          placeholder: "e.g. 500.00",
          help: "Standard payout earned per working day.",
        };
      case "MONTHLY_SALARY":
        return {
          label: "Initial Monthly Salary (₹ per Month)",
          placeholder: "e.g. 15000.00",
          help: "Fixed base monthly salary amount.",
        };
      case "PIECE_RATE":
      default:
        return {
          label: "Initial Piece Rate (₹ per 1,000 Bricks)",
          placeholder: "e.g. 450.00",
          help: "Default rate paid for moulding 1,000 raw bricks.",
        };
    }
  };

  const rateInfo = getRateLabelAndHelp();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-8">
        {/* Form Header */}
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <Link href="/workers">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-lg font-bold text-foreground">
              {mode === "create" ? "Register New Worker" : "Edit Worker Profile"}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {mode === "create"
                ? "Provide identity, employment, and opening financial details for onboarding."
                : "Update personal, emergency, and general worker profile information."}
            </p>
          </div>
        </div>

        {/* Section 1: Basic Profile & Contact */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-primary" /> 1. Personal & Contact Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Full Name */}
            <div className="space-y-1.5 md:col-span-1">
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

            {/* Primary Phone (REQUIRED) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <Phone className="h-3 w-3 text-muted-foreground" /> Primary Phone <span className="text-destructive">*</span>
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

            {/* Alternate Phone */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <Phone className="h-3 w-3 text-muted-foreground" /> Alternate / Family Phone
              </label>
              <Input
                {...register("alternate_phone")}
                placeholder="e.g. 9123456789"
                className={errors.alternate_phone ? "border-destructive" : ""}
              />
              {errors.alternate_phone && (
                <p className="text-[11px] text-destructive font-medium">
                  {String(errors.alternate_phone.message)}
                </p>
              )}
            </div>

            {/* Date of Birth */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3 text-muted-foreground" /> Date of Birth
              </label>
              <Input type="date" {...register("dob")} />
            </div>

            {/* Gender (shadCN Select) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Gender</label>
              <Controller
                control={control}
                name="gender"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder="Select Gender"
                    options={GENDER_OPTIONS}
                  />
                )}
              />
            </div>

            {/* Residential Address (REQUIRED) */}
            <div className="space-y-1.5 md:col-span-3">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3 text-muted-foreground" /> Residential Address <span className="text-destructive">*</span>
              </label>
              <Input
                {...register("address")}
                placeholder="Village / Town, Tehsil, District, State"
                className={errors.address ? "border-destructive" : ""}
              />
              {errors.address && (
                <p className="text-[11px] text-destructive font-medium">
                  {String(errors.address.message)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Identity Proof & Photo */}
        <div className="space-y-4 pt-4 border-t border-border">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-primary" /> 2. ID Verification & Photo
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* ID Proof Type (shadCN Select) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">ID Document Type</label>
              <Controller
                control={control}
                name="id_proof_type"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder="Select ID Type"
                    options={ID_PROOF_OPTIONS}
                  />
                )}
              />
            </div>

            {/* ID Proof Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">ID Number / Card No.</label>
              <Input
                {...register("id_proof_number")}
                placeholder="e.g. 1234 5678 9012"
                className={errors.id_proof_number ? "border-destructive" : ""}
              />
              {errors.id_proof_number && (
                <p className="text-[11px] text-destructive font-medium">
                  {String(errors.id_proof_number.message)}
                </p>
              )}
            </div>

            {/* Photo Upload Zone (Cloudinary Ready) */}
            <div className="space-y-1.5 md:col-span-1">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <Camera className="h-3 w-3 text-muted-foreground" /> Worker Photo
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                className="hidden"
              />

              {previewPhoto ? (
                <div className="relative flex items-center gap-3 p-2.5 rounded-lg border border-border bg-muted/20">
                  <div className="relative h-12 w-12 rounded-full overflow-hidden border border-border shrink-0">
                    <img
                      src={previewPhoto}
                      alt="Worker Preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">Profile Photo Selected</p>
                    <p className="text-[11px] text-muted-foreground">Ready for save</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemovePhoto}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center p-3 rounded-lg border border-dashed border-border hover:border-primary bg-muted/10 hover:bg-primary/5 transition-colors cursor-pointer text-center group"
                >
                  <Upload className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors mb-1" />
                  <span className="text-xs font-semibold text-foreground">Upload Photo</span>
                  <span className="text-[10px] text-muted-foreground">Click to select image file (Max 5MB)</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Employment Details & Pay Rate */}
        <div className="space-y-4 pt-4 border-t border-border">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Briefcase className="h-3.5 w-3.5 text-primary" /> 3. Employment & Rate Setup
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Category / Role (shadCN Select) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Category / Role <span className="text-destructive">*</span>
              </label>
              <Controller
                control={control}
                name="category"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder="Select Role Category"
                    options={CATEGORY_OPTIONS}
                  />
                )}
              />
            </div>

            {/* Joining Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3 text-muted-foreground" /> Joining Date
              </label>
              <Input type="date" {...register("joining_date")} />
            </div>

            {/* Status (shadCN Select - Edit mode only) */}
            {mode === "edit" ? (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Status</label>
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select Status"
                      options={STATUS_OPTIONS}
                    />
                  )}
                />
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Initial Status</label>
                <div className="px-3 py-2 border border-border rounded-md bg-muted/20 text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Active Roster Worker
                </div>
              </div>
            )}
          </div>

          {/* Initial Rate Setup */}
          {mode === "create" ? (
            <div className="mt-3 p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-2">
              <div className="flex items-center gap-2">
                <Banknote className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold text-foreground uppercase tracking-wide">
                  {rateInfo.label}
                </span>
              </div>
              <div className="max-w-md space-y-1.5">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("initial_rate_amount")}
                  placeholder={rateInfo.placeholder}
                  className="bg-card"
                />
                <p className="text-[11px] text-muted-foreground">{rateInfo.help}</p>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-muted/20 rounded-lg border border-border flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Banknote className="h-4 w-4 text-primary" />
                <div>
                  <span className="font-semibold text-foreground block">
                    Current Rate Record
                  </span>
                  <span className="text-muted-foreground">
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
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Coins className="h-4 w-4" /> 4. Opening Advance (Peshgi at Onboarding)
              </h3>
              <span className="text-[11px] font-medium text-muted-foreground">Optional</span>
            </div>

            <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-4">
              <p className="text-xs text-muted-foreground">
                If advance payment (peshgi) was handed to the worker prior to moulding, enter it here to populate their ledger balance immediately.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Advance Amount */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Advance Amount (₹)</label>
                  <Input
                    type="number"
                    step="1"
                    min="0"
                    {...register("opening_advance_amount")}
                    placeholder="e.g. 5000"
                    className="bg-card"
                  />
                </div>

                {/* Date Given */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Date Handed Over</label>
                  <Input
                    type="date"
                    {...register("opening_advance_date")}
                    className="bg-card"
                  />
                </div>

                {/* Reason / Notes */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Notes / Reason</label>
                  <Input
                    {...register("opening_advance_reason")}
                    placeholder="e.g. Peshgi advance at joining"
                    className="bg-card"
                  />
                </div>
              </div>

              {Number(openingAdvanceAmount) > 0 && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-medium border border-amber-500/20">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>
                    Worker will be initialized with an outstanding advance ledger balance of <strong>₹{Number(openingAdvanceAmount).toLocaleString("en-IN")}</strong>.
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Section 5: Emergency & Family Contact */}
        <div className="space-y-4 pt-4 border-t border-border">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <HeartHandshake className="h-3.5 w-3.5 text-primary" /> {mode === "create" ? "5" : "4"}. Emergency & Nominee Contact
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Emergency Contact Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Nominee / Contact Person</label>
              <Input
                {...register("emergency_contact_name")}
                placeholder="e.g. Sunita Devi"
              />
            </div>

            {/* Relationship (shadCN Select) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Relationship</label>
              <Controller
                control={control}
                name="emergency_relationship"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder="Select Relationship"
                    options={RELATIONSHIP_OPTIONS}
                  />
                )}
              />
            </div>

            {/* Emergency Phone */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <Phone className="h-3 w-3 text-muted-foreground" /> Contact Phone Number
              </label>
              <Input
                {...register("emergency_contact_phone")}
                placeholder="e.g. 9876000000"
                className={errors.emergency_contact_phone ? "border-destructive" : ""}
              />
              {errors.emergency_contact_phone && (
                <p className="text-[11px] text-destructive font-medium">
                  {String(errors.emergency_contact_phone.message)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-border">
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
          <Button type="submit" disabled={isSubmitting} className="gap-2 px-6">
            {isSubmitting ? (
              "Saving Worker Profile..."
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                {mode === "create" ? "Complete Worker Registration" : "Save Changes"}
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
