"use client";

import React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { MaterialCreateInput, MaterialUpdateInput, MaterialDetail } from "../types/materials.types";
import { materialCreateSchema, materialUpdateSchema } from "../schemas/material.schema";
import { MaterialBasicInfoSection } from "./sections/MaterialBasicInfoSection";

interface MaterialFormProps {
  mode: "create" | "edit";
  initialData?: MaterialDetail | null;
  onSubmit: (data: MaterialCreateInput | MaterialUpdateInput) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export function MaterialForm({
  mode,
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: MaterialFormProps) {
  const schema = mode === "create" ? materialCreateSchema : materialUpdateSchema;

  const form = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialData?.name || "",
      unit: initialData?.unit || "tons",
    },
  });

  const backHref = mode === "edit" && initialData?.id ? `/materials/${initialData.id}` : "/materials";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="rounded-lg border border-border bg-card p-4 sm:p-5 shadow-xs space-y-5">
          {/* Header */}
          <div className="flex items-center gap-2.5 border-b border-border pb-3">
            <Link href={backHref}>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-xs">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h2 className="text-base font-bold text-foreground">
                {mode === "create"
                  ? "Register New Raw Material / नवीन कच्चा माल नोंदवा"
                  : `Edit Material Profile: ${initialData?.name || ""}`}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {mode === "create"
                  ? "Specify material name and unit of measurement."
                  : "Update material specifications, reorder threshold, or active status."}
              </p>
            </div>
          </div>

          {/* Section: Material Name & Unit */}
          <MaterialBasicInfoSection form={form} />

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
                "Saving Material Record..."
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  {mode === "create" ? "Register Material / माल नोंदवा" : "Save Changes"}
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
