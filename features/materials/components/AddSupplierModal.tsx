"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useCreateSupplier } from "@/features/materials/hooks/useMaterials";

interface AddSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  orgId: string;
}

export function AddSupplierModal({
  isOpen,
  onClose,
  orgId,
}: AddSupplierModalProps) {
  const createSupplier = useCreateSupplier(orgId);

  const [supName, setSupName] = useState("");
  const [supContact, setSupContact] = useState("");
  const [supPhone, setSupPhone] = useState("");
  const [supAddress, setSupAddress] = useState("");
  const [supGst, setSupGst] = useState("");

  if (!isOpen) return null;

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    createSupplier.mutate(
      {
        name: supName,
        contact_person: supContact || null,
        phone: supPhone || null,
        address: supAddress || null,
        gst_number: supGst || null,
      },
      {
        onSuccess: () => {
          toast.success("Supplier registered successfully");
          onClose();
          setSupName("");
          setSupContact("");
          setSupPhone("");
          setSupAddress("");
          setSupGst("");
        },
        onError: (err: Error) => {
          toast.error(err.message || "Failed to register supplier");
        },
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="text-base font-bold text-foreground">
            Register Supplier
          </h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground rounded p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleCreateSupplier} className="space-y-3">
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
              Supplier Name *
            </label>
            <Input
              value={supName}
              onChange={(e) => setSupName(e.target.value)}
              placeholder="e.g. Royal Coal Traders"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                Contact Person
              </label>
              <Input
                value={supContact}
                onChange={(e) => setSupContact(e.target.value)}
                placeholder="Manager Name"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                Phone
              </label>
              <Input
                value={supPhone}
                onChange={(e) => setSupPhone(e.target.value)}
                placeholder="Phone number"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                Address
              </label>
              <Input
                value={supAddress}
                onChange={(e) => setSupAddress(e.target.value)}
                placeholder="City / Depot"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                GSTIN
              </label>
              <Input
                value={supGst}
                onChange={(e) => setSupGst(e.target.value)}
                placeholder="GST Number"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createSupplier.isPending}>
              {createSupplier.isPending ? "Saving..." : "Save Supplier"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
