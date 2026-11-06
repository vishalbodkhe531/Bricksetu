"use client";

import React, { useState, useMemo } from "react";
import {
  Banknote,
  Calendar,
  Coins,
  CreditCard,
  PlusCircle,
  Trash2,
  Loader2,
  Clock,
  AlertCircle,
  Filter,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { KPIGrid, KPICardItem } from "./KPICard";
import { WeeklyPaymentModal } from "./WeeklyPaymentModal";
import {
  useWeeklyPayments,
  useDeleteWeeklyPayment,
} from "../hooks/useWeeklyPayments";
import { formatDateDdMmYyyy } from "../utils/date-utils";
import {
  getWeekEndFriday,
  getWeekStartSaturday,
  formatWeekLabel,
} from "../utils/getWeekBoundary";
import type { Worker } from "../types/worker.types";
import type { WeeklyPaymentGroup } from "../types/weekly-payment.types";

interface WorkerWeeklyPaymentTabProps {
  worker: Worker;
  orgId?: string;
  canWrite: boolean;
}

export function WorkerWeeklyPaymentTab({
  worker,
  canWrite,
}: WorkerWeeklyPaymentTabProps) {
  const { data, isLoading, error } = useWeeklyPayments(worker.id);
  const deleteMutation = useDeleteWeeklyPayment(worker.id);

  const [showModal, setShowModal] = useState(false);
  const [filterMethod, setFilterMethod] = useState<"ALL" | "CASH" | "PHONEPAY">(
    "ALL"
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const payments = useMemo(() => data?.payments || [], [data?.payments]);
  const kpis = data?.kpis || {
    total_payment: 0,
    total_decided_amount: Number(worker.total_decided_advance_amount || 0),
    cash_count: 0,
    phonepay_count: 0,
    cash_amount: 0,
    phonepay_amount: 0,
    remaining_amount: Number(worker.total_decided_advance_amount || 0),
  };

  // Filter payments by payment method if chosen
  const filteredPayments = useMemo(() => {
    if (filterMethod === "ALL") return payments;
    return payments.filter((p) => p.payment_method === filterMethod);
  }, [payments, filterMethod]);

  // Group payments into weekly buckets (Saturday to Friday)
  const weeklyGroups = useMemo<WeeklyPaymentGroup[]>(() => {
    if (!filteredPayments || filteredPayments.length === 0) return [];

    const map = new Map<string, WeeklyPaymentGroup>();

    for (const payment of filteredPayments) {
      const fridayDate = getWeekEndFriday(payment.payment_date);
      const saturdayDate = getWeekStartSaturday(fridayDate);
      const weekKey = `week_${fridayDate}`;

      const existing = map.get(weekKey);
      if (existing) {
        existing.payments.push(payment);
        existing.totalAmount += payment.amount;
        existing.entriesCount += 1;
      } else {
        map.set(weekKey, {
          weekKey,
          weekStartSaturday: saturdayDate,
          weekEndFriday: fridayDate,
          totalAmount: payment.amount,
          entriesCount: 1,
          payments: [payment],
        });
      }
    }

    return Array.from(map.values());
  }, [filteredPayments]);

  // Handle delete payment
  const handleDelete = async (paymentId: string) => {
    if (
      !confirm(
        "हे साप्ताहिक पेमेंट खरोखर हटवायचे आहे का? / Are you sure you want to delete this weekly payment?"
      )
    ) {
      return;
    }

    setDeletingId(paymentId);
    try {
      await deleteMutation.mutateAsync(paymentId);
      toast.success("साप्ताहिक पेमेंट यशस्वीरीत्या हटवले (Payment deleted successfully)");
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "पेमेंट हटवण्यात त्रुटी आली";
      toast.error(errorMsg);
    } finally {
      setDeletingId(null);
    }
  };

  // Configure the 4 KPIs required by user
  const kpiItems: KPICardItem[] = [
    {
      id: "total_payment",
      label: "एकूण भरणा",
      icon: Banknote,
      iconColor: "text-purple-500",
      valueColor: "text-purple-600 dark:text-purple-400",
      value: `₹${kpis.total_payment.toLocaleString("en-IN")}`,
      subtext: `${payments.length} एकूण साप्ताहिक नोंदी`,
    },
    {
      id: "total_decided_amount",
      label: "ठरलेली रक्कम",
      icon: Coins,
      iconColor: "text-amber-500",
      valueColor: "text-amber-600 dark:text-amber-400",
      value: `₹${kpis.total_decided_amount.toLocaleString("en-IN")}`,
      subtext:
        kpis.remaining_amount > 0
          ? `शिल्लक देय: ₹${kpis.remaining_amount.toLocaleString("en-IN")}`
          : "पूर्ण भरणा झाला",
    },
    {
      id: "cash_payment_count",
      label: "रोख भरणा",
      icon: Coins,
      iconColor: "text-emerald-500",
      valueColor: "text-emerald-600 dark:text-emerald-400",
      value: `${kpis.cash_count} वेळा`,
      subtext: `एकूण रोख: ₹${kpis.cash_amount.toLocaleString("en-IN")}`,
    },
    {
      id: "phonepay_payment_count",
      label: "फोनपे भरणा",
      icon: CreditCard,
      iconColor: "text-indigo-500",
      valueColor: "text-indigo-600 dark:text-indigo-400",
      value: `${kpis.phonepay_count} वेळा`,
      subtext: `एकूण फोनपे: ₹${kpis.phonepay_amount.toLocaleString("en-IN")}`,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <Clock className="h-4 w-4 animate-spin text-purple-500" />
          साप्ताहिक पेमेंट माहिती लोड होत आहे... (Loading weekly payments...)
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center border border-border rounded-lg bg-card">
        <AlertCircle className="h-7 w-7 text-destructive mx-auto mb-2" />
        <h3 className="text-sm font-bold text-foreground">
          माहिती मिळवण्यात त्रुटी आली
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          {(error as Error)?.message || "Failed to load weekly payments"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 1. KPI Cards Grid (4 items) */}
      <KPIGrid items={kpiItems} columns={4} />

      {/* 2. Main Container with Actions & Filters */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-4">
        {/* Top Header & Action Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border pb-3">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Banknote className="h-4 w-4 text-purple-500" />
              साप्ताहिक पेमेंट यादी / Weekly Payments
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {worker.full_name} ({worker.category === "BHATKAR" ? "भटकर" : "आल्यावाले"}) यांना दिलेल्या साप्ताहिक रक्कमेचा तपशील.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {canWrite && (
              <Button
                size="sm"
                onClick={() => setShowModal(true)}
                className="gap-1.5 h-8 text-xs bg-purple-600 hover:bg-purple-700 text-white shadow-xs cursor-pointer"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                साप्ताहिक पेमेंट नोंदवा (Add Payment)
              </Button>
            )}
          </div>
        </div>

        {/* Filter Badges Row */}
        {payments.length > 0 && (
          <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[11px] font-semibold text-muted-foreground">
                पद्धत निवडा:
              </span>
              <button
                type="button"
                onClick={() => setFilterMethod("ALL")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                  filterMethod === "ALL"
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                सर्व ({payments.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterMethod("CASH")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                  filterMethod === "CASH"
                    ? "bg-emerald-600 text-white"
                    : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20"
                }`}
              >
                रोख ({kpis.cash_count})
              </button>
              <button
                type="button"
                onClick={() => setFilterMethod("PHONEPAY")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                  filterMethod === "PHONEPAY"
                    ? "bg-purple-600 text-white"
                    : "bg-purple-500/10 text-purple-700 dark:text-purple-300 hover:bg-purple-500/20"
                }`}
              >
                फोनपे ({kpis.phonepay_count})
              </button>
            </div>

            <div className="text-[11px] text-muted-foreground font-mono">
              एकूण {weeklyGroups.length} आठवडे नोंदणीकृत
            </div>
          </div>
        )}

        {/* 3. Empty State */}
        {payments.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-border rounded-xl bg-muted/20 space-y-3">
            <div className="h-12 w-12 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto">
              <Banknote className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground">
                कोणतेही साप्ताहिक पेमेंट नोंदवलेले नाही
              </h4>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                या कामगारासाठी अजून कोणत्याही साप्ताहिक पेमेंटची नोंद झालेली नाही. वर दिलेल्या बटनावर क्लिक करून नवीन नोंद करा.
              </p>
            </div>
            {canWrite && (
              <Button
                size="sm"
                onClick={() => setShowModal(true)}
                className="gap-1.5 h-8 text-xs bg-purple-600 hover:bg-purple-700 text-white mt-1 cursor-pointer"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                पहिले साप्ताहिक पेमेंट नोंदवा
              </Button>
            )}
          </div>
        ) : weeklyGroups.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground">
            निवडलेल्या फिल्टरनुसार कोणत्याही नोंदी सापडल्या नाहीत.
          </div>
        ) : (
          /* 4. Weekly Grouped Payment Tables */
          <div className="space-y-4">
            {weeklyGroups.map((group) => (
              <div
                key={group.weekKey}
                className="border border-border rounded-xl overflow-hidden shadow-2xs"
              >
                {/* Week Header Banner */}
                <div className="bg-purple-500/10 dark:bg-purple-950/30 border-b border-border px-3.5 py-2.5 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    <span className="text-xs font-bold text-foreground">
                      {formatWeekLabel(
                        group.weekStartSaturday,
                        group.weekEndFriday
                      )}
                    </span>
                    <Badge
                      variant="outline"
                      className="text-[10px] font-sans border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-300"
                    >
                      {group.entriesCount} {group.entriesCount === 1 ? "नोंद" : "नोंदी"}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-muted-foreground">
                      आठवड्याचा एकूण भरणा:
                    </span>
                    <span className="text-sm font-bold font-mono text-purple-600 dark:text-purple-400">
                      ₹{group.totalAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Payments Table within Week */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-muted/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      <tr>
                        <th className="py-2 px-3.5 whitespace-nowrap">वार (Day)</th>
                        <th className="py-2 px-3.5 whitespace-nowrap">तारीख (Date)</th>
                        <th className="py-2 px-3.5 whitespace-nowrap">रक्कम (Money ₹)</th>
                        <th className="py-2 px-3.5 whitespace-nowrap">पैसे देणारा (Paid By)</th>
                        <th className="py-2 px-3.5 whitespace-nowrap">पद्धत (Method)</th>
                        <th className="py-2 px-3.5">नोंद / टीप (Note)</th>
                        {canWrite && (
                          <th className="py-2 px-3.5 text-right whitespace-nowrap">
                            कृती (Action)
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {group.payments.map((p) => {
                        const isDeletingThis = deletingId === p.id;
                        return (
                          <tr
                            key={p.id}
                            className="hover:bg-muted/30 transition-colors"
                          >
                            <td className="py-2.5 px-3.5 font-semibold text-amber-600 dark:text-amber-400 whitespace-nowrap">
                              {p.day_of_week}
                            </td>
                            <td className="py-2.5 px-3.5 font-mono text-muted-foreground whitespace-nowrap">
                              {formatDateDdMmYyyy(p.payment_date)}
                            </td>
                            <td className="py-2.5 px-3.5 font-bold font-mono text-emerald-600 dark:text-emerald-400 whitespace-nowrap text-sm">
                              ₹{p.amount.toLocaleString("en-IN")}
                            </td>
                            <td className="py-2.5 px-3.5 font-medium text-foreground whitespace-nowrap">
                              {p.paid_by}
                            </td>
                            <td className="py-2.5 px-3.5 whitespace-nowrap">
                              {p.payment_method === "CASH" ? (
                                <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[10px] gap-1 font-semibold">
                                  <Coins className="h-3 w-3 text-emerald-600" />
                                  रोख (Cash)
                                </Badge>
                              ) : (
                                <Badge className="bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30 text-[10px] gap-1 font-semibold">
                                  <CreditCard className="h-3 w-3 text-purple-600" />
                                  फोनपे (PhonePe)
                                </Badge>
                              )}
                            </td>
                            <td className="py-2.5 px-3.5 text-muted-foreground text-[11px] max-w-xs truncate">
                              {p.notes || "—"}
                            </td>
                            {canWrite && (
                              <td className="py-2.5 px-3.5 text-right whitespace-nowrap">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={isDeletingThis}
                                  onClick={() => handleDelete(p.id)}
                                  className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                                  title="पेमेंट हटवा (Delete payment)"
                                >
                                  {isDeletingThis ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-3.5 w-3.5" />
                                  )}
                                </Button>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Modal to Record Weekly Payment */}
      {showModal && (
        <WeeklyPaymentModal
          open={showModal}
          onClose={() => setShowModal(false)}
          worker={worker}
        />
      )}
    </div>
  );
}
