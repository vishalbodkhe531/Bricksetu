"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Calendar, MapPin, Phone, User } from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { GENDER_OPTIONS } from "../../constants/worker-options";

interface WorkerPersonalInfoSectionProps {
  form: UseFormReturn<any>;
}

export function WorkerPersonalInfoSection({
  form,
}: WorkerPersonalInfoSectionProps) {
  return (
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

        {/* Gender */}
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
  );
}
