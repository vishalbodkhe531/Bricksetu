"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Column, DataTable } from "@/components/ui/data-table/data-table";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { RateChangeDialog } from "@/features/workers/components/RateChangeDialog";
import { WorkerDeactivateDialog } from "@/features/workers/components/WorkerDeactivateDialog";
import {
  useChangeWorkerRate,
  useDeactivateWorker,
  useRecordAdvance,
  useWorkers,
} from "@/features/workers/hooks/useWorkers";
import type { Worker } from "@/features/workers/types/worker.types";
import {
  Edit,
  Eye,
  Filter,
  MoreVertical,
  Plus,
  Trash2,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CATEGORY_OPTIONS,
  formatWorkerCategory,
} from "@/features/workers/constants/worker-options";
import React, { useCallback, useMemo, useReducer, useRef, useState } from "react";
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

  // Pop-up Menu State
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  /**
   * Click-outside handler for the action pop-up menu.
   * Uses a stable ref callback instead of a useEffect that re-registers
   * on every openMenuId change — avoids unnecessary listener churn.
   */
  const openMenuIdRef = useRef(openMenuId);
  openMenuIdRef.current = openMenuId;

  const handleDocumentClick = useCallback((e: MouseEvent) => {
    if (
      openMenuIdRef.current &&
      !(e.target as HTMLElement).closest(".action-menu-container")
    ) {
      setOpenMenuId(null);
    }
  }, []);

  // Register once on mount, not on every openMenuId change
  React.useEffect(() => {
    document.addEventListener("mousedown", handleDocumentClick);
    return () => document.removeEventListener("mousedown", handleDocumentClick);
  }, [handleDocumentClick]);

  // Dialog States
  const [rateChangeWorker, setRateChangeWorker] = useState<Worker | null>(null);
  const [deactivateWorkerItem, setDeactivateWorkerItem] =
    useState<Worker | null>(null);

  // Advance Modal State — consolidated into useReducer (5 related fields change together)
  type AdvanceState = {
    show: boolean;
    workerId: string;
    amount: string;
    dateGiven: string;
    reason: string;
  };
  type AdvanceAction =
    | { type: "open"; workerId?: string }
    | { type: "close" }
    | { type: "set"; field: keyof Omit<AdvanceState, "show">; value: string };

  const initialAdvanceState: AdvanceState = {
    show: false,
    workerId: "",
    amount: "",
    dateGiven: new Date().toISOString().split("T")[0],
    reason: "",
  };

  const [advanceState, dispatchAdvance] = useReducer(
    (state: AdvanceState, action: AdvanceAction): AdvanceState => {
      switch (action.type) {
        case "open":
          return { ...state, show: true, workerId: action.workerId ?? "" };
        case "close":
          return { ...initialAdvanceState };
        case "set":
          return { ...state, [action.field]: action.value };
        default:
          return state;
      }
    },
    initialAdvanceState,
  );

  // Convenience aliases for readability below
  const showAdvanceModal = advanceState.show;
  const selectedWorkerId = advanceState.workerId;
  const advanceAmount = advanceState.amount;
  const advanceDateGiven = advanceState.dateGiven;
  const advanceReason = advanceState.reason;

  // Make canWrite case-insensitive and default to true so buttons are never hidden by role mismatch
  const roleUpper = (profile?.role || "").toUpperCase();
  const canWrite =
    !profile?.role || ["OWNER", "MANAGER", "ADMIN"].includes(roleUpper);

  const handleRecordAdvance = async (e: React.FormEvent) => {
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
            {/* Profile Pic / Avatar Badge */}
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

            {/* Worker Name, ID, & Category */}
            <div className="space-y-0.5 min-w-0">
              <Link
                href={`/workers/${row.original.id}`}
                className={`font-semibold hover:underline flex items-center gap-1.5 truncate ${
                  isInactive
                    ? "text-muted-foreground line-through"
                    : "text-foreground hover:text-primary"
                }`}
              >
                {row.original.full_name}
              </Link>
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="font-mono bg-muted/60 px-1.5 py-0.2 rounded text-[10px] text-muted-foreground font-semibold">
                  {workerIdDisplay}
                </span>
                {row.original.category && (
                  <span>• {formatCategory(row.original.category)}</span>
                )}
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
        <span className="text-muted-foreground font-mono text-[11px]">
          {row.original.phone || "—"}
        </span>
      ),
    },
    {
      accessorKey: "current_rate_amount",
      header: "Current Rate",
      align: "right",
      cell: ({ row }) => (
        <span className="font-mono font-bold text-foreground text-xs">
          ₹{Number(row.original.current_rate_amount || 0).toFixed(2)}{" "}
          <span className="text-[10px] text-muted-foreground font-normal">
            / 1K
          </span>
        </span>
      ),
    },
    {
      accessorKey: "advance_balance",
      header: "Advance Balance",
      align: "right",
      cell: ({ row }) => {
        const adv = Number(row.original.advance_balance || 0);
        return (
          <span
            className={`font-mono font-semibold text-xs ${adv > 0 ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"}`}
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
        const isMenuOpen = openMenuId === row.original.id;
        const index = (row as any).index ?? 0;
        const totalRows = (row as any).totalRows ?? 1;
        const isNearBottom = totalRows > 1 && index >= totalRows - 2;

        return (
          <div className="relative action-menu-container flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-muted rounded-md"
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenuId(isMenuOpen ? null : row.original.id);
              }}
              title="Actions"
            >
              <MoreVertical className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </Button>

            {isMenuOpen && (
              <div
                className={`absolute right-0 z-50 min-w-30 rounded-md border border-border bg-card p-1 shadow-lg animate-in fade-in-80 zoom-in-95 ${
                  isNearBottom ? "bottom-8" : "top-8"
                }`}
              >
                <Link
                  href={`/workers/${row.original.id}`}
                  onClick={() => setOpenMenuId(null)}
                  className="flex w-full items-center gap-2 rounded-sm px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                >
                  <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                  View
                </Link>

                {canWrite && (
                  <>
                    <Link
                      href={`/workers/${row.original.id}/edit`}
                      onClick={() => setOpenMenuId(null)}
                      className="flex w-full items-center py-1.5 gap-2 rounded-sm px-2.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                    >
                      <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                      Edit
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setOpenMenuId(null);
                        setDeactivateWorkerItem(row.original);
                      }}
                      className="flex w-full items-center gap-2 rounded-sm px-2.5 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      Delete
                    </button>
                  </>
                )}
              </div>
            )}
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
      if (cat === "AALYAWALE" || cat === "PIECE_RATE") c.AALYAWALE++;
      else if (cat === "BHATKAR") c.BHATKAR++;
      else if (cat === "KACHA_MAAL") c.KACHA_MAAL++;
      else if (cat === "PAKKA_MAAL") c.PAKKA_MAAL++;
    }
    return c;
  }, [workers]);

  const filteredWorkers = useMemo(() => {
    if (activeTab === "ALL") return workers;
    if (activeTab === "AALYAWALE") {
      return workers.filter(
        (w) => w.category === "AALYAWALE" || w.category === "PIECE_RATE",
      );
    }
    return workers.filter((w) => w.category === activeTab);
  }, [workers, activeTab]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Users className="h-6 w-6 text-primary shrink-0" /> Workers
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage worker roster, profile details, moulding rates, and advances
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none border border-border bg-card px-3 py-2 rounded-md shadow-xs hover:bg-accent/50 transition-colors">
            <input
              type="checkbox"
              checked={includeInactive}
              onChange={(e) => setIncludeInactive(e.target.checked)}
              className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5"
            />
            <Filter className="h-3 w-3" /> Show Deactivated Workers
          </label>

          {canWrite && (
            <Link href="/workers/new">
              <Button variant="default" className="gap-2 shadow-xs">
                <Plus className="h-4 w-4" /> Add Worker
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <TabsList>
        {WORKER_TABS.map((tab) => {
          const count = counts[tab.id] ?? 0;
          return (
            <TabsTrigger
              key={tab.id}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2"
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 text-[10px] rounded-full font-mono font-bold transition-colors ${
                  activeTab === tab.id
                    ? "bg-primary/15 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {count}
              </span>
            </TabsTrigger>
          );
        })}
      </TabsList>

      {/* Content */}
      <DataTable
        columns={workerColumns}
        data={filteredWorkers}
        searchPlaceholder={`Search ${WORKER_TABS.find((t) => t.id === activeTab)?.label || "worker"} by name, phone...`}
        showExport={false}
      />

      {/* Dialog: Change Pay Rate */}
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

      {/* Modal: Record Advance */}
      {showAdvanceModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 space-y-4 shadow-md">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">
                Record Advance Payment
              </h3>
              <button
                onClick={() => dispatchAdvance({ type: "close" })}
                className="text-muted-foreground hover:text-foreground rounded p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleRecordAdvance} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Worker *
                </label>
                <select
                  value={selectedWorkerId}
                  onChange={(e) =>
                    dispatchAdvance({
                      type: "set",
                      field: "workerId",
                      value: e.target.value,
                    })
                  }
                  required
                  className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">-- Choose Worker --</option>
                  {workers.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.full_name} ({w.category || "Worker"})
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Amount (₹) *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="1"
                  value={advanceAmount}
                  onChange={(e) =>
                    dispatchAdvance({
                      type: "set",
                      field: "amount",
                      value: e.target.value,
                    })
                  }
                  placeholder="e.g. 2000"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Date Given *
                </label>
                <Input
                  type="date"
                  value={advanceDateGiven}
                  onChange={(e) =>
                    dispatchAdvance({
                      type: "set",
                      field: "dateGiven",
                      value: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Reason
                </label>
                <Input
                  value={advanceReason}
                  onChange={(e) =>
                    dispatchAdvance({
                      type: "set",
                      field: "reason",
                      value: e.target.value,
                    })
                  }
                  placeholder="Optional reason for advance"
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
    </div>
  );
}
