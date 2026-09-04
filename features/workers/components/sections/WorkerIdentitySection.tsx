"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FileText } from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ID_PROOF_OPTIONS } from "../../constants/worker-options";
import { WorkerPhotoUpload } from "../WorkerPhotoUpload";

interface WorkerIdentitySectionProps {
  form: UseFormReturn<any>;
}

export function WorkerIdentitySection({ form }: WorkerIdentitySectionProps) {
  return (
    <div className="space-y-3 pt-3 border-t border-border">
      <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
        <FileText className="h-3.5 w-3.5 text-primary" /> 2. ID Verification & Photo
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* ID Proof Type */}
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
  );
}
