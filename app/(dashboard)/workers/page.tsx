'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Plus, FileCheck, Eye, Calendar, X } from 'lucide-react';
import {
  getWorkersAction,
  createWorkerAction,
  getWorkerDetailAction,
  getSettlementsAction,
  getUnsettledWorkAction,
  generateSettlementAction,
  approveSettlementAction,
} from '@/features/workers/actions';
import { DataTable, Column } from '@/components/ui/data-table/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

export default function WorkersPage() {
  const [activeTab, setActiveTab] = useState<'workers' | 'settlements'>('workers');
  const [workers, setWorkers] = useState<any[]>([]);
  const [settlements, setSettlements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddWorker, setShowAddWorker] = useState(false);
  const [showSettlementModal, setShowSettlementModal] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
  const [workerDetail, setWorkerDetail] = useState<any | null>(null);

  // Settlement Form State
  const [settleWorkerId, setSettleWorkerId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [unsettledData, setUnsettledData] = useState<any | null>(null);
  const [settleSubmitting, setSettleSubmitting] = useState(false);

  // New Worker Form
  const [newWorkerCode, setNewWorkerCode] = useState('');
  const [newWorkerName, setNewWorkerName] = useState('');
  const [newWorkerPhone, setNewWorkerPhone] = useState('');
  const [newWorkerRate, setNewWorkerRate] = useState('450');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [wRes, sRes] = await Promise.all([getWorkersAction(), getSettlementsAction()]);
    if (wRes.success) setWorkers(wRes.data || []);
    if (sRes.success) setSettlements(sRes.data || []);
    setLoading(false);
  }

  const handleCreateWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('code', newWorkerCode);
    formData.append('full_name', newWorkerName);
    formData.append('phone', newWorkerPhone);
    formData.append('initial_rate', newWorkerRate);

    const res = await createWorkerAction(formData);
    if (res.success) {
      toast.success('Worker created successfully');
      setShowAddWorker(false);
      setNewWorkerCode('');
      setNewWorkerName('');
      setNewWorkerPhone('');
      loadData();
    } else {
      toast.error(res.error || 'Failed to create worker');
    }
  };

  const handleFetchUnsettled = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settleWorkerId || !startDate || !endDate) {
      toast.error('Worker, Start Date, and End Date are required.');
      return;
    }

    const res = await getUnsettledWorkAction(settleWorkerId, startDate, endDate);
    if (res.success) {
      setUnsettledData(res.data);
    } else {
      toast.error(res.error || 'Failed to fetch unsettled work');
    }
  };

  const handleGenerateSettlement = async () => {
    if (!settleWorkerId || !startDate || !endDate) return;
    setSettleSubmitting(true);
    const res = await generateSettlementAction(settleWorkerId, startDate, endDate);
    if (res.success) {
      toast.success('Settlement draft generated!');
      setShowSettlementModal(false);
      setUnsettledData(null);
      loadData();
    } else {
      toast.error(res.error || 'Failed to generate settlement');
    }
    setSettleSubmitting(false);
  };

  const handleApproveSettlement = async (id: string) => {
    const res = await approveSettlementAction(id);
    if (res.success) {
      toast.success('Settlement approved successfully!');
      loadData();
    } else {
      toast.error(res.error || 'Failed to approve settlement');
    }
  };

  const handleViewWorkerDetail = async (id: string) => {
    setSelectedWorkerId(id);
    const res = await getWorkerDetailAction(id);
    if (res.success) {
      setWorkerDetail(res.data);
    } else {
      toast.error(res.error || 'Failed to load worker detail');
    }
  };

  // Table Columns with alignment & monospace numeric styles
  const workerColumns: Column<any>[] = [
    {
      accessorKey: 'full_name',
      header: 'Worker Name',
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <div className="font-semibold text-foreground">{row.original.full_name}</div>
          <Badge variant="outline" className="font-mono text-[10px] text-muted-foreground bg-muted/30 py-0 px-1 font-medium">
            {row.original.code}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'Phone Number',
      cell: ({ row }) => <span className="text-muted-foreground font-mono text-[11px]">{row.original.phone || '—'}</span>,
    },
    {
      accessorKey: 'current_rate_paise',
      header: 'Current Rate',
      align: 'right',
      cell: ({ row }) => (
        <span className="font-mono font-semibold text-foreground tabular-nums">
          ₹{(parseInt(row.original.current_rate_paise || '0', 10) / 100).toFixed(2)} <span className="text-muted-foreground text-[10px] font-sans font-normal">/ 1K</span>
        </span>
      ),
    },
    {
      accessorKey: 'total_bricks_moulded',
      header: 'Total Bricks',
      align: 'right',
      cell: ({ row }) => (
        <span className="font-mono font-medium text-foreground tabular-nums">
          {parseInt(row.original.total_bricks_moulded || '0', 10).toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: 'payable_balance_paise',
      header: 'Pending Due',
      align: 'right',
      cell: ({ row }) => {
        const val = parseInt(row.original.payable_balance_paise || '0', 10) / 100;
        return (
          <span className={`font-mono font-bold tabular-nums ${val > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-muted-foreground'}`}>
            ₹{val.toFixed(2)}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      align: 'center',
      cell: ({ row }) => (
        <Link href={`/workers/${row.original.id}`}>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-[11px] gap-1 cursor-pointer"
          >
            <Eye className="h-3.5 w-3.5" /> Details
          </Button>
        </Link>
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
      accessorKey: 'worker_name',
      header: 'Worker',
      cell: ({ row }) => (
        <span className="font-medium text-foreground">
          {row.original.worker_name} <span className="text-muted-foreground text-[11px] font-mono">({row.original.worker_code})</span>
        </span>
      ),
    },
    {
      accessorKey: 'period_start_date',
      header: 'Period',
      cell: ({ row }) => (
        <span className="text-muted-foreground font-mono text-[11px]">
          {row.original.period_start_date} → {row.original.period_end_date}
        </span>
      ),
    },
    {
      accessorKey: 'net_payable_paise',
      header: 'Net Payable',
      align: 'right',
      cell: ({ row }) => (
        <span className="font-mono font-bold text-foreground tabular-nums">
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
            className="h-7 text-[11px] bg-emerald-700 hover:bg-emerald-800 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700 font-bold"
          >
            Approve
          </Button>
        ) : null,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header with clear action hierarchy */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Users className="h-6 w-6 text-primary shrink-0" /> Workers & Wage Ledger
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Worker roster, rate history, wage advances, and weekly settlement generation
          </p>
        </div>

        {/* Action Buttons: Primary (Kiln Ember) vs Secondary Outline */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="secondary"
            onClick={() => setShowSettlementModal(true)}
          >
            <FileCheck className="h-4 w-4" /> Weekly Settlement
          </Button>
          <Button
            variant="default"
            onClick={() => setShowAddWorker(true)}
          >
            <Plus className="h-4 w-4" /> Register Worker
          </Button>
        </div>
      </div>

      {/* Content */}
      <DataTable
        columns={workerColumns}
        data={workers}
        searchPlaceholder="Search worker by name or code..."
        showExport={false}
      />

      {/* Modal: Add Worker */}
      {showAddWorker && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 space-y-4 shadow-md">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">Register New Worker</h3>
              <button
                onClick={() => setShowAddWorker(false)}
                className="text-muted-foreground hover:text-foreground rounded p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateWorker} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Worker Code</label>
                <Input
                  value={newWorkerCode}
                  onChange={(e) => setNewWorkerCode(e.target.value)}
                  placeholder="e.g. WRK-001"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Full Name</label>
                <Input
                  value={newWorkerName}
                  onChange={(e) => setNewWorkerName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Phone Number</label>
                <Input
                  value={newWorkerPhone}
                  onChange={(e) => setNewWorkerPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Initial Rate per 1,000 Bricks (₹)</label>
                <Input
                  type="number"
                  step="1"
                  value={newWorkerRate}
                  onChange={(e) => setNewWorkerRate(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowAddWorker(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="default">
                  Save Worker
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Weekly Settlement Generator */}
      {showSettlementModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl max-w-xl w-full p-6 space-y-4 shadow-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">Generate Weekly Settlement</h3>
              <button
                onClick={() => setShowSettlementModal(false)}
                className="text-muted-foreground hover:text-foreground rounded p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleFetchUnsettled} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Select Worker</label>
                <select
                  value={settleWorkerId}
                  onChange={(e) => setSettleWorkerId(e.target.value)}
                  required
                  className="w-full rounded-sm border border-border bg-card px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">-- Choose Worker --</option>
                  {workers.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.full_name} ({w.code})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Start Date</label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">End Date</label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button type="submit" variant="secondary" className="w-full">
                Calculate Unsettled Work
              </Button>
            </form>

            {unsettledData && (
              <div className="space-y-3 pt-3 border-t border-border">
                <div className="flex justify-between text-xs font-mono font-bold bg-muted/40 p-3 rounded-md border border-border">
                  <span>Total Bricks: {unsettledData.total_bricks.toLocaleString()}</span>
                  <span>Gross Earned: ₹{(parseInt(unsettledData.gross_amount_paise, 10) / 100).toFixed(2)}</span>
                </div>
                <Button
                  onClick={handleGenerateSettlement}
                  disabled={settleSubmitting || unsettledData.total_bricks === 0}
                  className="w-full"
                >
                  {settleSubmitting ? 'Generating...' : 'Confirm & Generate Draft Settlement'}
                </Button>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => setShowSettlementModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Worker Detail */}
      {selectedWorkerId && workerDetail && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl max-w-2xl w-full p-6 space-y-4 shadow-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-foreground">{workerDetail.full_name}</h3>
                <p className="text-xs text-muted-foreground font-mono">{workerDetail.code} • Joined: {workerDetail.joining_date}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setSelectedWorkerId(null); setWorkerDetail(null); }}
              >
                Close
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-muted/30 rounded-md border border-border">
                <span className="text-[10px] text-muted-foreground uppercase font-bold block">Current Rate</span>
                <span className="text-sm font-bold font-mono text-foreground">₹{(parseInt(workerDetail.current_rate_paise || '0', 10) / 100).toFixed(2)}</span>
              </div>
              <div className="p-3 bg-muted/30 rounded-md border border-border">
                <span className="text-[10px] text-muted-foreground uppercase font-bold block">Total Bricks</span>
                <span className="text-sm font-bold font-mono text-foreground">{parseInt(workerDetail.total_bricks_moulded || '0', 10).toLocaleString()}</span>
              </div>
              <div className="p-3 bg-muted/30 rounded-md border border-border">
                <span className="text-[10px] text-muted-foreground uppercase font-bold block">Pending Balance</span>
                <span className="text-sm font-bold font-mono text-amber-700 dark:text-amber-400">₹{(parseInt(workerDetail.payable_balance_paise || '0', 10) / 100).toFixed(2)}</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">Rate History</h4>
              <ul className="divide-y divide-border text-xs border border-border rounded-md bg-card">
                {workerDetail.rate_history?.map((rh: any) => (
                  <li key={rh.id} className="p-2.5 flex justify-between items-center">
                    <span className="text-muted-foreground font-mono">Effective {rh.effective_date}</span>
                    <span className="font-mono font-bold text-foreground">₹{(parseInt(rh.rate_per_1000_paise, 10) / 100).toFixed(2)} / 1,000</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
