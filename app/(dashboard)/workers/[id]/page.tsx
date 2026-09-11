"use client";

import { use, useState, useEffect, useMemo, useRef, Fragment } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  Banknote,
  Briefcase,
  Calendar,
  ChevronDown,
  Clock,
  Coins,
  Edit,
  FileText,
  HeartHandshake,
  History,
  IndianRupee,
  MapPin,
  Phone,
  Receipt,
  ShieldCheck,
  User,
  UserX,
  Users,
  Trash2,
  PlusCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { RateChangeDialog } from "@/features/workers/components/RateChangeDialog";
import { WorkerDeactivateDialog } from "@/features/workers/components/WorkerDeactivateDialog";
import { EmbeddedRecordWorkForm } from "@/features/workers/components/EmbeddedRecordWorkForm";
import {
  useChangeWorkerRate,
  useDeactivateWorker,
  useWorkerDetail,
  useDailyWorkLogs,
  useDeleteDailyWorkLog,
} from "@/features/workers/hooks/useWorkers";
import { formatWorkerCategory } from "@/features/workers/constants/worker-options";

const MARATHI_DAYS = [
  "रविवार",
  "सोमवार",
  "मंगळवार",
  "बुधवार",
  "गुरुवार",
  "शुक्रवार",
  "शनिवार",
];

function getMarathiDay(dateStr: string): string {
  if (!dateStr) return "—";
  const parts = dateStr.split("T")[0].split("-");
  if (parts.length === 3) {
    const [yyyy, mm, dd] = parts.map(Number);
    const date = new Date(yyyy, mm - 1, dd);
    return MARATHI_DAYS[date.getDay()] || "—";
  }
  const date = new Date(dateStr);
  return MARATHI_DAYS[date.getDay()] || "—";
}

function formatDateDdMmYyyy(dateStr: string): string {
  if (!dateStr) return "—";
  const parts = dateStr.split("T")[0].split("-");
  if (parts.length === 3) {
    const [yyyy, mm, dd] = parts;
    return `${dd}-${mm}-${yyyy}`;
  }
  const date = new Date(dateStr);
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

interface WorkerDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function WorkerDetailPage({ params }: WorkerDetailPageProps) {
  const resolvedParams = use(params);
  const workerId = resolvedParams.id;
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab");
  const { profile } = useAuth();
  const orgId = profile?.organization_id ?? "";

  const { data: worker, isLoading: loading } = useWorkerDetail(workerId);
  const { data: dailyWorkData } = useDailyWorkLogs({ workerId });
  const deleteDailyWorkLog = useDeleteDailyWorkLog(orgId);

  // Group logs by batch_id or log id to display multi-Aalyawala / multi-role entries cleanly
  const groupedDailyLogs = useMemo(() => {
    if (!dailyWorkData?.logs || dailyWorkData.logs.length === 0) return [];

    const groupMap = new Map<string, any>();

    for (const log of dailyWorkData.logs) {
      const datePart = log.work_date ? log.work_date.split("T")[0] : "";
      const key = log.log_group_id
        ? `group_${log.log_group_id}`
        : log.batch_id
          ? `batch_${log.batch_id}`
          : `${datePart}_${log.entry_mode}_${log.rate}_${log.id}`;
      const existing = groupMap.get(key);

      const item = {
        id: log.id,
        aalyawala_id: log.aalyawala_id,
        aalyawala_name:
          log.aalyawala_name || log.batch_number || log.reference_no || null,
        bhatkar_id: log.bhatkar_id,
        bhatkar_name: log.bhatkar_name || null,
        kachha_maal_id: log.kachha_maal_id || null,
        kachha_maal_name: log.kachha_maal_name || null,
        input_quantity: Number(log.input_quantity || 0),
        physical_quantity: Number(log.physical_quantity || 0),
        billable_quantity: Number(log.billable_quantity || 0),
        earned_amount: Number(log.earned_amount || 0),
        is_auto_generated: log.is_auto_generated ?? false,
        is_primary: log.is_primary ?? true,
      };

      if (existing) {
        existing.physical_quantity += Number(log.physical_quantity || 0);
        existing.billable_quantity += Number(log.billable_quantity || 0);
        existing.earned_amount += Number(log.earned_amount || 0);
        if (!existing.bhatkar_name && log.bhatkar_name) {
          existing.bhatkar_name = log.bhatkar_name;
        }
        if (!existing.kachha_maal_name && log.kachha_maal_name) {
          existing.kachha_maal_name = log.kachha_maal_name;
        }
        existing.items.push(item);
      } else {
        groupMap.set(key, {
          id: log.id,
          batch_id: log.batch_id,
          work_date: log.work_date,
          entry_mode: log.entry_mode,
          physical_quantity: Number(log.physical_quantity || 0),
          billable_quantity: Number(log.billable_quantity || 0),
          rate: Number(log.rate || 0),
          earned_amount: Number(log.earned_amount || 0),
          bhatkar_name: log.bhatkar_name || null,
          kachha_maal_name: log.kachha_maal_name || null,
          is_auto_generated: log.is_auto_generated ?? false,
          is_primary: log.is_primary ?? true,
          items: [item],
        });
      }
    }

    return Array.from(groupMap.values());
  }, [dailyWorkData?.logs]);

  const deactivateWorker = useDeactivateWorker(orgId);
  const changeWorkerRate = useChangeWorkerRate(orgId, workerId);

  // Tab State
  const [activeTab, setActiveTab] = useState<
    "profile" | "record_work" | "ledger"
  >(
    initialTab === "record_work"
      ? "record_work"
      : initialTab === "ledger"
        ? "ledger"
        : "profile",
  );

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "record_work" || tab === "ledger" || tab === "profile") {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Modal Dialog states
  const [showRateDialog, setShowRateDialog] = useState(false);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);

  // Accordion Expand State for Multi-Aalyawala Ledger Rows
  const [expandedRowKeys, setExpandedRowKeys] = useState<
    Record<string, boolean>
  >({});

  const toggleRowExpand = (key: string) => {
    setExpandedRowKeys((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const roleUpper = (profile?.role || "").toUpperCase();
  const canWrite =
    !profile?.role || ["OWNER", "MANAGER", "ADMIN"].includes(roleUpper);

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <Clock className="h-4 w-4 animate-spin text-primary" /> Loading worker
          record...
        </div>
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="space-y-3">
        <Link href="/workers">
          <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Roster
          </Button>
        </Link>
        <div className="p-6 text-center border border-border rounded-lg bg-card">
          <AlertCircle className="h-7 w-7 text-destructive mx-auto mb-2" />
          <h2 className="text-sm font-bold text-foreground">
            Worker Not Found
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            The requested worker record does not exist or was removed.
          </p>
        </div>
      </div>
    );
  }

  const userInitials = worker.full_name
    ? worker.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "WK";

  return (
    <div className="space-y-4">
      {/* Identity Header Card */}
      <div className="rounded-lg border border-border bg-card p-4 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/workers">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-xs">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold shadow-xs overflow-hidden border border-border">
              {worker.photo_url ? (
                <img
                  src={worker.photo_url}
                  alt={worker.full_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                userInitials
              )}
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base font-bold tracking-tight text-foreground">
                  {worker.full_name}
                </h1>
                <Badge
                  variant={worker.status === "active" ? "success" : "secondary"}
                  className="text-[10px] py-0 px-1.5"
                >
                  {worker.status}
                </Badge>
              </div>

              <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1 font-medium">
                  <Briefcase className="h-3 w-3 text-primary" />{" "}
                  {formatWorkerCategory(worker.category)}
                </span>
                {worker.phone && (
                  <a
                    href={`tel:${worker.phone}`}
                    className="flex items-center gap-1 font-mono hover:text-primary hover:underline transition-colors"
                  >
                    <Phone className="h-3 w-3" /> {worker.phone}
                  </a>
                )}
                <span className="flex items-center gap-1 font-mono">
                  <Calendar className="h-3 w-3" /> Joined: {worker.joining_date}
                </span>
              </div>
            </div>
          </div>

          {canWrite && (
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <Button
                variant={activeTab === "record_work" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab("record_work")}
              >
                <Coins className="h-3.5 w-3.5" /> Record Daily Work
              </Button>

              <Link href={`/workers/${worker.id}/edit`}>
                <Button variant="outline" size="sm">
                  <Edit className="h-3.5 w-3.5" /> Edit Profile
                </Button>
              </Link>

              <Button
                variant="default"
                size="sm"
                onClick={() => setShowRateDialog(true)}
              >
                <Banknote className="h-3.5 w-3.5" /> Change Rate
              </Button>

              {worker.status === "active" && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDeactivateDialog(true)}
                >
                  <UserX className="h-3.5 w-3.5" /> Deactivate
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* KPI Ledger Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 rounded-lg border border-border bg-card shadow-xs space-y-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <Banknote className="h-3 w-3 text-primary" /> Current Rate
          </span>
          <span className="text-lg font-bold font-mono text-foreground block tabular-nums">
            ₹{Number(worker.current_rate_amount || 0).toFixed(2)}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {worker.category === "DAILY_WAGE"
              ? "per day"
              : worker.category === "MONTHLY_SALARY"
                ? "per month"
                : "per 1,000 moulded bricks"}
          </span>
        </div>

        <div className="p-3 rounded-lg border border-border bg-card shadow-xs space-y-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <IndianRupee className="h-3 w-3 text-amber-500" /> Advance Balance
          </span>
          <span className="text-lg font-bold font-mono text-amber-600 dark:text-amber-400 block tabular-nums">
            ₹{Number(worker.advance_balance || 0).toFixed(2)}
          </span>
          <span className="text-[10px] text-muted-foreground">
            Unsettled advances given
          </span>
        </div>

        <div className="p-3 rounded-lg border border-border bg-card shadow-xs space-y-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <Coins className="h-3 w-3 text-emerald-500" /> Total Decided Amount
          </span>
          <span className="text-lg font-bold font-mono text-foreground block tabular-nums">
            ₹
            {Number(worker.total_decided_advance_amount || 0).toLocaleString(
              "en-IN",
            )}
          </span>
          <span className="text-[10px] text-muted-foreground">
            Agreed Peshgi at onboarding
          </span>
        </div>
      </div>

      {/* 3-Tab Header Navigation */}
      <div className="flex border-b border-border bg-card rounded-t-lg px-2 pt-2 gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab("profile")}
          className={`px-4 cursor-pointer py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 shrink-0 ${
            activeTab === "profile"
              ? "border-primary text-primary bg-primary/5 rounded-t-md"
              : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded-t-md"
          }`}
        >
          <User className="h-4 w-4" /> View Profile Details / प्रोफाइल माहिती
        </button>

        {canWrite && (
          <button
            onClick={() => setActiveTab("record_work")}
            className={`px-4 cursor-pointer py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 shrink-0 ${
              activeTab === "record_work"
                ? "border-amber-500 text-amber-500 bg-amber-500/5 rounded-t-md"
                : "border-transparent text-muted-foreground hover:text-amber-500 hover:bg-amber-500/5 rounded-t-md"
            }`}
          >
            <PlusCircle className="h-4 w-4 text-amber-500" /> Record Daily Work
            / काम नोंदवा
          </button>
        )}

        <button
          onClick={() => setActiveTab("ledger")}
          className={`px-4 py-2.5 cursor-pointer text-xs font-bold transition-all border-b-2 flex items-center gap-2 shrink-0 ${
            activeTab === "ledger"
              ? "border-emerald-500 text-emerald-500 bg-emerald-500/5 rounded-t-md"
              : "border-transparent text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/5 rounded-t-md"
          }`}
        >
          <Receipt className="h-4 w-4 text-emerald-500" /> Work Ledger Logs /
          कामाची नोंदवही
          {dailyWorkData?.logs && dailyWorkData.logs.length > 0 && (
            <span className="ml-1 px-1.5 py-0.2 text-[10px] font-mono font-semibold rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              {dailyWorkData.logs.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: Profile & Verification Details */}
      {activeTab === "profile" && (
        <div className="space-y-4">
          <div className="rounded-b-lg border border-border bg-card p-4 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
              Worker Profile & Verification Details
            </h3>

            {/* 1. Personal & Contact Information */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <User className="h-3 w-3 text-primary" /> Personal & Contact
                Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5">
                <div className="space-y-0.5 p-2 bg-muted/20 rounded-md border border-border">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase block">
                    Full Name
                  </span>
                  <p className="font-semibold text-foreground text-xs">
                    {worker.full_name}
                  </p>
                </div>
                <div className="space-y-0.5 p-2 bg-muted/20 rounded-md border border-border">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase block">
                    Primary Phone
                  </span>
                  <p className="font-mono text-foreground text-xs">
                    {worker.phone || "Not provided"}
                  </p>
                </div>
                <div className="space-y-0.5 p-2 bg-muted/20 rounded-md border border-border">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase block">
                    Alternate Phone
                  </span>
                  <p className="font-mono text-foreground text-xs">
                    {worker.alternate_phone || "Not provided"}
                  </p>
                </div>
                <div className="space-y-0.5 p-2 bg-muted/20 rounded-md border border-border">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase block">
                    Date of Birth
                  </span>
                  <p className="font-mono text-foreground text-xs">
                    {worker.dob ? worker.dob.split("T")[0] : "Not provided"}
                  </p>
                </div>
                <div className="space-y-0.5 p-2 bg-muted/20 rounded-md border border-border">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase block">
                    Gender
                  </span>
                  <p className="font-medium text-foreground text-xs capitalize">
                    {worker.gender
                      ? worker.gender.toLowerCase()
                      : "Not specified"}
                  </p>
                </div>
                <div className="space-y-0.5 p-2 bg-muted/20 rounded-md border border-border md:col-span-3">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> Residential Address
                  </span>
                  <p className="text-foreground text-xs">
                    {worker.address || "No address recorded"}
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Identity Verification */}
            <div className="space-y-2 pt-3 border-t border-border">
              <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <FileText className="h-3 w-3 text-primary" /> Identity &
                Verification
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                <div className="space-y-0.5 p-2 bg-muted/20 rounded-md border border-border">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase block">
                    ID Proof Document
                  </span>
                  <p className="font-medium text-foreground text-xs">
                    {worker.id_proof_type || "Not provided"}
                  </p>
                </div>
                <div className="space-y-0.5 p-2 bg-muted/20 rounded-md border border-border">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase block">
                    ID Number / Card No.
                  </span>
                  <p className="font-mono text-foreground text-xs">
                    {worker.id_proof_number || "Not provided"}
                  </p>
                </div>
                <div className="space-y-0.5 p-2 bg-muted/20 rounded-md border border-border">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3 text-emerald-500" />{" "}
                    Verification Status
                  </span>
                  <p className="font-medium text-emerald-600 dark:text-emerald-400 text-xs">
                    {worker.id_proof_number
                      ? "Verified Document"
                      : "Pending Document"}
                  </p>
                </div>
              </div>
            </div>

            {/* 3. Emergency & Nominee Contact */}
            <div className="space-y-2 pt-3 border-t border-border">
              <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <HeartHandshake className="h-3 w-3 text-primary" /> Emergency &
                Nominee Contact
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                <div className="space-y-0.5 p-2 bg-muted/20 rounded-md border border-border">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase block">
                    Nominee / Contact Person
                  </span>
                  <p className="font-semibold text-foreground text-xs">
                    {worker.emergency_contact_name || "Not provided"}
                  </p>
                </div>
                <div className="space-y-0.5 p-2 bg-muted/20 rounded-md border border-border">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase block">
                    Relationship
                  </span>
                  <p className="font-medium text-foreground text-xs">
                    {worker.emergency_relationship || "Not specified"}
                  </p>
                </div>
                <div className="space-y-0.5 p-2 bg-muted/20 rounded-md border border-border">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase block">
                    Contact Phone
                  </span>
                  <p className="font-mono text-foreground text-xs">
                    {worker.emergency_contact_phone ? (
                      <a
                        href={`tel:${worker.emergency_contact_phone}`}
                        className="hover:text-primary hover:underline"
                      >
                        {worker.emergency_contact_phone}
                      </a>
                    ) : (
                      "Not provided"
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Pay Rate History */}
          <div className="rounded-lg border border-border bg-card p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <History className="h-3.5 w-3.5 text-primary" /> Pay Rate
                History
              </h3>
              {canWrite && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1 text-[11px]"
                  onClick={() => setShowRateDialog(true)}
                >
                  <Banknote className="h-3 w-3" /> Record Rate Change
                </Button>
              )}
            </div>

            {worker.worker_wage_rates && worker.worker_wage_rates.length > 0 ? (
              <div className="border border-border rounded-md overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/40 text-muted-foreground border-b border-border font-semibold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-2 px-3">Rate (₹)</th>
                      <th className="py-2 px-3">Effective From</th>
                      <th className="py-2 px-3">Type</th>
                      <th className="py-2 px-3">Recorded Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {worker.worker_wage_rates.map((rate, index) => (
                      <tr
                        key={rate.id}
                        className={
                          index === 0 ? "bg-primary/5 font-semibold" : ""
                        }
                      >
                        <td className="py-2 px-3 font-mono text-foreground font-bold">
                          ₹{rate.rate_amount.toFixed(2)}
                          {index === 0 && (
                            <Badge
                              variant="success"
                              className="ml-2 py-0 px-1 text-[9px]"
                            >
                              CURRENT
                            </Badge>
                          )}
                        </td>
                        <td className="py-2 px-3 font-mono">
                          {rate.effective_from}
                        </td>
                        <td className="py-2 px-3 capitalize">
                          {rate.rate_type.replace(/_/g, " ")}
                        </td>
                        <td className="py-2 px-3 text-muted-foreground font-mono">
                          {new Date(rate.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">
                No wage rates recorded yet.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Embedded Record Daily Work Form */}
      {activeTab === "record_work" && (
        <div className="rounded-b-lg border border-border bg-card p-4 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Coins className="h-4 w-4 text-amber-500" /> Record Daily Work /
                दैनंदिन काम नोंदवा
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Log daily production for {worker.full_name} using Pinjrya count
                or direct quantity.
              </p>
            </div>
          </div>

          <EmbeddedRecordWorkForm
            worker={worker}
            orgId={orgId}
            onSuccess={() => setActiveTab("ledger")}
          />
        </div>
      )}

      {/* Tab 3: Daily Work Ledger & Logs */}
      {activeTab === "ledger" && (
        <div className="rounded-b-lg border border-border bg-card p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Coins className="h-3.5 w-3.5 text-amber-500" /> Daily Work Logs &
              Earnings Ledger
            </h3>
            {canWrite && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 gap-1 text-[11px] border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                onClick={() => setActiveTab("record_work")}
              >
                <PlusCircle className="h-3 w-3 text-amber-500" /> Log Daily Work
              </Button>
            )}
          </div>

          {groupedDailyLogs && groupedDailyLogs.length > 0 ? (
            <div className="border border-border rounded-lg overflow-x-auto shadow-xs">
              <table className="w-full min-w-[680px] text-xs text-left border-collapse">
                <thead className="bg-muted/60 text-muted-foreground border-b border-border font-semibold uppercase text-[10px] tracking-wider whitespace-nowrap">
                  <tr>
                    <th className="py-3 px-3.5">Day / वार</th>
                    <th className="py-3 px-3.5">Date</th>
                    <th className="py-3 px-3.5">Entry Mode</th>
                    <th className="py-3 px-3.5 text-right">Physical Qty</th>
                    <th className="py-3 px-3.5 text-right">Billable Qty</th>
                    <th className="py-3 px-3.5 text-right">Rate</th>
                    <th className="py-3 px-3.5 text-right">Earned Amount</th>
                    {worker.category === "AALYAWALE" ? (
                      <th className="py-3 px-3.5">Kachha Maal Majur</th>
                    ) : (
                      <th className="py-3 px-3.5">Aalyawala</th>
                    )}
                    {worker.category === "BHATKAR" ? (
                      <th className="py-3 px-3.5">Kachha Maal Majur</th>
                    ) : (
                      <th className="py-3 px-3.5">Bhatkar</th>
                    )}
                    <th className="py-3 px-3.5 text-center">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 font-mono">
                  {groupedDailyLogs.map((logGroup: any) => {
                    const isMulti = logGroup.items.length > 1;
                    const isExpanded = !!expandedRowKeys[logGroup.id];
                    const aalyawalaNames = logGroup.items
                      .map((i: any) => i.aalyawala_name)
                      .filter(Boolean)
                      .join(", ");

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
                            <Badge
                              variant="outline"
                              className="text-[10px] font-sans"
                            >
                              {logGroup.entry_mode === "PINJRI_COUNT"
                                ? "Pinjri (22/20)"
                                : logGroup.entry_mode === "SHIFT_COUNT"
                                  ? "Shift"
                                  : "Direct"}
                            </Badge>
                          </td>
                          <td className="py-3 px-3.5 text-right text-muted-foreground font-semibold whitespace-nowrap">
                            {logGroup.physical_quantity?.toLocaleString()}
                          </td>
                          <td className="py-3 px-3.5 text-right font-bold text-foreground whitespace-nowrap">
                            {logGroup.billable_quantity?.toLocaleString()}
                          </td>
                          <td className="py-3 px-3.5 text-right text-muted-foreground whitespace-nowrap">
                            ₹{Number(logGroup.rate || 0).toFixed(2)}
                          </td>
                          <td className="py-3 px-3.5 text-right font-bold text-emerald-600 dark:text-emerald-400 text-xs whitespace-nowrap">
                            ₹{Number(logGroup.earned_amount || 0).toFixed(2)}
                          </td>
                          <td className="py-3 px-3.5 font-sans text-foreground text-[11px] font-medium whitespace-nowrap">
                            {worker.category === "AALYAWALE" ? (
                              <span>{logGroup.kachha_maal_name || "—"}</span>
                            ) : isMulti ? (
                              <div className="flex items-center gap-1.5">
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                                  <Users className="h-3 w-3 text-amber-500" />
                                  {logGroup.items.length} Aalyawalas
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
                            {worker.category === "BHATKAR"
                              ? logGroup.kachha_maal_name || "—"
                              : logGroup.bhatkar_name || "—"}
                          </td>
                          <td className="py-3 px-3.5 font-sans text-center whitespace-nowrap">
                            {logGroup.is_auto_generated ? (
                              <Badge
                                variant="secondary"
                                className="text-[9px] bg-slate-800 text-slate-300 border border-slate-700 font-mono"
                              >
                                Auto-Generated
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="text-[9px] text-emerald-600 border-emerald-500/30 font-mono"
                              >
                                Primary Log
                              </Badge>
                            )}
                          </td>
                        </tr>

                        {/* Inline Expandable Breakdown Sub-row with Table Format */}
                        {isMulti && isExpanded && (
                          <tr className="bg-amber-500/5 dark:bg-amber-950/20 border-b border-amber-500/20 animate-in fade-in-50 duration-200">
                            <td colSpan={10} className="p-3 sm:p-4">
                              <div className="bg-card dark:bg-slate-900/90 border border-amber-500/30 rounded-lg p-3 sm:p-4 space-y-3 shadow-md">
                                {/* Sub-table Header */}
                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2.5">
                                  <div className="flex items-center gap-2">
                                    <span className="p-1 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                      <Users className="h-4 w-4" />
                                    </span>
                                    <div>
                                      <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                                        Aalyawala Contribution Breakdown /
                                        आल्यावाले तपशील
                                      </h4>
                                      <p className="text-[10px] text-muted-foreground font-sans">
                                        Individual work & earnings records for{" "}
                                        {formatDateDdMmYyyy(logGroup.work_date)}
                                      </p>
                                    </div>
                                  </div>
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] font-mono border-amber-500/30 text-amber-700 dark:text-amber-300"
                                  >
                                    {logGroup.items.length} Aalyawala Entries
                                  </Badge>
                                </div>

                                {/* Responsive Sub-table */}
                                <div className="overflow-x-auto rounded-md border border-border/80 bg-background/50">
                                  <table className="w-full min-w-[580px] text-xs text-left border-collapse font-mono">
                                    <thead className="bg-muted/70 text-muted-foreground border-b border-border text-[10px] uppercase font-sans tracking-wider font-semibold whitespace-nowrap">
                                      <tr>
                                        <th className="py-2 px-3">#</th>
                                        <th className="py-2 px-3">
                                          Aalyawala Name
                                        </th>
                                        <th className="py-2 px-3 text-right">
                                          {logGroup.entry_mode ===
                                          "PINJRI_COUNT"
                                            ? "Input (Pinjri)"
                                            : "Input Qty"}
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
                                            <td className="py-2 px-3 font-sans font-bold text-foreground whitespace-nowrap">
                                              {item.aalyawala_name ||
                                                `Aalyawala #${idx + 1}`}
                                            </td>
                                            <td className="py-2 px-3 text-right text-muted-foreground whitespace-nowrap">
                                              {item.input_quantity?.toLocaleString()}{" "}
                                              {logGroup.entry_mode ===
                                              "PINJRI_COUNT"
                                                ? "Pinjri"
                                                : ""}
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
                                                logGroup.rate || 0,
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
                                          colSpan={2}
                                          className="py-2 px-3 font-sans text-[10px] uppercase tracking-wider text-muted-foreground"
                                        >
                                          Combined Total
                                        </td>
                                        <td className="py-2 px-3 text-right font-mono">
                                          {logGroup.items
                                            .reduce(
                                              (sum: number, i: any) =>
                                                sum +
                                                Number(i.input_quantity || 0),
                                              0,
                                            )
                                            .toLocaleString()}{" "}
                                          {logGroup.entry_mode ===
                                          "PINJRI_COUNT"
                                            ? "Pinjri"
                                            : ""}
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
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic py-2">
              No daily work logs recorded yet for this worker.
            </p>
          )}
        </div>
      )}

      {/* Dialogs */}
      {showRateDialog && (
        <RateChangeDialog
          open={showRateDialog}
          onClose={() => setShowRateDialog(false)}
          workerId={worker.id}
          workerName={worker.full_name}
          currentRate={worker.current_rate_amount || 0}
          onSubmitRateChange={async (data) => {
            await changeWorkerRate.mutateAsync(data);
          }}
        />
      )}

      {showDeactivateDialog && (
        <WorkerDeactivateDialog
          open={showDeactivateDialog}
          onClose={() => setShowDeactivateDialog(false)}
          workerId={worker.id}
          workerName={worker.full_name}
          advanceBalance={worker.advance_balance}
          onConfirmDeactivate={async (id) => {
            await deactivateWorker.mutateAsync(id);
          }}
        />
      )}
    </div>
  );
}
