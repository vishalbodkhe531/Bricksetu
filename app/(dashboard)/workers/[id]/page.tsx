"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  Banknote,
  Briefcase,
  Calendar,
  Clock,
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
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { RateChangeDialog } from "@/features/workers/components/RateChangeDialog";
import { WorkerDeactivateDialog } from "@/features/workers/components/WorkerDeactivateDialog";
import {
  useChangeWorkerRate,
  useDeactivateWorker,
  useWorkerDetail,
} from "@/features/workers/hooks/useWorkers";
import { formatWorkerCategory } from "@/features/workers/constants/worker-options";

interface WorkerDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function WorkerDetailPage({ params }: WorkerDetailPageProps) {
  const resolvedParams = use(params);
  const workerId = resolvedParams.id;
  const { profile } = useAuth();
  const orgId = profile?.organization_id ?? "";

  const { data: worker, isLoading: loading } = useWorkerDetail(workerId);
  const deactivateWorker = useDeactivateWorker(orgId);
  const changeWorkerRate = useChangeWorkerRate(orgId, workerId);

  // Modal Dialog states
  const [showRateDialog, setShowRateDialog] = useState(false);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);

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
                  <Calendar className="h-3 w-3" /> Joined:{" "}
                  {worker.joining_date}
                </span>
              </div>
            </div>
          </div>

          {canWrite && (
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <Link href={`/workers/${worker.id}/edit`}>
                <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                  <Edit className="h-3.5 w-3.5" /> Edit Profile
                </Button>
              </Link>

              <Button
                variant="default"
                size="sm"
                className="h-8 gap-1.5 text-xs"
                onClick={() => setShowRateDialog(true)}
              >
                <Banknote className="h-3.5 w-3.5" /> Change Rate
              </Button>

              {worker.status === "active" && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-8 gap-1.5 text-xs"
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
            <Receipt className="h-3 w-3 text-emerald-500" /> Settlements Count
          </span>
          <span className="text-lg font-bold font-mono text-foreground block tabular-nums">
            {worker.worker_settlements?.length || 0}
          </span>
          <span className="text-[10px] text-muted-foreground">
            Processed wage payouts
          </span>
        </div>
      </div>

      {/* Detailed Profile Information */}
      <div className="rounded-lg border border-border bg-card p-4 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
          Worker Profile & Verification Details
        </h3>

        {/* 1. Personal & Contact Information */}
        <div className="space-y-2">
          <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <User className="h-3 w-3 text-primary" /> Personal & Contact Information
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
                {worker.gender ? worker.gender.toLowerCase() : "Not specified"}
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
            <FileText className="h-3 w-3 text-primary" /> Identity & Verification
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
                <ShieldCheck className="h-3 w-3 text-emerald-500" /> Verification Status
              </span>
              <p className="font-medium text-emerald-600 dark:text-emerald-400 text-xs">
                {worker.id_proof_number ? "Verified Document" : "Pending Document"}
              </p>
            </div>
          </div>
        </div>

        {/* 3. Emergency & Nominee Contact */}
        <div className="space-y-2 pt-3 border-t border-border">
          <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <HeartHandshake className="h-3 w-3 text-primary" /> Emergency & Nominee Contact
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

      {/* Moulding Rate History */}
      <div className="rounded-lg border border-border bg-card p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <History className="h-3.5 w-3.5 text-primary" /> Pay Rate History
          </h3>
          {canWrite && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1 text-[11px]"
              onClick={() => setShowRateDialog(false)}
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
                    className={index === 0 ? "bg-primary/5 font-semibold" : ""}
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
                    <td className="py-2 px-3 font-mono">{rate.effective_from}</td>
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
