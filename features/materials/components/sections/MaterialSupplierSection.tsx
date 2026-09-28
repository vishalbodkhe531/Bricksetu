"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectOption } from "@/components/ui/select";
import { Supplier } from "@/features/materials/types/materials.types";
import { Truck, UserCheck, UserPlus, Phone, MapPin, FileText } from "lucide-react";
import { UseFormReturn, useWatch } from "react-hook-form";

interface MaterialSupplierSectionProps {
  form: UseFormReturn<any>;
  suppliers: Supplier[];
}

export function MaterialSupplierSection({
  form,
  suppliers = [],
}: MaterialSupplierSectionProps) {
  const supplierMode = useWatch({
    control: form.control,
    name: "supplier_mode",
  });

  const supplierOptions: SelectOption[] = suppliers.map((s) => ({
    value: s.id,
    label: `${s.name}${s.phone ? ` (${s.phone})` : ""}`,
  }));

  return (
    <div className="space-y-4 pt-2 border-t border-border">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Truck className="h-3.5 w-3.5 text-primary" /> 2. Supplier Linkage & Contact / पुरवठादार माहिती
        </h3>
        <p className="text-[11px] text-muted-foreground">
          Link a supplier now or register one directly with this material
        </p>
      </div>

      {/* Supplier Mode Selector Pills */}
      <FormField
        control={form.control}
        name="supplier_mode"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="text-xs font-semibold">Select Mode:</FormLabel>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => field.onChange("none")}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                  field.value === "none"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground hover:bg-muted/50"
                }`}
              >
                <Truck className="h-4 w-4" />
                <span>Skip Supplier</span>
              </button>

              <button
                type="button"
                onClick={() => field.onChange("existing")}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                  field.value === "existing"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground hover:bg-muted/50"
                }`}
              >
                <UserCheck className="h-4 w-4" />
                <span>Existing Supplier</span>
              </button>

              <button
                type="button"
                onClick={() => field.onChange("new")}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                  field.value === "new"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground hover:bg-muted/50"
                }`}
              >
                <UserPlus className="h-4 w-4" />
                <span>+ Register New</span>
              </button>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Mode: Existing Supplier */}
      {supplierMode === "existing" && (
        <div className="p-3.5 rounded-lg border border-border bg-muted/20 space-y-2">
          <FormField
            control={form.control}
            name="supplier_id"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="flex items-center gap-1 text-xs">
                  <UserCheck className="h-3 w-3 text-primary" /> Select Supplier / पुरवठादार निवडा{" "}
                  <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Select
                    value={field.value || ""}
                    onValueChange={field.onChange}
                    placeholder="Search / Choose registered supplier"
                    options={supplierOptions}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}

      {/* Mode: Register New Supplier Inline */}
      {supplierMode === "new" && (
        <div className="p-4 rounded-lg border border-border bg-muted/20 space-y-3">
          <div className="text-xs font-bold text-foreground flex items-center gap-1.5 border-b border-border pb-2">
            <UserPlus className="h-4 w-4 text-primary" /> New Supplier Basic Profile
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* New Supplier Name */}
            <FormField
              control={form.control}
              name="new_supplier_name"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-xs">
                    Supplier Firm Name / नाव <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Royal Coal Traders / Vit-Bhatti Fuel Co."
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Contact Person */}
            <FormField
              control={form.control}
              name="new_supplier_contact_person"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-xs">Contact Person / संपर्क व्यक्ती</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Suresh Patil (Manager)"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone */}
            <FormField
              control={form.control}
              name="new_supplier_phone"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-xs flex items-center gap-1">
                    <Phone className="h-3 w-3 text-muted-foreground" /> Phone / फोन नंबर
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

            {/* Address */}
            <FormField
              control={form.control}
              name="new_supplier_address"
              render={({ field }) => (
                <FormItem className="space-y-1 md:col-span-2">
                  <FormLabel className="text-xs flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-muted-foreground" /> Address / पत्ता
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Depot Address / City / Tehsil"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* GSTIN */}
            <FormField
              control={form.control}
              name="new_supplier_gst"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-xs flex items-center gap-1">
                    <FileText className="h-3 w-3 text-muted-foreground" /> GSTIN / जीएसटी नंबर
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. 27AAAAA0000A1Z5"
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
      )}
    </div>
  );
}
