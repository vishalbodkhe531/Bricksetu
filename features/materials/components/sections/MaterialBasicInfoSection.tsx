"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Package, Scale, Layers, AlignLeft } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

interface MaterialBasicInfoSectionProps {
  form: UseFormReturn<any>;
}

export const MATERIAL_UNIT_OPTIONS = [
  { value: "tons", label: "Tons (टन)" },
  { value: "kg", label: "Kilograms - kg (किलो)" },
  { value: "liters", label: "Liters (लीटर)" },
  { value: "units", label: "Units / Bags (पिशवी/नग)" },
  { value: "trips", label: "Trips / Trolley (फेऱ्या/ट्रॉली)" },
  { value: "brass", label: "Brass (ब्रास)" },
  { value: "cubic_feet", label: "Cubic Feet - cu.ft (घन फूट)" },
];

export function MaterialBasicInfoSection({ form }: MaterialBasicInfoSectionProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
        <Package className="h-3.5 w-3.5 text-primary" /> 1. Basic Material Information / इंधन किंवा कच्चा माल
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Material Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="space-y-1 md:col-span-1">
              <FormLabel className="flex items-center gap-1">
                <Package className="h-3 w-3 text-muted-foreground" /> Material Name / नाव{" "}
                <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. Steam Coal / High-Heat Clay / Diesel"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Unit of Measure */}
        <FormField
          control={form.control}
          name="unit"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel className="flex items-center gap-1">
                <Scale className="h-3 w-3 text-muted-foreground" /> Unit of Measure / मोजमाप एकक{" "}
                <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Select
                  value={field.value || "tons"}
                  onValueChange={field.onChange}
                  placeholder="Select Unit"
                  options={MATERIAL_UNIT_OPTIONS}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Reorder Threshold */}
        <FormField
          control={form.control}
          name="reorder_level"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel className="flex items-center gap-1">
                <Layers className="h-3 w-3 text-muted-foreground" /> Reorder Alert Threshold / किमान पुनर्रचना पातळी
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 10 (Alert when stock falls below)"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description / Notes */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="space-y-1 md:col-span-3">
              <FormLabel className="flex items-center gap-1">
                <AlignLeft className="h-3 w-3 text-muted-foreground" /> Description & Specifications / तपशील
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. Grade-A imported coal used for Bhatti firing stage"
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
