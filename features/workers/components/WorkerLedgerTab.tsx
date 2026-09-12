"use client";

import React, { useState, Fragment } from "react";
import {
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  Coins,
  Lock,
  PlusCircle,
  Trash2,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useGroupedDailyLogs } from "@/features/workers/hooks/useGroupedDailyLogs";
import { useWeeklyGroupedLogs, WeekBucket } from "@/features/workers/hooks/useWeeklyGroupedLogs";
import { useDeleteDailyWorkLog, useCreateSettlement } from "@/features/workers/hooks/useWorkers";
import { getMarathiDay, formatDateDdMmYyyy } from "@/features/workers/utils/date-utils";
import { formatWeekLabel } from "@/features/workers/utils/getWeekBoundary";
import { WeeklyCheckoutDialog } from "./WeeklyCheckoutDialog";
import type { Worker } from "@/features/workers/types/worker.types";

interface WorkerLedgerTabProps {
  worker: Worker;
  dailyWorkData: any;
  orgId: string;
  canWrite: boolean;
  onSwitchToRecordWork: () => void;
}

export function WorkerLedgerTab({
  worker,
  dailyWorkData,
  orgId,
  canWrite,
  onSwitchToRecordWork,
}: WorkerLedgerTabProps) {
  const groupedDailyLogs = useGroupedDailyLogs(dailyWorkData?.logs, worker.category);
  const weeklyBuckets = useWeeklyGroupedLogs(groupedDailyLogs);
  const deleteDailyWorkLog = useDeleteDailyWorkLog(orgId);
  const createSettlement = useCreateSettlement(orgId);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedRowKeys, setExpandedRowKeys] = useState<Record<string, boolean>>({});
  const [selectedWeekForCheckout, setSelectedWeekForCheckout] = useState<WeekBucket | null>(null);

  const toggleRowExpand = (key: string) => {
    setExpandedRowKeys((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleDeleteLog = async (logId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this daily work log entry? / हे काम नोंद खरोखर हटवायचे आहे का?",
      )
    ) {
      return;
    }

    setDeletingId(logId);
    try {
      await deleteDailyWorkLog.mutateAsync(logId);
      toast.success("Daily work log deleted successfully / काम नोंद हटवली");
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete daily work log");
    } finally {
      setDeletingId(null);
    }
  };

  const isNoDailyWorkRole =
    worker.category === "BHATKAR" || worker.category === "AALYAWALE";

  // Calculate Overall Grand Totals
  const grandTotalEarned = weeklyBuckets.reduce((sum, w) => sum + w.totalEarnedAmount, 0);
  const grandTotalBillable = weeklyBuckets.reduce((sum, w) => sum + w.totalBillableQty, 0);
  const grandTotalPhysical = weeklyBuckets.reduce((sum, w) => sum + w.totalPhysicalQty, 0);

  return (
    <div className="rounded-b-lg border border-border bg-card p-4 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Coins className="h-3.5 w-3.5 text-amber-500" /> Daily Work Logs &
          Earnings Ledger
        </h3>
        {canWrite && !isNoDailyWorkRole && (
          <Button
            variant="outline"
            size="sm"
            className="h-7 gap-1 text-[11px] border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
            onClick={onSwitchToRecordWork}
          >
            <PlusCircle className="h-3 w-3 text-amber-500" /> Log Daily Work
          </Button>
        )}
      </div>

      {weeklyBuckets && weeklyBuckets.length > 0 ? (
        <div className="border border-border rounded-lg overflow-x-auto shadow-xs">
          <table className="w-full min-w-170 text-xs text-left border-collapse">
            <thead className="bg-muted/60 text-muted-foreground border-b border-border font-semibold uppercase text-[10px] tracking-wider whitespace-nowrap">
              <tr>
                <th className="py-3 px-3.5">Day / वार</th>
                <th className="py-3 px-3.5">Date</th>
                <th className="py-3 px-3.5">Entry Mode</th>
                <th className="py-3 px-3.5 text-right">Physical Qty</th>
                <th className="py-3 px-3.5 text-right">Billable Qty</th>
                <th className="py-3 px-3.5 text-right">Rate</th>
                <th className="py-3 px-3.5 text-right">Earned Amount</th>
                {worker.category === "AALYAWALE" || worker.category === "BHATKAR" ? (
                  <th className="py-3 px-3.5">Kachha Maal Majur</th>
                ) : (
                  <th className="py-3 px-3.5">Aalyawala</th>
                )}
                {worker.category === "BHATKAR" ? (
                  <th className="py-3 px-3.5">Aalyawala</th>
                ) : (
                  <th className="py-3 px-3.5">Bhatkar</th>
                )}
                <th className="py-3 px-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 font-mono">
              {weeklyBuckets.map((week) => (
                <Fragment key={week.id}>
                  {/* Daily Work Logs for this Week */}
                  {week.logs.map((logGroup: any) => {
                    const isMulti = logGroup.items.length > 1;
                    const isExpanded = !!expandedRowKeys[logGroup.id];

                    const isSettled =
                      !!logGroup.settlement_id ||
                      logGroup.items.some((i: any) => !!i.settlement_id);

                    const uniqueAalyawalas = Array.from(
                      new Set(
                        logGroup.items
                          .map((i: any) => i.aalyawala_name)
                          .filter(Boolean),
                      ),
                    );
                    const aalyawalaNames = uniqueAalyawalas.join(", ");

                    const uniqueKachhaMaals = Array.from(
                      new Set(
                        logGroup.items
                          .map((i: any) => i.kachha_maal_name)
                          .filter(Boolean),
                      ),
                    );
                    const kachhaMaalNames = uniqueKachhaMaals.join(", ");

                    const logToDeleteId =
                      logGroup.items?.[0]?.id || logGroup.id;
                    const isDeletingThis =
                      deletingId === logToDeleteId ||
                      deletingId === logGroup.id;

                    return (
                      <Fragment key={logGroup.id}>
                        <tr
                          onClick={() =>
                            isMulti && toggleRowExpand(logGroup.id)
                          }
                          className={`transition-colors ${
                            isMulti
                              ? "cursor-pointer hover:bg-amber-500/10 dark:hover:bg-amber-500/15"
                              : "hover:bg-muted/30"
                          } ${
                            isExpanded
                              ? "bg-amber-500/10 dark:bg-amber-950/30"
                              : ""
                          }`}
                        >
                          <td className="py-3 px-3.5 font-sans font-semibold text-amber-600 dark:text-amber-400 text-xs whitespace-nowrap">
                            {getMarathiDay(logGroup.work_date)}
                          </td>
                          <td className="py-3 px-3.5 font-semibold text-foreground whitespace-nowrap">
                            {formatDateDdMmYyyy(logGroup.work_date)}
                          </td>
                          <td className="py-3 px-3.5 whitespace-nowrap">
                            {logGroup.entry_mode === "PINJRI_COUNT" ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                                {logGroup.input_quantity?.toLocaleString()} Pinjri
                              </span>
                            ) : isMulti || logGroup.entry_mode === "MULTI" ? (
                              <Badge
                                variant="outline"
                                className="text-[10px] font-sans bg-amber-500/10 text-amber-600 border-amber-500/30"
                              >
                                {logGroup.items.length} Entries
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="text-[10px] font-sans"
                              >
                                {logGroup.entry_mode === "SHIFT_COUNT"
                                  ? "Shift"
                                  : "Direct Bricks"}
                              </Badge>
                            )}
                          </td>
                          <td className="py-3 px-3.5 text-right text-muted-foreground font-semibold whitespace-nowrap">
                            {logGroup.physical_quantity?.toLocaleString()}
                          </td>
                          <td className="py-3 px-3.5 text-right font-bold text-foreground whitespace-nowrap">
                            {logGroup.billable_quantity?.toLocaleString()}
                          </td>
                          <td className="py-3 px-3.5 text-right text-muted-foreground whitespace-nowrap">
                            {isMulti && logGroup.items.some((i: any) => i.rate !== logGroup.items[0]?.rate)
                              ? "—"
                              : `₹${Number(logGroup.rate || 0).toFixed(2)}`}
                          </td>
                          <td className="py-3 px-3.5 text-right font-bold text-emerald-600 dark:text-emerald-400 text-xs whitespace-nowrap">
                            ₹{Number(logGroup.earned_amount || 0).toFixed(2)}
                          </td>
                          <td className="py-3 px-3.5 font-sans text-foreground text-[11px] font-medium whitespace-nowrap">
                            {isNoDailyWorkRole ? (
                              isMulti ? (
                                <div className="flex items-center gap-1.5">
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                                    <Users className="h-3 w-3 text-amber-500" />
                                    {logGroup.items.length} Kachha Maal Logs
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleRowExpand(logGroup.id);
                                    }}
                                    className="p-1 rounded-md hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 transition-colors"
                                    title={
                                      isExpanded
                                        ? "Hide breakdown"
                                        : "View breakdown"
                                    }
                                  >
                                    <ChevronDown
                                      className={`h-3.5 w-3.5 transition-transform duration-200 ${
                                        isExpanded ? "rotate-180" : ""
                                      }`}
                                    />
                                  </button>
                                </div>
                              ) : (
                                <span>{kachhaMaalNames || "—"}</span>
                              )
                            ) : isMulti ? (
                              <div className="flex items-center gap-1.5">
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                                  <Users className="h-3 w-3 text-amber-500" />
                                  {uniqueAalyawalas.length} Aalyawalas
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleRowExpand(logGroup.id);
                                  }}
                                  className="p-1 rounded-md hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 transition-colors"
                                  title={
                                    isExpanded
                                      ? "Hide breakdown"
                                      : "View breakdown"
                                  }
                                >
                                  <ChevronDown
                                    className={`h-3.5 w-3.5 transition-transform duration-200 ${
                                      isExpanded ? "rotate-180" : ""
                                    }`}
                                  />
                                </button>
                              </div>
                            ) : (
                              <span>{aalyawalaNames || "—"}</span>
                            )}
                          </td>
                          <td className="py-3 px-3.5 font-sans text-foreground text-[11px] font-medium whitespace-nowrap">
                            {worker.category === "BHATKAR" ? (
                              uniqueAalyawalas.length > 1 ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                                  <Users className="h-3 w-3 text-amber-500" />
                                  {uniqueAalyawalas.length} Aalyawalas
                                </span>
                              ) : (
                                <span>{aalyawalaNames || "—"}</span>
                              )
                            ) : (
                              <span>{logGroup.bhatkar_name || "—"}</span>
                            )}
                          </td>
                          <td className="py-3 px-3.5 text-center whitespace-nowrap">
                            {isSettled ? (
                              <div
                                className="inline-flex items-center justify-center h-7 w-7 text-emerald-600 dark:text-emerald-400"
                                title="Settled entry / भरणा झालेली नोंद (Cannot delete)"
                              >
                                <Lock className="h-3.5 w-3.5" />
                              </div>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={isDeletingThis}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteLog(logToDeleteId);
                                }}
                                className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
                                title="Delete daily work log entry / काम नोंद हटवा"
                              >
                                {isDeletingThis ? (
                                  <Clock className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3.5 w-3.5" />
                                )}
                              </Button>
                            )}
                          </td>
                        </tr>

                        {/* Inline Expandable Breakdown Sub-row with Table Format */}
                        {isMulti && isExpanded && (
                          <tr className="bg-amber-500/5 dark:bg-amber-950/20 border-b border-amber-500/20 animate-in fade-in-50 duration-200">
                            <td colSpan={10} className="p-3 sm:p-4">
                              <div className="bg-card dark:bg-slate-900/90 border border-amber-500/30 rounded-lg p-3 sm:p-4 space-y-3 shadow-md">
                                <div className="overflow-x-auto rounded-md border border-border/80 bg-background/50">
                                  <table className="w-full min-w-145 text-xs text-left border-collapse font-mono">
                                    <thead className="bg-muted/70 text-muted-foreground border-b border-border text-[10px] uppercase font-sans tracking-wider font-semibold whitespace-nowrap">
                                      <tr>
                                        <th className="py-2 px-3">#</th>
                                        {worker.category === "BHATKAR" ? (
                                          <>
                                            <th className="py-2 px-3">
                                              Kachha Maal Majur
                                            </th>
                                            <th className="py-2 px-3">
                                              Aalyawala Name
                                            </th>
                                          </>
                                        ) : (
                                          <th className="py-2 px-3">
                                            {isNoDailyWorkRole
                                              ? "Kachha Maal Majur"
                                              : "Aalyawala Name"}
                                          </th>
                                        )}
                                        <th className="py-2 px-3 text-right">
                                          Input Qty / Mode
                                        </th>
                                        <th className="py-2 px-3 text-right">
                                          Physical Bricks
                                        </th>
                                        <th className="py-2 px-3 text-right">
                                          Billable Bricks
                                        </th>
                                        <th className="py-2 px-3 text-right">
                                          Rate
                                        </th>
                                        <th className="py-2 px-3 text-right">
                                          Earned Amount
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50 text-[11px]">
                                      {logGroup.items.map(
                                        (item: any, idx: number) => (
                                          <tr
                                            key={item.id || idx}
                                            className="hover:bg-muted/40 transition-colors"
                                          >
                                            <td className="py-2 px-3 font-sans text-muted-foreground text-[10px] whitespace-nowrap">
                                              {idx + 1}
                                            </td>
                                            {worker.category === "BHATKAR" ? (
                                              <>
                                                <td className="py-2 px-3 font-sans font-bold text-foreground whitespace-nowrap">
                                                  {item.kachha_maal_name ||
                                                    `Kachha Maal #${idx + 1}`}
                                                </td>
                                                <td className="py-2 px-3 font-sans font-semibold text-amber-600 dark:text-amber-400 whitespace-nowrap">
                                                  {item.aalyawala_name ||
                                                    `Aalyawala #${idx + 1}`}
                                                </td>
                                              </>
                                            ) : (
                                              <td className="py-2 px-3 font-sans font-bold text-foreground whitespace-nowrap">
                                                {isNoDailyWorkRole
                                                  ? item.kachha_maal_name ||
                                                    `Kachha Maal #${idx + 1}`
                                                  : item.aalyawala_name ||
                                                    `Aalyawala #${idx + 1}`}
                                              </td>
                                            )}
                                            <td className="py-2 px-3 text-right text-muted-foreground whitespace-nowrap">
                                              {item.input_quantity?.toLocaleString()}{" "}
                                              {item.entry_mode === "PINJRI_COUNT"
                                                ? "Pinjri"
                                                : item.entry_mode === "SHIFT_COUNT"
                                                  ? "Shift"
                                                  : "pcs"}
                                            </td>
                                            <td className="py-2 px-3 text-right text-muted-foreground whitespace-nowrap">
                                              {item.physical_quantity?.toLocaleString()}{" "}
                                              pcs
                                            </td>
                                            <td className="py-2 px-3 text-right font-semibold text-foreground whitespace-nowrap">
                                              {item.billable_quantity?.toLocaleString()}{" "}
                                              pcs
                                            </td>
                                            <td className="py-2 px-3 text-right text-muted-foreground whitespace-nowrap">
                                              ₹
                                              {Number(
                                                item.rate || logGroup.rate || 0,
                                              ).toFixed(2)}
                                            </td>
                                            <td className="py-2 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                                              ₹
                                              {Number(
                                                item.earned_amount || 0,
                                              ).toFixed(2)}
                                            </td>
                                          </tr>
                                        ),
                                      )}
                                    </tbody>
                                    <tfoot className="bg-muted/40 font-bold border-t border-border text-foreground text-[11px] whitespace-nowrap">
                                      <tr>
                                        <td
                                          colSpan={worker.category === "BHATKAR" ? 3 : 2}
                                          className="py-2 px-3 font-sans text-[10px] uppercase tracking-wider text-muted-foreground"
                                        >
                                          Combined Total
                                        </td>
                                        <td className="py-2 px-3 text-right font-mono text-muted-foreground">
                                          {logGroup.items.length} Entries
                                        </td>
                                        <td className="py-2 px-3 text-right font-mono text-muted-foreground">
                                          {logGroup.physical_quantity?.toLocaleString()}{" "}
                                          pcs
                                        </td>
                                        <td className="py-2 px-3 text-right font-mono font-extrabold text-foreground">
                                          {logGroup.billable_quantity?.toLocaleString()}{" "}
                                          pcs
                                        </td>
                                        <td className="py-2 px-3 text-right text-muted-foreground">
                                          —
                                        </td>
                                        <td className="py-2 px-3 text-right font-mono text-emerald-600 dark:text-emerald-400 font-extrabold">
                                          ₹
                                          {Number(
                                            logGroup.earned_amount || 0,
                                          ).toFixed(2)}
                                        </td>
                                      </tr>
                                    </tfoot>
                                  </table>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}

                  {/* Weekly Summary Divider Row */}
                  <tr className="bg-amber-500/10 dark:bg-amber-950/40 border-t-2 border-b border-amber-500/30 font-sans">
                    <td colSpan={10} className="py-2.5 px-3.5">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40">
                            <Calendar className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                            {formatWeekLabel(week.weekStartSaturday, week.weekEndFriday)}
                          </span>
                          <span className="text-[11px] text-muted-foreground font-medium">
                            ({week.logs.length} {week.logs.length === 1 ? "day" : "days"} logged)
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs font-mono">
                          <div className="text-muted-foreground text-[11px]">
                            Billable Total: <span className="font-bold text-foreground">{week.totalBillableQty.toLocaleString()}</span> pcs
                          </div>
                          <div className="flex items-center gap-1.5 bg-emerald-500/15 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-md font-bold text-xs">
                            <span>Weekly Earned:</span>
                            <span className="text-sm font-extrabold">₹{week.totalEarnedAmount.toFixed(2)}</span>
                          </div>

                          {/* Payment / Checkout Status */}
                          {week.isPaid ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-extrabold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 shadow-xs font-sans">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                              Payment Done / जमा झाले
                            </span>
                          ) : (
                            canWrite && (
                              <Button
                                size="sm"
                                className="h-7 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1 shadow-xs font-sans"
                                onClick={() => setSelectedWeekForCheckout(week)}
                              >
                                <Coins className="h-3 w-3" /> Checkout / Mark Paid
                              </Button>
                            )
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                </Fragment>
              ))}
            </tbody>
            <tfoot className="bg-muted/80 font-bold border-t-2 border-border text-foreground text-xs font-mono">
              <tr>
                <td colSpan={3} className="py-3 px-3.5 font-sans uppercase text-[10px] tracking-wider text-muted-foreground">
                  Overall Grand Total / एकूण कमाई
                </td>
                <td className="py-3 px-3.5 text-right text-muted-foreground">
                  {grandTotalPhysical.toLocaleString()}
                </td>
                <td className="py-3 px-3.5 text-right font-extrabold text-foreground">
                  {grandTotalBillable.toLocaleString()}
                </td>
                <td className="py-3 px-3.5 text-right text-muted-foreground">
                  —
                </td>
                <td className="py-3 px-3.5 text-right font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                  ₹{grandTotalEarned.toFixed(2)}
                </td>
                <td colSpan={3} className="py-3 px-3.5 text-muted-foreground font-sans text-[11px]">
                  {weeklyBuckets.length} {weeklyBuckets.length === 1 ? "Week" : "Weeks"} Total
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground italic py-2">
          No daily work logs recorded yet for this worker.
        </p>
      )}

      {/* Weekly Settlement Checkout Modal */}
      {selectedWeekForCheckout && (
        <WeeklyCheckoutDialog
          open={!!selectedWeekForCheckout}
          onClose={() => setSelectedWeekForCheckout(null)}
          worker={worker}
          week={selectedWeekForCheckout}
          onConfirmCheckout={async (input) => {
            await createSettlement.mutateAsync(input);
          }}
        />
      )}
    </div>
  );
}
