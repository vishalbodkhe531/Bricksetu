"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";
import { HeartHandshake, Phone } from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { RELATIONSHIP_OPTIONS } from "../../constants/worker-options";

interface WorkerEmergencySectionProps {
  form: UseFormReturn<any>;
  sectionNumber: string;
}

export function WorkerEmergencySection({
  form,
  sectionNumber,
}: WorkerEmergencySectionProps) {
  return (
    <div className="space-y-3 pt-3 border-t border-border">
      <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
        <HeartHandshake className="h-3.5 w-3.5 text-primary" />{" "}
        {sectionNumber}. Emergency & Nominee Contact
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

        {/* Relationship */}
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
  );
}
