'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Users,
  Phone,
  Calendar,
  MapPin,
  IndianRupee,
  Briefcase,
  Edit,
  Plus,
  TrendingUp,
  FileCheck,
  Receipt,
  Boxes,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';
import {
  getWorkerDetailAction,
  updateWorkerAction,
  addWorkerRateAction,
  approveSettlementAction,
} from '@/features/workers/actions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTable, Column } from '@/components/ui/data-table/data-table';
import { toast } from 'sonner';

interface WorkerDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function WorkerDetailPage({ params }: WorkerDetailPageProps) {
  const resolvedParams = use(params);
  const workerId = resolvedParams.id;
  const router = useRouter();

  const [worker, setWorker] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'rate_history' | 'payments' | 'production' | 'settlements'>('overview');

  // Modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddRateModal, setShowAddRateModal] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Edit Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [paymentType, setPaymentType] = useState('PIECE_RATE');

  // Rate Form State
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [newRateRupees, setNewRateRupees] = useState('450');

  useEffect(() => {
    loadWorkerDetail();
  }, [workerId]);

  async function loadWorkerDetail() {
    setLoading(true);
    const res = await getWorkerDetailAction(workerId);
    if (res.success && res.data) {
      setWorker(res.data);
      setFullName(res.data.full_name || '');
      setPhone(res.data.phone || '');
      setAddress(res.data.address || '');
      setPaymentType(res.data.payment_type || 'PIECE_RATE');
    } else {
      toast.error(!res.success ? res.error : 'Failed to load worker detail');
    }
    setLoading(false);
  }

  const handleUpdateWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    const formData = new FormData();
    formData.append('full_name', fullName);
    formData.append('phone', phone);
    formData.append('address', address);
    formData.append('payment_type', paymentType);

    const res = await updateWorkerAction(workerId, formData);
    if (res.success) {
      toast.success('Worker details updated successfully');
      setShowEditModal(false);
      loadWorkerDetail();
    } else {
      toast.error(!res.success ? res.error : 'Failed to update worker details');
    }
    setUpdating(false);
  };

  const handleAddRate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    const rateVal = parseFloat(newRateRupees);
    if (isNaN(rateVal) || rateVal <= 0) {
      toast.error('Please enter a valid rate amount');
      setUpdating(false);
      return;
    }

    const res = await addWorkerRateAction(workerId, effectiveDate, rateVal);
    if (res.success) {
      toast.success('New rate added successfully');
      setShowAddRateModal(false);
      loadWorkerDetail();
    } else {
      toast.error(!res.success ? res.error : 'Failed to add rate entry');
    }
    setUpdating(false);
  };

  const handleApproveSettlement = async (settlementId: string) => {
    const res = await approveSettlementAction(settlementId);
    if (res.success) {
      toast.success('Settlement approved successfully!');
      loadWorkerDetail();
    } else {
      toast.error(!res.success ? res.error : 'Failed to approve settlement');
    }
  };

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
          <p className="text-xs text-muted-foreground mt-1">The requested worker record does not exist or was removed.</p>
        </div>
      </div>
    );
  }

  // Get Initials for Avatar
  const userInitials = worker.full_name
    ? worker.full_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
    : 'WK';

  // Calculate Tenure Days
  const joiningDate = worker.joining_date ? new Date(worker.joining_date) : new Date();
  const tenureDays = Math.floor((new Date().getTime() - joiningDate.getTime()) / (1000 * 3600 * 24));

  // Table Columns
  const rateHistoryColumns: Column<any>[] = [
    {
      accessorKey: 'effective_date',
      header: 'Effective Date',
      cell: ({ row }) => <span className="font-mono text-xs font-medium text-foreground">{row.original.effective_date ? String(row.original.effective_date) : '—'}</span>,
    },
    {
      accessorKey: 'rate_per_1000_paise',
      header: 'Rate / 1,000 Bricks',
      align: 'right',
      cell: ({ row }) => (
        <span className="font-mono font-bold text-foreground tabular-nums text-xs">
          ₹{(parseInt(row.original.rate_per_1000_paise || '0', 10) / 100).toFixed(2)}
        </span>
      ),
    },
    {
      accessorKey: 'created_at',
      header: 'Date Logged',
      align: 'right',
      cell: ({ row }) => (
        <span className="text-muted-foreground font-mono text-[11px]">
          {row.original.created_at ? String(row.original.created_at) : '—'}
        </span>
      ),
    },
  ];

  const paymentColumns: Column<any>[] = [
    {
      accessorKey: 'payment_date',
      header: 'Date',
      cell: ({ row }) => <span className="font-mono text-xs text-foreground">{row.original.payment_date ? String(row.original.payment_date) : '—'}</span>,
    },
    {
      accessorKey: 'payment_method_name',
      header: 'Method',
      cell: ({ row }) => <span className="font-medium text-foreground text-xs">{row.original.payment_method_name || 'Cash'}</span>,
    },
    {
      accessorKey: 'direction',
      header: 'Type',
      align: 'center',
      cell: ({ row }) => (
        <Badge variant={row.original.direction === 'OUTGOING' ? 'warning' : 'info'}>
          {row.original.direction === 'OUTGOING' ? 'WAGE ADVANCE' : 'PAYMENT'}
        </Badge>
      ),
    },
    {
      accessorKey: 'amount_paise',
      header: 'Amount',
      align: 'right',
      cell: ({ row }) => (
        <span className="font-mono font-bold text-foreground tabular-nums text-xs">
          ₹{(parseInt(row.original.amount_paise || '0', 10) / 100).toFixed(2)}
        </span>
      ),
    },
    {
      accessorKey: 'remarks',
      header: 'Remarks',
      cell: ({ row }) => <span className="text-muted-foreground text-xs">{row.original.remarks || '—'}</span>,
    },
  ];

  const productionColumns: Column<any>[] = [
    {
      accessorKey: 'work_date',
      header: 'Date',
      cell: ({ row }) => <span className="font-mono text-xs text-foreground">{row.original.work_date ? String(row.original.work_date) : '—'}</span>,
    },
    {
      accessorKey: 'batch_number',
      header: 'Batch #',
      cell: ({ row }) => <span className="font-mono font-bold text-foreground text-xs">{row.original.batch_number}</span>,
    },
    {
      accessorKey: 'brick_type_name',
      header: 'Brick Type',
      cell: ({ row }) => <span className="text-foreground text-xs">{row.original.brick_type_name}</span>,
    },
    {
      accessorKey: 'bricks_moulded',
      header: 'Bricks Moulded',
      align: 'right',
      cell: ({ row }) => (
        <span className="font-mono font-bold text-foreground tabular-nums text-xs">
          {parseInt(row.original.bricks_moulded || '0', 10).toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: 'earned_amount_paise',
      header: 'Earned Amount',
      align: 'right',
      cell: ({ row }) => (
        <span className="font-mono font-bold text-foreground tabular-nums text-xs">
          ₹{(parseInt(row.original.earned_amount_paise || '0', 10) / 100).toFixed(2)}
        </span>
      ),
    },
  ];

  const settlementColumns: Column<any>[] = [
    {
      accessorKey: 'settlement_number',
      header: 'Settlement #',
      cell: ({ row }) => <span className="font-mono font-bold text-foreground text-xs">{row.original.settlement_number}</span>,
    },
    {
      accessorKey: 'period_start_date',
      header: 'Period',
      cell: ({ row }) => (
        <span className="text-muted-foreground font-mono text-[11px]">
          {row.original.period_start_date ? String(row.original.period_start_date) : ''} → {row.original.period_end_date ? String(row.original.period_end_date) : ''}
        </span>
      ),
    },
    {
      accessorKey: 'total_bricks_moulded',
      header: 'Bricks',
      align: 'right',
      cell: ({ row }) => (
        <span className="font-mono font-medium text-foreground tabular-nums text-xs">
          {parseInt(row.original.total_bricks_moulded || '0', 10).toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: 'net_payable_paise',
      header: 'Net Payable',
      align: 'right',
      cell: ({ row }) => (
        <span className="font-mono font-bold text-foreground tabular-nums text-xs">
          ₹{(parseInt(row.original.net_payable_paise || '0', 10) / 100).toFixed(2)}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      align: 'center',
      cell: ({ row }) => {
        const s = row.original.status;
        const variant = s === 'APPROVED' ? 'success' : s === 'DRAFT' ? 'warning' : 'secondary';
        return <Badge variant={variant}>{s}</Badge>;
      },
    },
    {
      id: 'actions',
      header: 'Action',
      align: 'center',
      cell: ({ row }) =>
        row.original.status === 'DRAFT' ? (
          <Button
            size="sm"
            onClick={() => handleApproveSettlement(row.original.id)}
            className="h-7 text-[11px] bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
          >
            Approve
          </Button>
        ) : null,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div>
        <Link href="/workers">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <ArrowLeft className="h-4 w-4" /> Back to Worker Roster
          </Button>
        </Link>
      </div>

      {/* Header / Identity Card */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Avatar Pill */}
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-bold shadow-xs">
              {userInitials}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold tracking-tight text-foreground">{worker.full_name}</h1>
                <Badge variant="outline" className="font-mono text-xs bg-muted/40 font-semibold">
                  {worker.code}
                </Badge>
                <Badge variant="success">Active</Badge>
              </div>

              <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1 font-medium">
                  <Briefcase className="h-3.5 w-3.5 text-primary" /> {worker.payment_type || 'Moulder (Piece Rate)'}
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
                  <Calendar className="h-3.5 w-3.5" /> Joined: {worker.joining_date ? String(worker.joining_date) : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={() => setShowAddRateModal(true)} className="gap-1 text-xs">
              <TrendingUp className="h-3.5 w-3.5" /> New Rate
            </Button>
            <Button variant="default" size="sm" onClick={() => setShowEditModal(true)} className="gap-1 text-xs">
              <Edit className="h-3.5 w-3.5" /> Edit Profile
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Current Rate</span>
          <span className="text-base font-bold font-mono text-foreground mt-1 block tabular-nums">
            ₹{(parseInt(worker.current_rate_paise || '0', 10) / 100).toFixed(2)}
            <span className="text-[10px] font-normal text-muted-foreground font-sans ml-1">/ 1K</span>
          </span>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Total Bricks</span>
          <span className="text-base font-bold font-mono text-foreground mt-1 block tabular-nums">
            {parseInt(worker.total_bricks_moulded || '0', 10).toLocaleString()}
          </span>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Pending Balance</span>
          <span className={`text-base font-bold font-mono mt-1 block tabular-nums ${parseInt(worker.payable_balance_paise || '0', 10) > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-muted-foreground'}`}>
            ₹{(parseInt(worker.payable_balance_paise || '0', 10) / 100).toFixed(2)}
          </span>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Total Advances</span>
          <span className="text-base font-bold font-mono text-foreground mt-1 block tabular-nums">
            ₹{(parseInt(worker.total_advance_paise || '0', 10) / 100).toFixed(2)}
          </span>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-xs col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Tenure</span>
          <span className="text-base font-bold font-mono text-foreground mt-1 block tabular-nums">
            {tenureDays} <span className="text-[10px] font-normal text-muted-foreground font-sans">days</span>
          </span>
        </div>
      </div>

      {/* Tabs List */}
      <TabsList className="overflow-x-auto">
        <TabsTrigger active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
          Overview
        </TabsTrigger>
        <TabsTrigger active={activeTab === 'rate_history'} onClick={() => setActiveTab('rate_history')}>
          Rate History ({worker.rate_history?.length || 0})
        </TabsTrigger>
        <TabsTrigger active={activeTab === 'payments'} onClick={() => setActiveTab('payments')}>
          Advances & Payments ({worker.payments?.length || 0})
        </TabsTrigger>
        <TabsTrigger active={activeTab === 'production'} onClick={() => setActiveTab('production')}>
          Production Logs ({worker.moulding_logs?.length || 0})
        </TabsTrigger>
        <TabsTrigger active={activeTab === 'settlements'} onClick={() => setActiveTab('settlements')}>
          Settlements ({worker.settlements?.length || 0})
        </TabsTrigger>
      </TabsList>

      {/* Tab Content Panels */}
      {activeTab === 'overview' && (
        <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Profile Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1 p-3 bg-muted/20 rounded-lg border border-border">
              <span className="text-[11px] font-bold text-muted-foreground uppercase">Worker Code</span>
              <p className="font-mono font-bold text-foreground text-sm">{worker.code}</p>
            </div>
            <div className="space-y-1 p-3 bg-muted/20 rounded-lg border border-border">
              <span className="text-[11px] font-bold text-muted-foreground uppercase">Full Name</span>
              <p className="font-semibold text-foreground text-sm">{worker.full_name}</p>
            </div>
            <div className="space-y-1 p-3 bg-muted/20 rounded-lg border border-border">
              <span className="text-[11px] font-bold text-muted-foreground uppercase">Phone Number</span>
              <p className="font-mono text-foreground text-sm">{worker.phone || 'Not provided'}</p>
            </div>
            <div className="space-y-1 p-3 bg-muted/20 rounded-lg border border-border">
              <span className="text-[11px] font-bold text-muted-foreground uppercase">Payment Type</span>
              <p className="font-medium text-foreground text-sm">{worker.payment_type || 'PIECE_RATE'}</p>
            </div>
            <div className="space-y-1 p-3 bg-muted/20 rounded-lg border border-border">
              <span className="text-[11px] font-bold text-muted-foreground uppercase">Joining Date</span>
              <p className="font-mono text-foreground text-sm">{worker.joining_date ? String(worker.joining_date) : 'N/A'}</p>
            </div>
            <div className="space-y-1 p-3 bg-muted/20 rounded-lg border border-border">
              <span className="text-[11px] font-bold text-muted-foreground uppercase">Current Rate (per 1K)</span>
              <p className="font-mono font-bold text-foreground text-sm">
                ₹{(parseInt(worker.current_rate_paise || '0', 10) / 100).toFixed(2)}
              </p>
            </div>
            <div className="space-y-1 p-3 bg-muted/20 rounded-lg border border-border md:col-span-2">
              <span className="text-[11px] font-bold text-muted-foreground uppercase">Address</span>
              <p className="text-foreground text-sm">{worker.address || 'No residential address recorded'}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'rate_history' && (
        <DataTable
          columns={rateHistoryColumns}
          data={worker.rate_history || []}
          searchPlaceholder="Search rate history..."
          showExport={false}
        />
      )}

      {activeTab === 'payments' && (
        <DataTable
          columns={paymentColumns}
          data={worker.payments || []}
          searchPlaceholder="Search advances and payments..."
          showExport={false}
        />
      )}

      {activeTab === 'production' && (
        <DataTable
          columns={productionColumns}
          data={worker.moulding_logs || []}
          searchPlaceholder="Search moulding logs..."
          showExport={false}
        />
      )}

      {activeTab === 'settlements' && (
        <DataTable
          columns={settlementColumns}
          data={worker.settlements || []}
          searchPlaceholder="Search settlements..."
          showExport={false}
        />
      )}

      {/* Modal: Edit Worker */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 space-y-4 shadow-md">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">Edit Worker Profile</h3>
              <button onClick={() => setShowEditModal(false)} className="text-muted-foreground hover:text-foreground rounded p-1">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateWorker} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Full Name</label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Phone Number</label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Address</label>
                <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Residential address" />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Payment Type</label>
                <select
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value)}
                  className="w-full rounded-sm border border-border bg-card px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="PIECE_RATE">PIECE_RATE (per 1,000 bricks)</option>
                  <option value="DAILY_WAGE">DAILY_WAGE</option>
                  <option value="SALARIED">SALARIED</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="default" disabled={updating}>
                  {updating ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Rate Entry */}
      {showAddRateModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 space-y-4 shadow-md">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">Log New Rate / 1,000 Bricks</h3>
              <button onClick={() => setShowAddRateModal(false)} className="text-muted-foreground hover:text-foreground rounded p-1">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddRate} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Effective Date</label>
                <Input type="date" value={effectiveDate} onChange={(e) => setEffectiveDate(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Rate (₹ per 1,000 Bricks)</label>
                <Input type="number" step="0.5" value={newRateRupees} onChange={(e) => setNewRateRupees(e.target.value)} required />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowAddRateModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="default" disabled={updating}>
                  {updating ? 'Saving...' : 'Save Rate Entry'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
