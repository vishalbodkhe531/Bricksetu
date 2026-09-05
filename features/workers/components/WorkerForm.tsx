"use client";

import React from "react";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";

import { getRateLabelAndHelp } from "../constants/worker-options";
import {
  workerInputSchema,
  workerUpdateSchema,
} from "../schemas/worker.schema";
import {
  WorkerInput,
  WorkerUpdateInput,
  WorkerWithDetails,
} from "../types/worker.types";

import { WorkerPersonalInfoSection } from "./sections/WorkerPersonalInfoSection";
import { WorkerIdentitySection } from "./sections/WorkerIdentitySection";
import { WorkerEmploymentSection } from "./sections/WorkerEmploymentSection";
import { WorkerOpeningAdvanceSection } from "./sections/WorkerOpeningAdvanceSection";
import { WorkerEmergencySection } from "./sections/WorkerEmergencySection";

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

  const backHref = mode === "edit" && initialData?.id ? `/workers/${initialData.id}` : "/workers";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="rounded-lg border border-border bg-card p-4 sm:p-5 shadow-xs space-y-5">
          {/* Form Header */}
          <div className="flex items-center gap-2.5 border-b border-border pb-3">
            <Link href={backHref}>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-xs">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h2 className="text-base font-bold text-foreground">
                {mode === "create"
                  ? "Register New Worker"
                  : `Edit Worker Profile: ${initialData?.full_name || ""}`}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {mode === "create"
                  ? "Provide identity, employment, and opening financial details for onboarding."
                  : "Update personal, emergency, and general worker profile information."}
              </p>
            </div>
          </div>

          {/* Section 1: Personal & Contact Information */}
          <WorkerPersonalInfoSection form={form} />

          {/* Section 2: ID Verification & Photo */}
          <WorkerIdentitySection form={form} />

          {/* Section 3: Employment & Rate Setup */}
          <WorkerEmploymentSection
            form={form}
            mode={mode}
            rateInfo={rateInfo}
            initialRateAmount={initialData?.current_rate_amount}
          />

          {/* Section 4: Opening Advance (Create Mode Only) */}
          {mode === "create" && (
            <WorkerOpeningAdvanceSection
              form={form}
              openingAdvanceAmount={openingAdvanceAmount}
            />
          )}

          {/* Section 5: Emergency Contact */}
          <WorkerEmergencySection
            form={form}
            sectionNumber={mode === "create" ? "5" : "4"}
          />

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
