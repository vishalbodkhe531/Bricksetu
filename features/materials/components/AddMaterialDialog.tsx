"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Package, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { RawMaterial, MaterialCreateInput } from "../types/materials.types";
import { materialCreateSchema } from "../schemas/material.schema";
import { useCreateRawMaterial } from "../hooks/useMaterials";
import { MaterialBasicInfoSection } from "./sections/MaterialBasicInfoSection";

interface AddMaterialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (material: RawMaterial) => void;
}

export function AddMaterialDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddMaterialDialogProps) {
  const createMaterial = useCreateRawMaterial();

  const form = useForm<MaterialCreateInput>({
    resolver: zodResolver(materialCreateSchema),
    defaultValues: {
      name: "",
      unit: "tons",
    },
  });

  if (!open) return null;

  const handleSubmit = async (data: MaterialCreateInput) => {
    try {
      const result = await createMaterial.mutateAsync(data);
      toast.success(`Material "${result.name}" registered successfully / कच्चा माल यशस्वीपणे नोंदवला`);
      form.reset({ name: "", unit: "tons" });
      onOpenChange(false);
      onSuccess?.(result);
    } catch (err: any) {
      toast.error(
        err.message || "Failed to register material / कच्चा माल नोंदवण्यात त्रुटी आली"
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-card border border-border rounded-xl max-w-lg w-full p-4 sm:p-6 space-y-4 shadow-xl relative animate-in fade-in zoom-in-95 duration-150 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                Register New Raw Material / नवीन कच्चा माल नोंदवा
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Specify material name and unit of measurement
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-muted-foreground hover:text-foreground rounded p-1.5 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <MaterialBasicInfoSection form={form} />

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                disabled={createMaterial.isPending}
                className="h-9"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={createMaterial.isPending}
                className="gap-2 px-5 h-9"
              >
                {createMaterial.isPending ? (
                  "Registering..."
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Register Material / माल नोंदवा
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}

