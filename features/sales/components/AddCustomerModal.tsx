"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useCreateCustomer } from "@/features/sales/hooks/useSales";

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  orgId: string;
}

export function AddCustomerModal({
  isOpen,
  onClose,
  orgId,
}: AddCustomerModalProps) {
  const createCustomer = useCreateCustomer(orgId);

  const [custName, setCustName] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const [custAddress, setCustAddress] = useState("");
  const [custGst, setCustGst] = useState("");

  if (!isOpen) return null;

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    createCustomer.mutate(
      {
        name: custName,
        phone: custPhone || null,
        address: custAddress || null,
        gst_number: custGst || null,
      },
      {
        onSuccess: () => {
          toast.success("Customer registered successfully");
          onClose();
          setCustName("");
          setCustPhone("");
          setCustAddress("");
          setCustGst("");
        },
        onError: (err: Error) => {
          toast.error(err.message || "Failed to create customer");
        },
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="text-base font-bold text-foreground">
            Register New Customer
          </h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground rounded p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleCreateCustomer} className="space-y-3">
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
              Customer Name *
            </label>
            <Input
              value={custName}
              onChange={(e) => setCustName(e.target.value)}
              placeholder="e.g. Acme Builders"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                Phone
              </label>
              <Input
                value={custPhone}
                onChange={(e) => setCustPhone(e.target.value)}
                placeholder="Mobile number"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                GSTIN
              </label>
              <Input
                value={custGst}
                onChange={(e) => setCustGst(e.target.value)}
                placeholder="GST Number"
              />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
              Address / Site
            </label>
            <Input
              value={custAddress}
              onChange={(e) => setCustAddress(e.target.value)}
              placeholder="Delivery address"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createCustomer.isPending}>
              {createCustomer.isPending ? "Saving..." : "Save Customer"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
