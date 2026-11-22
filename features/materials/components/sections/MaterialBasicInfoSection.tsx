"use client";

import { useState, useEffect } from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Package, Scale } from "lucide-react";
import { UseFormReturn, useWatch } from "react-hook-form";

interface MaterialBasicInfoSectionProps {
  form: UseFormReturn<any>;
}

export const MATERIAL_NAME_OPTIONS = [
  { value: "Coal / दगडी कोळसा", label: "Coal / दगडी कोळसा" },
  { value: "Wood / लाकूड", label: "Wood / लाकूड" },
  { value: "Sawdust / लाकडी भुसा", label: "Sawdust / लाकडी भुसा" },
  { value: "Soil & Clay / माती", label: "Soil & Clay / माती" },
  { value: "Mali / मळी (Molasses waste)", label: "Mali / मळी" },
  { value: "Other / इतर", label: "Other / इतर" },
];

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
  const currentName = useWatch({ control: form.control, name: "name" });

  const isStandardOption = MATERIAL_NAME_OPTIONS.some(
    (opt) => opt.value === currentName && opt.value !== "Other / इतर"
  );

  const [selectedPreset, setSelectedPreset] = useState<string>(() => {
    if (!currentName) return MATERIAL_NAME_OPTIONS[0].value;
    return isStandardOption ? currentName : "Other / इतर";
  });

  const [customName, setCustomName] = useState<string>(() => {
    return isStandardOption ? "" : currentName || "";
  });

  // Ensure default material name is synced with form if empty
  useEffect(() => {
    if (!currentName && selectedPreset !== "Other / इतर") {
      form.setValue("name", selectedPreset, { shouldValidate: true });
    }
  }, [currentName, selectedPreset, form]);

  return (
    <div className="space-y-3">
      <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
        <Package className="h-3.5 w-3.5 text-primary" /> Basic Material Information / कच्चा माल माहिती
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Material Name Selector */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel className="flex items-center gap-1 text-xs">
                <Package className="h-3 w-3 text-muted-foreground" /> Material Name / नाव{" "}
                <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Select
                  value={selectedPreset}
                  onValueChange={(val) => {
                    setSelectedPreset(val);
                    if (val !== "Other / इतर") {
                      field.onChange(val);
                    } else {
                      field.onChange(customName);
                    }
                  }}
                  placeholder="Select Material Name"
                  options={MATERIAL_NAME_OPTIONS}
                />
              </FormControl>
              {selectedPreset === "Other / इतर" && (
                <Input
                  placeholder="Enter custom material name..."
                  value={customName}
                  onChange={(e) => {
                    setCustomName(e.target.value);
                    field.onChange(e.target.value);
                  }}
                  className="mt-2"
                />
              )}
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
              <FormLabel className="flex items-center gap-1 text-xs">
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
      </div>
    </div>
  );
}
