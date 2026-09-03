'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { RateChangeDialog } from '@/features/workers/components/RateChangeDialog';
import { WorkerDeactivateDialog } from '@/features/workers/components/WorkerDeactivateDialog';
import {
  useChangeWorkerRate,
  useDeactivateWorker,
  useWorkerDetail,
} from '@/features/workers/hooks/useWorkers';
import {
  AlertCircle,
  ArrowLeft,
  Banknote,
  Briefcase,
  Calendar,
  Clock,
  Edit,
  History,
  IndianRupee,
  MapPin,
  Phone,
  Receipt,
  UserX,
} from 'lucide-react';
import Link from 'next/link';
import { use, useState } from 'react';

interface WorkerDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function WorkerDetailPage({ params }: WorkerDetailPageProps) {
  const resolvedParams = use(params);
  const workerId = resolvedParams.id;
  const { profile } = useAuth();
  const orgId = profile?.organization_id ?? '';

  const { data: worker, isLoading: loading } = useWorkerDetail(workerId);
  const deactivateWorker = useDeactivateWorker(orgId);
  const changeWorkerRate = useChangeWorkerRate(orgId, workerId);

  // Modal Dialog states
  const [showRateDialog, setShowRateDialog] = useState(false);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);

  const roleUpper = (profile?.role || '').toUpperCase();
  const canWrite = !profile?.role || ['OWNER', 'MANAGER', 'ADMIN'].includes(roleUpper);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <Clock className="h-4 w-4 animate-spin text-primary" /> Loading worker record...
        </div>
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="space-y-4">
        <Link href="/workers">
          <Button variant="outline" size="sm" className="gap-1.5">
            <ArrowLeft className="h-4 w-4" /> Back to Roster
          </Button>
        </Link>
        <div className="p-8 text-center border border-border rounded-xl bg-card">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
          <h2 className="text-base font-bold text-foreground">Worker Not Found</h2>
          <p className="text-xs text-muted-foreground mt-1">
            The requested worker record does not exist or was removed.
          </p>
        </div>
      </div>
    );
  }

  const userInitials = worker.full_name
    ? worker.full_name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'WK';

  return (
    <div className="space-y-6 ">
      {/* Back Button */}
      <div>
        <Link href="/workers">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <ArrowLeft className="h-4 w-4" /> Back to Worker Roster
          </Button>
        </Link>
      </div>

      {/* Identity Card */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-bold shadow-xs">
              {userInitials}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold tracking-tight text-foreground">{worker.full_name}</h1>
                <Badge variant={worker.status === 'active' ? 'success' : 'secondary'}>
                  {worker.status}
                </Badge>
              </div>

              <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1 font-medium">
                  <Briefcase className="h-3.5 w-3.5 text-primary" /> {
                    worker.category === 'PIECE_RATE' ? 'Piece Rate Moulder' :
                    worker.category === 'DAILY_WAGE' ? 'Daily Wage' :
                    worker.category === 'MONTHLY_SALARY' ? 'Monthly Salary' :
                    (worker.category ?? 'Piece Rate Moulder')
                  }
                </span>
                {worker.phone && (
                  <a
                    href={`tel:${worker.phone}`}
                    className="flex items-center gap-1 font-mono hover:text-primary hover:underline transition-colors"
                  >
                    <Phone className="h-3.5 w-3.5" /> {worker.phone}
                  </a>
                )}
                <span className="flex items-center gap-1 font-mono">
                  <Calendar className="h-3.5 w-3.5" /> Joined: {worker.joining_date}
                </span>
              </div>
            </div>
          </div>

          {canWrite && (
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <Link href={`/workers/${worker.id}/edit`}>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  <Edit className="h-3.5 w-3.5" /> Edit Profile
                </Button>
              </Link>

              <Button
                variant="default"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => setShowRateDialog(true)}
              >
                <Banknote className="h-3.5 w-3.5" /> Change Rate
              </Button>

              {worker.status === 'active' && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="gap-1.5 text-xs"
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <Banknote className="h-3.5 w-3.5 text-primary" /> Current Piece Rate
          </span>
          <span className="text-xl font-bold font-mono text-foreground block tabular-nums">
            ₹{Number(worker.current_rate_amount || 0).toFixed(2)}
          </span>
          <span className="text-[11px] text-muted-foreground">per 1,000 moulded bricks</span>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <IndianRupee className="h-3.5 w-3.5 text-amber-500" /> Advance Balance
          </span>
          <span className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400 block tabular-nums">
            ₹{Number(worker.advance_balance || 0).toFixed(2)}
          </span>
          <span className="text-[11px] text-muted-foreground">Unsettled advances given</span>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <Receipt className="h-3.5 w-3.5 text-emerald-500" /> Settlements Count
          </span>
          <span className="text-xl font-bold font-mono text-foreground block tabular-nums">
            {worker.worker_settlements?.length || 0}
          </span>
          <span className="text-[11px] text-muted-foreground">Processed wage payouts</span>
        </div>
      </div>

      {/* Overview & Contact */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Profile Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1 p-3 bg-muted/20 rounded-lg border border-border">
            <span className="text-[11px] font-bold text-muted-foreground uppercase">Full Name</span>
            <p className="font-semibold text-foreground text-sm">{worker.full_name}</p>
          </div>
          <div className="space-y-1 p-3 bg-muted/20 rounded-lg border border-border">
            <span className="text-[11px] font-bold text-muted-foreground uppercase">Phone Number</span>
            <p className="font-mono text-foreground text-sm">{worker.phone || 'Not provided'}</p>
          </div>
          <div className="space-y-1 p-3 bg-muted/20 rounded-lg border border-border">
            <span className="text-[11px] font-bold text-muted-foreground uppercase">Category / Role</span>
            <p className="font-medium text-foreground text-sm">
              {
                worker.category === 'PIECE_RATE' ? 'Piece Rate Moulder' :
                worker.category === 'DAILY_WAGE' ? 'Daily Wage' :
                worker.category === 'MONTHLY_SALARY' ? 'Monthly Salary' :
                (worker.category ?? 'General Worker')
              }
            </p>
          </div>
          <div className="space-y-1 p-3 bg-muted/20 rounded-lg border border-border">
            <span className="text-[11px] font-bold text-muted-foreground uppercase">Joining Date</span>
            <p className="font-mono font-medium text-foreground text-sm">{worker.joining_date}</p>
          </div>
          <div className="space-y-1 p-3 bg-muted/20 rounded-lg border border-border md:col-span-2">
            <span className="text-[11px] font-bold text-muted-foreground uppercase flex items-center gap-1">
              <MapPin className="h-3 w-3" /> Address
            </span>
            <p className="text-foreground text-sm">{worker.address || 'No address recorded'}</p>
          </div>
        </div>
      </div>

      {/* Moulding Rate History */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
            <History className="h-4 w-4 text-primary" /> Moulding Pay Rate History
          </h3>
          {canWrite && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => setShowRateDialog(true)}
            >
              <Banknote className="h-3.5 w-3.5" /> Record Rate Change
            </Button>
          )}
        </div>

        {worker.worker_wage_rates && worker.worker_wage_rates.length > 0 ? (
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/40 text-muted-foreground border-b border-border font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3">Rate (₹ / 1K Bricks)</th>
                  <th className="p-3">Effective From</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Recorded Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {worker.worker_wage_rates.map((rate, index) => (
                  <tr key={rate.id} className={index === 0 ? 'bg-primary/5 font-semibold' : ''}>
                    <td className="p-3 font-mono text-foreground font-bold">
                      ₹{rate.rate_amount.toFixed(2)}
                      {index === 0 && (
                        <Badge variant="success" className="ml-2 py-0 px-1 text-[9px]">
                          CURRENT
                        </Badge>
                      )}
                    </td>
                    <td className="p-3 font-mono">{rate.effective_from}</td>
                    <td className="p-3 capitalize">{rate.rate_type.replace(/_/g, ' ')}</td>
                    <td className="p-3 text-muted-foreground font-mono">
                      {new Date(rate.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic">No wage rates recorded yet.</p>
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
