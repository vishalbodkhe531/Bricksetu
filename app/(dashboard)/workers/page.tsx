"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Column, DataTable } from "@/components/ui/data-table/data-table";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { RateChangeDialog } from "@/features/workers/components/RateChangeDialog";
import { WorkerDeactivateDialog } from "@/features/workers/components/WorkerDeactivateDialog";
import { BulkRecordWorkSheet } from "@/features/workers/components/BulkRecordWorkSheet";
import {
  useChangeWorkerRate,
  useDeactivateWorker,
  useRecordAdvance,
  useWorkers,
  useDailyWorkSummary,
} from "@/features/workers/hooks/useWorkers";
import type { Worker } from "@/features/workers/types/worker.types";
import {
  Edit,
  Eye,
  Filter,
  Plus,
  Trash2,
  Users,
  X,
  Coins,
  Layers,
  CalendarCheck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ActionMenu, type ActionMenuItem } from "@/components/ui/action-menu";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CATEGORY_OPTIONS,
  formatWorkerCategory,
} from "@/features/workers/constants/worker-options";
import React, { useMemo, useReducer, useState } from "react";
import { toast } from "sonner";

export default function WorkersPage() {
  const { profile } = useAuth();
  const orgId = profile?.organization_id ?? "";

  const [includeInactive, setIncludeInactive] = useState(false);
  const { data: workers = [], isLoading: loadingWorkers } = useWorkers(
    orgId,
    includeInactive,
  );

  const deactivateWorker = useDeactivateWorker(orgId);
  const changeWorkerRate = useChangeWorkerRate(orgId, "");
  const recordAdvance = useRecordAdvance(orgId, "");

  // Dialog States
  const [rateChangeWorker, setRateChangeWorker] = useState<Worker | null>(null);
  const [deactivateWorkerItem, setDeactivateWorkerItem] =
    useState<Worker | null>(null);
  const [showBulkRecordSheet, setShowBulkRecordSheet] = useState(false);

  // Advance Dialog Reducer
  type AdvanceState = {
    isOpen: boolean;
    workerId: string;
    workerName: string;
    amount: string;
    dateGiven: string;
    reason: string;
  };

  type AdvanceAction =
    | { type: "open"; workerId: string; workerName: string }
    | { type: "close" }
    | { type: "setField"; field: keyof AdvanceState; value: string };

  const initialAdvanceState: AdvanceState = {
    isOpen: false,
    workerId: "",
    workerName: "",
    amount: "",
    dateGiven: new Date().toISOString().split("T")[0],
    reason: "",
  };

  function advanceReducer(
    state: AdvanceState,
    action: AdvanceAction,
  ): AdvanceState {
    switch (action.type) {
      case "open":
        return {
          ...initialAdvanceState,
          isOpen: true,
          workerId: action.workerId,
          workerName: action.workerName,
        };
      case "close":
        return initialAdvanceState;
      case "setField":
        return { ...state, [action.field]: action.value };
      default:
        return state;
    }
  }

  const [
    {
      isOpen: showAdvanceModal,
      workerId: selectedWorkerId,
      workerName: selectedWorkerName,
      amount: advanceAmount,
      dateGiven: advanceDateGiven,
      reason: advanceReason,
    },
    dispatchAdvance,
  ] = useReducer(advanceReducer, initialAdvanceState);

  const { data: todaySummary } = useDailyWorkSummary(
    new Date().toISOString().split("T")[0],
  );

  const roleUpper = (profile?.role || "").toUpperCase();
  const canWrite =
    !profile?.role || ["OWNER", "MANAGER", "ADMIN"].includes(roleUpper);

  const handleAdvanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkerId) return;
    recordAdvance.mutate(
      {
        worker_id: selectedWorkerId,
        amount: parseFloat(advanceAmount),
        date_given: advanceDateGiven,
        reason: advanceReason || null,
      },
      {
        onSuccess: () => {
          toast.success("Advance recorded successfully");
          dispatchAdvance({ type: "close" });
        },
        onError: (err: Error) => {
          toast.error(err.message || "Failed to record advance");
        },
      },
    );
  };

  const formatCategory = (cat: string | null) => {
    return formatWorkerCategory(cat);
  };

  const getInitials = (name: string) => {
    if (!name) return "W";
    return name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const workerColumns: Column<Worker>[] = [
    {
      accessorKey: "full_name",
      header: "Worker",
      cell: ({ row }) => {
        const isInactive = row.original.status === "inactive";
        const initials = getInitials(row.original.full_name || "Worker");
        const workerIdDisplay =
          row.original.code ||
          `WID-${row.original.id.slice(0, 6).toUpperCase()}`;

        return (
          <div className="flex items-center gap-3">
            {row.original.photo_url ? (
              <Image
                src={row.original.photo_url}
                alt={row.original.full_name || "Worker"}
                width={36}
                height={36}
                className="h-9 w-9 rounded-full object-cover border border-border shrink-0"
              />
            ) : (
              <div className="h-9 w-9 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-xs shrink-0 select-none">
                {initials}
              </div>
            )}

            <div className="space-y-0.5 min-w-0">
              <Link
                href={`/workers/${row.original.id}`}
                className={`font-semibold hover:underline flex items-center gap-1.5 truncate ${
                  isInactive
                    ? "text-muted-foreground line-through"
                    : "text-foreground hover:text-primary"
                }`}
              >
                <span className="truncate">{row.original.full_name}</span>
              </Link>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <span className="font-mono text-[10px] bg-muted/60 px-1.5 py-0.2 rounded border border-border">
                  {workerIdDisplay}
                </span>
                <span>•</span>
                <span>{formatCategory(row.original.category)}</span>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => (
        <span className="font-mono text-xs">
          {row.original.phone || "—"}
        </span>
      ),
    },
    {
      accessorKey: "current_rate_amount",
      header: "Current Rate",
      cell: ({ row }) => {
        const rate = row.original.current_rate_amount;
        const cat = row.original.category;
        const unit =
          cat === "DAILY_WAGE"
            ? "/ day"
            : cat === "MONTHLY_SALARY"
              ? "/ mo"
              : "/ 1K";

        return (
          <span className="font-mono font-semibold text-foreground text-xs">
            {rate !== undefined && rate !== null ? `₹${rate.toFixed(2)} ${unit}` : "—"}
          </span>
        );
      },
    },
    {
      accessorKey: "advance_balance",
      header: "Advance Balance",
      align: "right",
      cell: ({ row }) => {
        const adv = row.original.advance_balance || 0;
        return (
          <span
            className={`font-mono text-xs ${
              adv > 0
                ? "font-bold text-amber-600 dark:text-amber-400"
                : "text-muted-foreground"
            }`}
          >
            ₹{adv.toFixed(2)}
          </span>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      align: "center",
      cell: ({ row }) => (
        <Badge
          variant={row.original.status === "active" ? "success" : "secondary"}
        >
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      align: "center",
      cell: ({ row }) => {
        const items: ActionMenuItem[] = [
          {
            label: "View Profile",
            icon: <Eye className="h-3.5 w-3.5 text-muted-foreground" />,
            href: `/workers/${row.original.id}`,
          },
        ];

        if (canWrite) {
          items.push({
            label: "Record Daily Work",
            icon: <Coins className="h-3.5 w-3.5 text-amber-500" />,
            href: `/workers/${row.original.id}?tab=record_work`,
          });
          items.push({
            label: "Edit Profile",
            icon: <Edit className="h-3.5 w-3.5 text-muted-foreground" />,
            href: `/workers/${row.original.id}/edit`,
          });
          items.push({
            label: "Delete",
            icon: <Trash2 className="h-3.5 w-3.5 text-destructive" />,
            onClick: () => setDeactivateWorkerItem(row.original),
            variant: "destructive",
          });
        }

        return (
          <div className="flex justify-center">
            <ActionMenu items={items} />
          </div>
        );
      },
    },
  ];

  const WORKER_TABS = [
    { id: "ALL", label: "सर्व मजूर" },
    { id: "AALYAWALE", label: "आल्यावाले" },
    { id: "BHATKAR", label: "भटकर" },
    { id: "KACHA_MAAL", label: "कच्चा माल मजूर" },
    { id: "PAKKA_MAAL", label: "पक्का माल मजूर" },
  ];

  const [activeTab, setActiveTab] = useState<string>("ALL");

  const counts = useMemo(() => {
    const c: Record<string, number> = {
      ALL: workers.length,
      AALYAWALE: 0,
      BHATKAR: 0,
      KACHA_MAAL: 0,
      PAKKA_MAAL: 0,
    };
    for (const w of workers) {
      const cat = w.category;
      if (cat && cat in c) {
        c[cat] += 1;
      }
    }
    return c;
  }, [workers]);

  const filteredWorkers = useMemo(() => {
    if (activeTab === "ALL") return workers;
    return workers.filter((w) => w.category === activeTab);
  }, [workers, activeTab]);

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-4 rounded-xl border border-border shadow-xs">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" /> Workers Roster / कामगार सूची
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage worker profiles, daily work logging, piece rates, and advance balances.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer select-none mr-1">
            <input
              type="checkbox"
              checked={includeInactive}
              onChange={(e) => setIncludeInactive(e.target.checked)}
              className="rounded border-border text-primary focus:ring-primary/50"
            />
            <Filter className="h-3 w-3" /> Show Deactivated
          </label>

          {canWrite && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBulkRecordSheet(true)}
              >
                <Layers className="h-3.5 w-3.5 text-primary" /> Bulk Entry / काम नोंदवा
              </Button>

              <Link href="/workers/new">
                <Button variant="default" size="sm">
                  <Plus className="h-3.5 w-3.5" /> Add Worker
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Today's Daily Work Summary Card */}
      {todaySummary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl text-slate-100 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/15 border border-amber-500/30 rounded-xl text-amber-400 shrink-0">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Today's Entries</div>
              <div className="text-lg font-bold font-mono text-slate-100">{todaySummary.totalEntries} logged</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/15 border border-blue-500/30 rounded-xl text-blue-400 shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Physical Production</div>
              <div className="text-lg font-bold font-mono text-slate-100">
                {todaySummary.totalPhysicalBricks?.toLocaleString() || 0} bricks
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-400 shrink-0">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Total Earned Today</div>
              <div className="text-lg font-bold font-mono text-emerald-400">
                ₹{todaySummary.totalEarnings?.toFixed(2) || "0.00"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabbed Filter Bar */}
      <div className="border-b border-border bg-card rounded-t-xl px-2 pt-2 flex gap-1 overflow-x-auto">
        <TabsList className="bg-transparent p-0 gap-1 h-auto flex flex-nowrap">
          {WORKER_TABS.map((t) => {
            const count = counts[t.id] ?? 0;
            const isActive = activeTab === t.id;
            return (
              <TabsTrigger
                key={t.id}
                value={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-3.5 py-2 text-xs font-bold transition-all border-b-2 rounded-t-lg rounded-b-none shrink-0 ${
                  isActive
                    ? "border-primary text-primary bg-primary/10"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {t.label}
                <span
                  className={`ml-1.5 px-1.5 py-0.2 text-[10px] font-mono rounded-full ${
                    isActive
                      ? "bg-primary text-primary-foreground font-bold"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {count}
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </div>

      {/* Data Table */}
      <div className="bg-card border border-border border-t-0 rounded-b-xl shadow-xs overflow-hidden">
        <DataTable
          columns={workerColumns}
          data={filteredWorkers}
          loading={loadingWorkers}
          searchKey="full_name"
          searchPlaceholder="Search सर्व मजूर by name, phone..."
        />
      </div>

      {/* Dialog: Change Rate */}
      {rateChangeWorker && (
        <RateChangeDialog
          open={!!rateChangeWorker}
          onClose={() => setRateChangeWorker(null)}
          workerId={rateChangeWorker.id}
          workerName={rateChangeWorker.full_name}
          currentRate={rateChangeWorker.current_rate_amount || 0}
          onSubmitRateChange={async (data) => {
            await changeWorkerRate.mutateAsync(data);
          }}
        />
      )}

      {/* Dialog: Deactivate Worker */}
      {deactivateWorkerItem && (
        <WorkerDeactivateDialog
          open={!!deactivateWorkerItem}
          onClose={() => setDeactivateWorkerItem(null)}
          workerId={deactivateWorkerItem.id}
          workerName={deactivateWorkerItem.full_name}
          advanceBalance={deactivateWorkerItem.advance_balance}
          onConfirmDeactivate={async (id) => {
            await deactivateWorker.mutateAsync(id);
          }}
        />
      )}

      {/* Modal: Give Advance */}
      {showAdvanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="text-sm font-bold text-foreground">
                Give Advance to {selectedWorkerName}
              </h3>
              <button
                type="button"
                onClick={() => dispatchAdvance({ type: "close" })}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAdvanceSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                  Amount (₹) *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  value={advanceAmount}
                  onChange={(e) =>
                    dispatchAdvance({
                      type: "setField",
                      field: "amount",
                      value: e.target.value,
                    })
                  }
                  placeholder="e.g. 1000"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                  Date Given *
                </label>
                <Input
                  type="date"
                  required
                  value={advanceDateGiven}
                  onChange={(e) =>
                    dispatchAdvance({
                      type: "setField",
                      field: "dateGiven",
                      value: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                  Reason / Notes
                </label>
                <Input
                  type="text"
                  value={advanceReason}
                  onChange={(e) =>
                    dispatchAdvance({
                      type: "setField",
                      field: "reason",
                      value: e.target.value,
                    })
                  }
                  placeholder="e.g. Festival advance"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => dispatchAdvance({ type: "close" })}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={recordAdvance.isPending}>
                  {recordAdvance.isPending ? "Saving..." : "Record Advance"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sheet: Bulk Record Work */}
      <BulkRecordWorkSheet
        open={showBulkRecordSheet}
        onOpenChange={setShowBulkRecordSheet}
        orgId={orgId}
        workers={workers}
      />
    </div>
  );
}
