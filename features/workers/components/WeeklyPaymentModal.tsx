"use client";

import React, { useState } from "react";
import {
  X,
  Banknote,
  Calendar,
  CreditCard,
  User,
  FileText,
  Loader2,
  Coins,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { getMarathiDay, MARATHI_DAYS } from "../utils/date-utils";
import { useRecordWeeklyPayment } from "../hooks/useWeeklyPayments";
import type { Worker } from "../types/worker.types";

interface WeeklyPaymentModalProps {
  open: boolean;
  onClose: () => void;
  worker: Worker;
  onSuccess?: () => void;
}

export function WeeklyPaymentModal({
  open,
  onClose,
  worker,
  onSuccess,
}: WeeklyPaymentModalProps) {
  const todayStr = new Date().toISOString().split("T")[0];

  const [date, setDate] = useState(todayStr);
  const [day, setDay] = useState(getMarathiDay(todayStr));
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "PHONEPAY">("CASH");
  const [note, setNote] = useState("");

  const recordPayment = useRecordWeeklyPayment(worker.id);

  // When date changes, automatically synchronize the Marathi day
  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    if (newDate) {
      setDay(getMarathiDay(newDate));
    }
  };

  const resetForm = () => {
    const today = new Date().toISOString().split("T")[0];
    setDate(today);
    setDay(getMarathiDay(today));
    setAmount("");
    setPaidBy("");
    setPaymentMethod("CASH");
    setNote("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("कृपया वैध रक्कम टाका (Please enter a valid amount)");
      return;
    }

    if (!paidBy.trim()) {
      toast.error("कृपया पैसे देणाऱ्याचे नाव टाका (Please enter payer name)");
      return;
    }

    try {
      await recordPayment.mutateAsync({
        worker_id: worker.id,
        payment_date: date,
        day_of_week: day,
        amount: parsedAmount,
        paid_by: paidBy.trim(),
        payment_method: paymentMethod,
        notes: note.trim() || null,
      });

      toast.success(
        `₹${parsedAmount.toLocaleString("en-IN")} साप्ताहिक पेमेंट यशस्वीरीत्या नोंदवले!`
      );
      resetForm();
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : "साप्ताहिक पेमेंट नोंदवण्यात त्रुटी आली";
      toast.error(errorMsg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Banknote className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                साप्ताहिक पेमेंट नोंदवा
              </h3>
              <p className="text-xs text-muted-foreground">
                {worker.full_name} ({worker.category === "BHATKAR" ? "भटकर" : "आल्यावाले"})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground rounded p-1 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Row 1: Date & Day */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5 mb-1">
                <Calendar className="h-3.5 w-3.5 text-primary" /> तारीख (Date) *
              </label>
              <Input
                type="date"
                required
                value={date}
                onChange={(e) => handleDateChange(e.target.value)}
                className="h-9 text-xs font-mono font-medium"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5 mb-1">
                <Calendar className="h-3.5 w-3.5 text-amber-500" /> वार (Day) *
              </label>
              <select
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs font-semibold text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
                required
              >
                {MARATHI_DAYS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Money (रक्कम) */}
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5 mb-1">
              <Coins className="h-3.5 w-3.5 text-emerald-500" /> रक्कम (Money ₹) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-muted-foreground text-sm">
                ₹
              </span>
              <Input
                type="number"
                step="1"
                min="1"
                required
                placeholder="उदा. ५०००"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-8 h-10 text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400"
              />
            </div>
            {amount && !isNaN(parseFloat(amount)) && (
              <p className="text-[11px] text-muted-foreground mt-1 font-mono">
                अक्षरी: ₹{parseFloat(amount).toLocaleString("en-IN")}
              </p>
            )}
          </div>

          {/* Row 3: Person Who Pays (पैसे देणारा) */}
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5 mb-1">
              <User className="h-3.5 w-3.5 text-blue-500" /> पैसे देणाऱ्याचे नाव (Person Who Pays) *
            </label>
            <Input
              type="text"
              required
              placeholder="उदा. मालक / मॅनेजरचे नाव"
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
              className="h-9 text-xs font-medium"
            />
          </div>

          {/* Row 4: Payment Method (पेमेंट पद्धत - cash, phonepay) */}
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5 mb-1.5">
              <CreditCard className="h-3.5 w-3.5 text-purple-500" /> पेमेंट पद्धत (Payment Method) *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod("CASH")}
                className={`py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  paymentMethod === "CASH"
                    ? "border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500"
                    : "border-border bg-card text-muted-foreground hover:bg-muted/40"
                }`}
              >
                <Coins className="h-4 w-4 text-emerald-500" />
                <span>रोख (Cash)</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("PHONEPAY")}
                className={`py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  paymentMethod === "PHONEPAY"
                    ? "border-purple-500 bg-purple-500/15 text-purple-700 dark:text-purple-300 ring-1 ring-purple-500"
                    : "border-border bg-card text-muted-foreground hover:bg-muted/40"
                }`}
              >
                <CreditCard className="h-4 w-4 text-purple-500" />
                <span>फोनपे (PhonePe)</span>
              </button>
            </div>
          </div>

          {/* Row 5: Note (नोंद / टीप) */}
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5 mb-1">
              <FileText className="h-3.5 w-3.5 text-muted-foreground" /> नोंद / टीप (Note)
            </label>
            <textarea
              rows={2}
              placeholder="काही विशेष नोंद असल्यास येथे लिहा..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-md border border-input bg-background p-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-hidden focus:ring-1 focus:ring-ring resize-none"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={recordPayment.isPending}
              className="text-xs h-8"
            >
              रद्द करा (Cancel)
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={recordPayment.isPending}
              className="text-xs h-8 gap-1.5 bg-purple-600 hover:bg-purple-700 text-white"
            >
              {recordPayment.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  नोंदवत आहे...
                </>
              ) : (
                <>
                  <Banknote className="h-3.5 w-3.5" />
                  पेमेंट नोंदवा (Save)
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
