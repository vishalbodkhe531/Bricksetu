"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useCreatePayment } from "@/features/payments/hooks/usePayments";
import type { Payment } from "@/features/payments/types/payment.types";

interface AddPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orgId: string;
  customers: any[];
}

export function AddPaymentModal({
  isOpen,
  onClose,
  orgId,
  customers,
}: AddPaymentModalProps) {
  const createPayment = useCreatePayment(orgId);

  const [paymentMode, setPaymentMode] =
    useState<Payment["payment_mode"]>("cash");
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");

  if (!isOpen) return null;

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    createPayment.mutate(
      {
        customer_id: selectedCustomerId,
        sales_order_id: null,
        amount: parseFloat(amount),
        payment_date: paymentDate,
        payment_mode: paymentMode,
        reference_number: referenceNumber || null,
      },
      {
        onSuccess: () => {
          toast.success("Payment recorded successfully!");
          onClose();
          setAmount("");
          setSelectedCustomerId("");
          setReferenceNumber("");
        },
        onError: (err: Error) => {
          toast.error(err.message || "Failed to record payment");
        },
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="text-base font-bold text-foreground">
            Record Payment Receipt
          </h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground rounded p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleCreatePayment} className="space-y-3">
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
              Customer
            </label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full rounded border border-border bg-card px-3 py-2 text-xs text-foreground focus:ring-1 focus:ring-primary"
            >
              <option value="">-- Choose Customer (Optional) --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                Payment Date *
              </label>
              <Input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                Amount (₹) *
              </label>
              <Input
                type="number"
                step="0.01"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 25000"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                Payment Mode *
              </label>
              <select
                value={paymentMode ?? "cash"}
                onChange={(e) =>
                  setPaymentMode(e.target.value as Payment["payment_mode"])
                }
                required
                className="w-full rounded border border-border bg-card px-3 py-2 text-xs text-foreground focus:ring-1 focus:ring-primary"
              >
                <option value="cash">Cash</option>
                <option value="bank">Bank Transfer</option>
                <option value="cheque">Cheque</option>
                <option value="upi">UPI</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                Reference / Cheque #
              </label>
              <Input
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="e.g. UPI/123456"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createPayment.isPending}>
              {createPayment.isPending ? "Saving..." : "Save Payment"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
