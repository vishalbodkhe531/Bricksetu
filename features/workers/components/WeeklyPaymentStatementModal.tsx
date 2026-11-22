"use client";

import React, { useRef, useMemo, useState } from "react";
import {
  X,
  Printer,
  Download,
  Copy,
  Check,
  Calendar,
  Banknote,
  Coins,
  CreditCard,
  User,
  ShieldCheck,
  FileText,
  Info,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { formatDateDdMmYyyy } from "../utils/date-utils";
import {
  getWeekEndFriday,
  getWeekStartSaturday,
  formatWeekLabel,
} from "../utils/getWeekBoundary";
import { amountToMarathiWords } from "../utils/amount-to-words";
import { generateWeeklyPaymentPdfHtml } from "../utils/generateWeeklyPaymentPdfHtml";
import type { Worker } from "../types/worker.types";
import type {
  WeeklyPayment,
  WeeklyPaymentKPIs,
  WeeklyPaymentGroup,
} from "../types/weekly-payment.types";

interface WeeklyPaymentStatementModalProps {
  open: boolean;
  onClose: () => void;
  worker: Worker;
  payments: WeeklyPayment[];
  kpis: WeeklyPaymentKPIs;
}

export function WeeklyPaymentStatementModal({
  open,
  onClose,
  worker,
  payments,
  kpis,
}: WeeklyPaymentStatementModalProps) {
  const printableRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  // Group all payments into weekly buckets (Sat - Fri), sorted chronologically (earliest first)
  const sortedWeeklyGroups = useMemo<WeeklyPaymentGroup[]>(() => {
    if (!payments || payments.length === 0) return [];

    const map = new Map<string, WeeklyPaymentGroup>();

    for (const payment of payments) {
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

    // Sort weeks chronologically by week start date
    const groups = Array.from(map.values());
    groups.sort((a, b) =>
      a.weekStartSaturday.localeCompare(b.weekStartSaturday)
    );

    // Also sort payments within each week by payment_date
    groups.forEach((g) => {
      g.payments.sort((p1, p2) =>
        p1.payment_date.localeCompare(p2.payment_date)
      );
    });

    return groups;
  }, [payments]);

  if (!open) return null;

  const todayStr = formatDateDdMmYyyy(new Date().toISOString().split("T")[0]);
  const statementId = `WP-${worker.id.slice(0, 8).toUpperCase()}`;

  // Handle Print and Save as PDF via isolated iframe
  const handlePrint = () => {
    if (!printableRef.current) return;
    setIsPrinting(true);

    try {
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      document.body.appendChild(iframe);

      const contentHtml = printableRef.current.innerHTML;
      const title = `साप्ताहिक_पेमेंट_पावती_${worker.full_name.replace(/\s+/g, "_")}_${todayStr}`;

      const doc = iframe.contentWindow?.document;
      if (!doc) {
        toast.error("प्रिंट विंडो तयार करण्यात अयशस्वी");
        setIsPrinting(false);
        return;
      }

      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html lang="mr">
          <head>
            <meta charset="utf-8" />
            <title>${title}</title>
            <style>
              @page {
                size: A4 portrait;
                margin: 10mm 12mm 12mm 12mm;
              }
              * {
                box-sizing: border-box;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans Devanagari", Arial, sans-serif;
                margin: 0;
                padding: 0;
                background: #ffffff;
                color: #0f172a;
                font-size: 11px;
                line-height: 1.45;
              }
              .pdf-sheet {
                width: 100%;
                max-width: 100%;
                margin: 0 auto;
                background: #ffffff;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 4px;
                margin-bottom: 8px;
              }
              th, td {
                border: 1px solid #cbd5e1;
                padding: 5px 7px;
                text-align: left;
                font-size: 10.5px;
              }
              th {
                background-color: #f1f5f9 !important;
                font-weight: 700;
                color: #334155;
              }
              .header-bar {
                border-bottom: 2px solid #0f172a;
                padding-bottom: 8px;
                margin-bottom: 12px;
              }
              .kpi-grid {
                display: flex;
                gap: 8px;
                margin-bottom: 12px;
              }
              .kpi-card {
                flex: 1;
                border: 1px solid #cbd5e1;
                border-radius: 6px;
                padding: 6px 10px;
                background-color: #f8fafc !important;
              }
              .kpi-label {
                font-size: 9.5px;
                color: #64748b;
                font-weight: 600;
              }
              .kpi-val {
                font-size: 13px;
                font-weight: bold;
                color: #0f172a;
                font-family: monospace;
                margin-top: 2px;
              }
              .badge-cash {
                display: inline-block;
                padding: 2px 5px;
                border-radius: 4px;
                background: #dcfce7 !important;
                color: #166534 !important;
                font-weight: 700;
                font-size: 9.5px;
                border: 1px solid #86efac;
              }
              .badge-phonepe {
                display: inline-block;
                padding: 2px 5px;
                border-radius: 4px;
                background: #e0e7ff !important;
                color: #3730a3 !important;
                font-weight: 700;
                font-size: 9.5px;
                border: 1px solid #a5b4fc;
              }
              .week-banner {
                background-color: #f1f5f9 !important;
                border: 1px solid #cbd5e1;
                border-bottom: none;
                padding: 5px 8px;
                font-weight: 700;
                font-size: 11px;
                display: flex;
                justify-content: space-between;
                align-items: center;
              }
              .week-block {
                margin-bottom: 12px;
                page-break-inside: avoid;
              }
              .signatures-container {
                margin-top: 30px;
                display: flex;
                justify-content: space-between;
                page-break-inside: avoid;
              }
              .sig-line {
                width: 29%;
                text-align: center;
                border-top: 1px dashed #64748b;
                padding-top: 6px;
                font-size: 10px;
                font-weight: 600;
                color: #334155;
              }
              .no-print {
                display: none !important;
              }
            </style>
          </head>
          <body>
            <div class="pdf-sheet">
              ${contentHtml}
            </div>
          </body>
        </html>
      `);
      doc.close();

      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
          setIsPrinting(false);
        }, 2000);
      }, 400);
    } catch (err) {
      console.error("Print error:", err);
      toast.error("प्रिंट प्रक्रियेमध्ये अडचण आली");
      setIsPrinting(false);
    }
  };

  // Open exact PDF format in a new browser tab
  const handleOpenInNewTab = () => {
    try {
      const html = generateWeeklyPaymentPdfHtml({ worker, payments, kpis });
      const blob = new Blob([html], { type: "text/html;charset=utf-8" });
      const blobUrl = URL.createObjectURL(blob);
      const newTab = window.open(blobUrl, "_blank");
      if (!newTab) {
        toast.error("कृपया नवीन टॅब उघडण्यासाठी ब्राऊझर पॉपअपला अनुमती द्या");
      } else {
        toast.success("साप्ताहिक पेमेंट पावती नवीन टॅबमध्ये उघडली आहे!");
      }
    } catch (e) {
      console.error(e);
      toast.error("नवीन टॅब उघडताना त्रुटी आली");
    }
  };

  // Copy WhatsApp-ready summary text
  const handleCopyWhatsApp = () => {
    const text = `📋 *साप्ताहिक पेमेंट पावती - विशाल विटभट्टी उद्योजक*
👤 *कामगार नाव:* ${worker.full_name} (${worker.category === "BHATKAR" ? "भटकर" : "आल्यावाले"})
📱 *मोबाईल:* ${worker.phone || "—"}
📅 *दिनांक:* ${todayStr}
🆔 *पावती क्र.:* ${statementId}
----------------------------------------
💰 *ठरलेली उचल/रक्कम:* ₹${kpis.total_decided_amount.toLocaleString("en-IN")}
💵 *आतापर्यंत एकूण भरणा:* ₹${kpis.total_payment.toLocaleString("en-IN")}
🪙 *शिल्लक देय बाकी:* ₹${kpis.remaining_amount.toLocaleString("en-IN")}
----------------------------------------
💳 *भरणा तपशील:*
• रोख भरणा: ₹${kpis.cash_amount.toLocaleString("en-IN")} (${kpis.cash_count} वेळा)
• फोनपे भरणा: ₹${kpis.phonepay_amount.toLocaleString("en-IN")} (${kpis.phonepay_count} वेळा)
📊 *एकूण आठवडे:* ${sortedWeeklyGroups.length} | *एकूण नोंदी:* ${payments.length}

(सविस्तर पीडीएफ हिशोब पावती सोबत जोडली आहे)`;

    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true);
        toast.success("व्हॉट्सॲप मेसेज कॉपी झाला! आपण कामगाराला पाठवू शकता.");
        setTimeout(() => setCopied(false), 2500);
      })
      .catch(() => {
        toast.error("मजकूर कॉपी करण्यात त्रुटी आली");
      });
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-card border border-border rounded-xl max-w-4xl w-full my-auto flex flex-col shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 max-h-[95vh]">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between border-b border-border p-4 bg-muted/40 rounded-t-xl gap-2 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                साप्ताहिक पेमेंट पावती / स्टेटमेंट
                <Badge
                  variant="outline"
                  className="text-[10px] font-sans border-primary/30 bg-primary/10 text-primary"
                >
                  PDF पूर्वावलोकन (Preview)
                </Badge>
              </h3>
              <p className="text-xs text-muted-foreground">
                {worker.full_name} ({worker.category === "BHATKAR" ? "भटकर" : "आल्यावाले"}) • {payments.length} नोंदी
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyWhatsApp}
              className="gap-1.5 h-8 text-xs cursor-pointer border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10"
              title="व्हॉट्सॲपसाठी सारांश मजकूर कॉपी करा"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  कॉपी झाले!
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  व्हॉट्सॲप मजकूर (Copy)
                </>
              )}
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={handleOpenInNewTab}
              disabled={payments.length === 0}
              className="gap-1.5 h-8 text-xs bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              PDF डाऊनलोड करा (Download PDF)
            </Button>

            <button
              type="button"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground rounded p-1 transition-colors ml-1 cursor-pointer"
              title="बंद करा"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Helpful Tip Notice */}
        <div className="bg-primary/10 border-b border-primary/20 px-4 py-2 flex items-center gap-2 text-[11px] text-primary">
          <Info className="h-3.5 w-3.5 shrink-0" />
          <span>
            <strong>💡 टीप:</strong> <strong>&apos;PDF डाऊनलोड करा&apos;</strong> बटनावर क्लिक करून थेट अधिकृत PDF फाईल डाऊनलोड करा आणि कामगाराला WhatsApp वर पाठवा.
          </span>
        </div>

        {/* Modal Scrollable Body - Document Preview Canvas */}
        <div className="p-4 sm:p-6 overflow-y-auto bg-muted/20 flex justify-center">
          {/* A4 Paper Container */}
          <div
            ref={printableRef}
            className="w-full max-w-[780px] bg-white text-slate-900 border border-slate-200 rounded-lg shadow-md p-6 sm:p-8 space-y-4 print:p-0 print:border-none print:shadow-none"
          >
            {/* 1. Official Header */}
            <div className="border-b-2 border-slate-900 pb-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-slate-900">
                      विशाल विटभट्टी उद्योजक
                    </span>
                    <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-semibold border border-slate-300">
                      अधिकृत पावती
                    </span>
                  </div>
                  <h2 className="text-sm font-bold text-slate-800 mt-0.5">
                    कामगार साप्ताहिक पेमेंट हिशोब पावती व विवरणपत्र
                  </h2>
                  <p className="text-[10px] text-slate-500">
                    (Worker Weekly Payment Ledger &amp; Disbursement Voucher)
                  </p>
                </div>

                <div className="text-right text-[11px] font-mono shrink-0">
                  <div className="font-bold text-slate-800">
                    पावती क्र.: {statementId}
                  </div>
                  <div className="text-slate-600 text-[10px]">
                    दिनांक: {todayStr}
                  </div>
                  <div className="text-[9px] text-slate-400">
                    वेळ: {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Worker Information Card */}
            <div className="border border-slate-200 rounded-md bg-slate-50/70 p-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block font-semibold">कामगाराचे नाव:</span>
                  <span className="font-bold text-slate-900">{worker.full_name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block font-semibold">कामगार वर्ग:</span>
                  <span className="font-bold text-slate-800">
                    {worker.category === "BHATKAR" ? "भटकर (Bhatkar)" : "आल्यावाले (Aalyawale)"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block font-semibold">मोबाईल क्र.:</span>
                  <span className="font-mono font-medium text-slate-800">
                    {worker.phone || "उपलब्ध नाही"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block font-semibold">गाव / पत्ता:</span>
                  <span className="text-slate-800 truncate block">
                    {worker.address || "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Financial Summary KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="border border-slate-200 rounded-md p-2.5 bg-slate-50">
                <div className="text-[10px] font-semibold text-slate-600 flex items-center gap-1">
                  <Coins className="h-3 w-3 text-amber-600" />
                  ठरलेली उचल/रक्कम
                </div>
                <div className="text-sm font-bold font-mono text-slate-900 mt-1">
                  ₹{kpis.total_decided_amount.toLocaleString("en-IN")}
                </div>
                <div className="text-[9px] text-slate-500 mt-0.5">निश्चित केलेली रक्कम</div>
              </div>

              <div className="border border-emerald-200 rounded-md p-2.5 bg-emerald-50/50">
                <div className="text-[10px] font-semibold text-emerald-800 flex items-center gap-1">
                  <Banknote className="h-3 w-3 text-emerald-700" />
                  एकूण दिलेला भरणा
                </div>
                <div className="text-sm font-bold font-mono text-emerald-700 mt-1">
                  ₹{kpis.total_payment.toLocaleString("en-IN")}
                </div>
                <div className="text-[9px] text-emerald-600 mt-0.5">
                  एकूण {payments.length} साप्ताहिक नोंदी
                </div>
              </div>

              <div className="border border-amber-200 rounded-md p-2.5 bg-amber-50/50">
                <div className="text-[10px] font-semibold text-amber-800 flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-amber-700" />
                  उर्वरित शिल्लक बाकी
                </div>
                <div className="text-sm font-bold font-mono text-amber-800 mt-1">
                  ₹{kpis.remaining_amount.toLocaleString("en-IN")}
                </div>
                <div className="text-[9px] text-amber-700 mt-0.5">
                  {kpis.remaining_amount > 0 ? "देणे बाकी शिल्लक" : "पूर्ण भरणा झाला"}
                </div>
              </div>

              <div className="border border-indigo-200 rounded-md p-2.5 bg-indigo-50/40">
                <div className="text-[10px] font-semibold text-indigo-800 flex items-center gap-1">
                  <CreditCard className="h-3 w-3 text-indigo-700" />
                  पद्धतीनुसार विभागणी
                </div>
                <div className="text-[10.5px] font-medium text-slate-800 mt-1 space-y-0.5">
                  <div className="flex justify-between font-mono">
                    <span>रोख:</span>
                    <span className="font-bold text-emerald-700">₹{kpis.cash_amount.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span>फोनपे:</span>
                    <span className="font-bold text-indigo-700">₹{kpis.phonepay_amount.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Weekly Payments Breakdown Table */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between border-b border-slate-300 pb-1.5">
                <h4 className="text-xs font-bold text-slate-800">
                  साप्ताहिक पेमेंट तपशील (Weekly Payments Breakdown)
                </h4>
                <span className="text-[10px] font-mono text-slate-500">
                  एकूण {sortedWeeklyGroups.length} आठवडे • {payments.length} नोंदी
                </span>
              </div>

              {sortedWeeklyGroups.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-300 rounded">
                  कोणतीही पेमेंट नोंद उपलब्ध नाही.
                </div>
              ) : (
                <div className="space-y-3">
                  {sortedWeeklyGroups.map((group, groupIdx) => (
                    <div
                      key={group.weekKey}
                      className="border border-slate-300 rounded-md overflow-hidden week-block"
                    >
                      {/* Week Header */}
                      <div className="bg-slate-100 px-3 py-1.5 flex items-center justify-between border-b border-slate-300 font-bold text-xs text-slate-800">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-slate-600" />
                          <span>
                            आठवडा {groupIdx + 1}: {formatWeekLabel(group.weekStartSaturday, group.weekEndFriday)}
                          </span>
                        </div>
                        <div className="font-mono text-xs text-slate-900">
                          आठवडा भरणा: <span className="text-emerald-700 font-bold">₹{group.totalAmount.toLocaleString("en-IN")}</span> ({group.entriesCount} नोंद)
                        </div>
                      </div>

                      {/* Week Payments Table */}
                      <table className="w-full text-left text-xs m-0">
                        <thead className="bg-slate-50 text-[10px] text-slate-700 font-bold border-b border-slate-300">
                          <tr>
                            <th className="py-1.5 px-2.5 w-10 text-center">अ.क्र.</th>
                            <th className="py-1.5 px-2.5 w-24">वार</th>
                            <th className="py-1.5 px-2.5 w-24">दिनांक</th>
                            <th className="py-1.5 px-2.5 w-28 text-right">रक्कम (₹)</th>
                            <th className="py-1.5 px-2.5 w-36">पैसे देणारा</th>
                            <th className="py-1.5 px-2.5 w-28">भरणा पद्धत</th>
                            <th className="py-1.5 px-2.5">नोंद / टीप</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {group.payments.map((p, pIdx) => (
                            <tr key={p.id} className="text-slate-800">
                              <td className="py-1.5 px-2.5 text-center font-mono text-[10px] text-slate-500">
                                {pIdx + 1}
                              </td>
                              <td className="py-1.5 px-2.5 font-semibold text-amber-700 text-[11px]">
                                {p.day_of_week}
                              </td>
                              <td className="py-1.5 px-2.5 font-mono text-[10.5px] text-slate-700">
                                {formatDateDdMmYyyy(p.payment_date)}
                              </td>
                              <td className="py-1.5 px-2.5 font-mono font-bold text-emerald-700 text-right text-[11.5px]">
                                ₹{p.amount.toLocaleString("en-IN")}
                              </td>
                              <td className="py-1.5 px-2.5 font-medium text-slate-900 text-[10.5px]">
                                {p.paid_by}
                              </td>
                              <td className="py-1.5 px-2.5">
                                {p.payment_method === "CASH" ? (
                                  <span className="badge-cash">
                                    रोख (Cash)
                                  </span>
                                ) : (
                                  <span className="badge-phonepe">
                                    फोनपे (PhonePe)
                                  </span>
                                )}
                              </td>
                              <td className="py-1.5 px-2.5 text-slate-600 text-[10px]">
                                {p.notes || "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              )}

              {/* Grand Total Summary Box */}
              {payments.length > 0 && (
                <div className="border-2 border-slate-900 rounded-md p-3 bg-slate-50 space-y-1 mt-4">
                  <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
                    <span className="text-slate-900">
                      एकूण सर्व साप्ताहिक भरणा (Total Disbursed Amount):
                    </span>
                    <span className="text-base font-bold font-mono text-emerald-800">
                      ₹{kpis.total_payment.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-700 pt-0.5 border-t border-slate-200 flex items-center justify-between flex-wrap gap-1">
                    <span>
                      <strong>अक्षरी रक्कम:</strong> {amountToMarathiWords(kpis.total_payment)}
                    </span>
                    <span className="font-mono text-[10px] text-slate-500">
                      शिल्लक बाकी: ₹{kpis.remaining_amount.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 5. Signatures and Stamps Section */}
            <div className="pt-8 signatures-container">
              <div className="sig-line">
                <div className="h-8"></div>
                कामगार / आल्यावाले स्वाक्षरी किंवा अंगठा
                <div className="text-[9px] text-slate-500 font-normal">
                  ({worker.full_name})
                </div>
              </div>

              <div className="sig-line">
                <div className="h-8"></div>
                मुकादम / हिशोब तपासणीस स्वाक्षरी
                <div className="text-[9px] text-slate-500 font-normal">
                  (पैसे देणारा / पर्यवेक्षक)
                </div>
              </div>

              <div className="sig-line">
                <div className="h-8"></div>
                विटभट्टी मालक / अधिकृत सही व शिक्का
                <div className="text-[9px] text-slate-500 font-normal">
                  (विशाल विटभट्टी उद्योजक)
                </div>
              </div>
            </div>

            {/* 6. Document Footer Notice */}
            <div className="border-t border-slate-200 pt-3 mt-4 text-[9.5px] text-slate-500 space-y-0.5">
              <p>
                • ही पावती संगणकीय प्रणालीद्वारे (BrickSetu) तयार करण्यात आली असून अधिकृत नोंदीशी पडताळली आहे.
              </p>
              <p>
                • या पावतीमधील रकमेबाबत अथवा साप्ताहिक नोंदीबाबत काही आक्षेप असल्यास तात्काळ विटभट्टी कार्यालयाशी संपर्क साधावा.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="border-t border-border p-3 bg-muted/40 rounded-b-xl flex items-center justify-between text-xs">
          <span className="text-muted-foreground text-[11px]">
            {payments.length} पेमेंट नोंदी • एकूण रक्कम: ₹{kpis.total_payment.toLocaleString("en-IN")}
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs h-8 cursor-pointer"
            >
              बंद करा (Close)
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleOpenInNewTab}
              disabled={payments.length === 0}
              className="gap-1.5 h-8 text-xs bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer shadow-xs"
            >
              <Download className="h-3.5 w-3.5" />
              PDF डाऊनलोड करा (Download PDF)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

