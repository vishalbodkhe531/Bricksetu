"use client";

import React, { useState, useMemo } from "react";
import {
  Banknote,
  Calendar,
  Coins,
  CreditCard,
  PlusCircle,
  Clock,
  AlertCircle,
  Filter,
  Receipt,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { KPIGrid, KPICardItem } from "./KPICard";
import { WeeklyPaymentModal } from "./WeeklyPaymentModal";
import { WeeklyPaymentStatementModal } from "./WeeklyPaymentStatementModal";
import { useWeeklyPayments } from "../hooks/useWeeklyPayments";
import { formatDateDdMmYyyy } from "../utils/date-utils";
import { generateWeeklyPaymentPdfHtml } from "../utils/generateWeeklyPaymentPdfHtml";
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

  const [showModal, setShowModal] = useState(false);
  const [showStatementModal, setShowStatementModal] = useState(false);
  const [filterMethod, setFilterMethod] = useState<"ALL" | "CASH" | "PHONEPAY">(
    "ALL"
  );

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

  // Open exact PDF format in a new browser tab for preview, download, and sharing
  const handleOpenPdfInNewTab = () => {
    if (payments.length === 0) {
      toast.error("या कामगारासाठी कोणतीही साप्ताहिक पेमेंट नोंद उपलब्ध नाही");
      return;
    }

    try {
      const html = generateWeeklyPaymentPdfHtml({
        worker,
        payments,
        kpis,
      });

      const blob = new Blob([html], { type: "text/html;charset=utf-8" });
      const blobUrl = URL.createObjectURL(blob);
      const newTab = window.open(blobUrl, "_blank");

      if (!newTab) {
        toast.error("कृपया नवीन टॅब उघडण्यासाठी ब्राऊझरमध्ये पॉपअपला अनुमती द्या");
      } else {
        toast.success("साप्ताहिक पेमेंट पावती (PDF फॉरमॅट) नवीन टॅबमध्ये उघडली आहे!");
      }
    } catch (err) {
      console.error("Error opening PDF in new tab:", err);
      toast.error("PDF उघडताना त्रुटी आली");
    }
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

  // Configure the 4 KPIs required by user
  const kpiItems: KPICardItem[] = [
    {
      id: "total_payment",
      label: "एकूण भरणा",
      icon: Banknote,
      iconColor: "text-primary",
      valueColor: "text-primary",
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
          <Clock className="h-4 w-4 animate-spin text-primary" />
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
              <Banknote className="h-4 w-4 text-primary" />
              साप्ताहिक पेमेंट यादी / Weekly Payments
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {worker.full_name} ({worker.category === "BHATKAR" ? "भटकर" : "आल्यावाले"}) यांना दिलेल्या साप्ताहिक रक्कमेचा तपशील.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto sm:justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleOpenPdfInNewTab}
              disabled={payments.length === 0}
              className="w-full sm:w-auto h-9 sm:h-8 px-3.5 text-xs font-semibold justify-center gap-1.5 border-primary/30 text-primary hover:bg-primary/5 shadow-xs cursor-pointer"
              title={
                payments.length === 0
                  ? "पेमेंट नोंदी उपलब्ध नाहीत"
                  : "पेमेंट हिस्ट्री PDF नवीन टॅबमध्ये उघडा"
              }
            >
              <Receipt className="h-4 w-4 shrink-0 text-primary" />
              <span>पेमेंट हिस्ट्री पाठवा (Send Payment History)</span>
            </Button>

            {canWrite && (
              <Button
                size="sm"
                onClick={() => setShowModal(true)}
                className="w-full sm:w-auto h-9 sm:h-8 px-3.5 text-xs font-semibold justify-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs cursor-pointer"
              >
                <PlusCircle className="h-4 w-4 shrink-0" />
                <span>साप्ताहिक पेमेंट नोंदवा (Add Payment)</span>
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
                    ? "bg-indigo-600 text-white"
                    : "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-500/20"
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
            <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
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
                className="gap-1.5 h-8 text-xs bg-primary hover:bg-primary/90 text-primary-foreground mt-1 cursor-pointer"
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
                <div className="bg-primary/5 dark:bg-primary/10 border-b border-border px-3.5 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Calendar className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-xs font-bold text-foreground break-words leading-snug">
                      {formatWeekLabel(
                        group.weekStartSaturday,
                        group.weekEndFriday
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-1.5 sm:pt-0 border-t sm:border-t-0 border-border/40 sm:border-transparent">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-semibold text-muted-foreground">
                        आठवड्याचा एकूण भरणा:
                      </span>
                      <span className="text-xs sm:text-sm font-bold font-mono text-primary">
                        ₹{group.totalAmount.toLocaleString("en-IN")}
                      </span>
                    </div>

                    <Badge
                      variant="outline"
                      className="text-[10px] font-sans border-primary/20 bg-primary/10 text-primary font-bold shrink-0 whitespace-nowrap px-2 py-0.5"
                    >
                      {group.entriesCount} {group.entriesCount === 1 ? "नोंद" : "नोंदी"}
                    </Badge>
                  </div>
                </div>

                {/* Payments Table within Week */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left min-w-[520px]">
                    <thead className="bg-muted/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      <tr>
                        <th className="py-2 px-3.5 whitespace-nowrap">वार (Day)</th>
                        <th className="py-2 px-3.5 whitespace-nowrap">तारीख (Date)</th>
                        <th className="py-2 px-3.5 whitespace-nowrap">रक्कम (Money ₹)</th>
                        <th className="py-2 px-3.5 whitespace-nowrap">पैसे देणारा (Paid By)</th>
                        <th className="py-2 px-3.5 whitespace-nowrap">पद्धत (Method)</th>
                        <th className="py-2 px-3.5">नोंद / टीप (Note)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {group.payments.map((p) => {
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
                                <Badge className="bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 text-[10px] gap-1 font-semibold">
                                  <CreditCard className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                                  फोनपे (PhonePe)
                                </Badge>
                              )}
                            </td>
                            <td className="py-2.5 px-3.5 text-muted-foreground text-[11px] max-w-xs truncate">
                              {p.notes || "—"}
                            </td>
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

      {/* 6. Modal for Weekly Payment Statement & PDF Download */}
      {showStatementModal && (
        <WeeklyPaymentStatementModal
          open={showStatementModal}
          onClose={() => setShowStatementModal(false)}
          worker={worker}
          payments={payments}
          kpis={kpis}
        />
      )}
    </div>
  );
}
