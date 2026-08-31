'use client';

import React, { useState, useEffect } from 'react';
import { Users, Plus, IndianRupee, FileCheck, AlertCircle, Eye, Calendar, DollarSign } from 'lucide-react';
import {
  getWorkersAction,
  createWorkerAction,
  getWorkerDetailAction,
  addWorkerRateAction,
  getSettlementsAction,
  getUnsettledWorkAction,
  generateSettlementAction,
  approveSettlementAction,
  voidSettlementAction,
} from '@/features/workers/actions';
import { DataTable } from '@/components/ui/data-table/data-table';
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

  // Table Columns
  const workerColumns: any[] = [
    {
      accessorKey: 'full_name',
      header: 'Worker Name',
      cell: ({ row }: any) => (
        <div>
          <div className="font-bold text-foreground">{row.original.full_name}</div>
          <div className="text-[11px] text-muted-foreground font-mono">{row.original.code}</div>
        </div>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'Phone Number',
      cell: ({ row }: any) => <span className="text-muted-foreground">{row.original.phone || '—'}</span>,
    },
    {
      accessorKey: 'current_rate_paise',
      header: 'Current Rate',
      cell: ({ row }: any) => (
        <span className="font-semibold text-foreground">
          ₹{(parseInt(row.original.current_rate_paise || '0', 10) / 100).toFixed(2)} / 1K
        </span>
      ),
    },
    {
      accessorKey: 'total_bricks_moulded',
      header: 'Total Bricks',
      cell: ({ row }: any) => (
        <span className="font-medium text-foreground">
          {parseInt(row.original.total_bricks_moulded || '0', 10).toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: 'payable_balance_paise',
      header: 'Pending Due',
      cell: ({ row }: any) => {
        const val = parseInt(row.original.payable_balance_paise || '0', 10) / 100;
        return (
          <span className={`font-bold ${val > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'}`}>
            ₹{val.toFixed(2)}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => (
        <button
          onClick={() => handleViewWorkerDetail(row.original.id)}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-border bg-card text-xs font-semibold text-foreground hover:bg-accent"
        >
          <Eye className="h-3.5 w-3.5" /> Details
        </button>
      ),
    },
  ];

  const settlementColumns: any[] = [
    {
      accessorKey: 'settlement_number',
      header: 'Settlement #',
      cell: ({ row }: any) => <span className="font-mono font-bold text-foreground">{row.original.settlement_number}</span>,
    },
    {
      accessorKey: 'worker_name',
      header: 'Worker',
      cell: ({ row }: any) => <span>{row.original.worker_name} ({row.original.worker_code})</span>,
    },
    {
      accessorKey: 'period_start_date',
      header: 'Period',
      cell: ({ row }: any) => (
        <span className="text-muted-foreground">
          {row.original.period_start_date} to {row.original.period_end_date}
        </span>
      ),
    },
    {
      accessorKey: 'net_payable_paise',
      header: 'Net Payable',
      cell: ({ row }: any) => (
        <span className="font-bold text-foreground">
          ₹{(parseInt(row.original.net_payable_paise || '0', 10) / 100).toFixed(2)}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => {
        const s = row.original.status;
        return (
          <span
            className={`rounded px-2 py-0.5 text-[10px] font-bold ${
              s === 'APPROVED'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : s === 'DRAFT'
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {s}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: 'Action',
      cell: ({ row }: any) =>
        row.original.status === 'DRAFT' ? (
          <button
            onClick={() => handleApproveSettlement(row.original.id)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700"
          >
            Approve
          </button>
        ) : null,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" /> Workers & Weekly Wage Settlements
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Worker roster, rate per 1,000 history, wage advances, and automated weekly settlement generation
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettlementModal(true)}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3.5 py-2 text-xs font-bold text-foreground hover:bg-accent shadow-xs"
          >
            <FileCheck className="h-4 w-4" /> Weekly Settlement
          </button>
          <button
            onClick={() => setShowAddWorker(true)}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 shadow-xs"
          >
            <Plus className="h-4 w-4" /> Register Worker
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border gap-2">
        <button
          onClick={() => setActiveTab('workers')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'workers'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Worker Roster ({workers.length})
        </button>
        <button
          onClick={() => setActiveTab('settlements')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'settlements'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Weekly Settlements ({settlements.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'workers' ? (
        <DataTable columns={workerColumns} data={workers} searchPlaceholder="Search worker by name or code..." exportFileName="workers.csv" />
      ) : (
        <DataTable columns={settlementColumns} data={settlements} searchPlaceholder="Search settlements..." exportFileName="settlements.csv" />
      )}

      {/* Modal: Add Worker */}
      {showAddWorker && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-foreground">Register New Worker</h3>
            <form onSubmit={handleCreateWorker} className="space-y-3">
              <input value={newWorkerCode} onChange={(e) => setNewWorkerCode(e.target.value)} placeholder="Worker Code (e.g. WRK-001)" required className="w-full rounded border border-border bg-card px-3 py-2 text-xs" />
              <input value={newWorkerName} onChange={(e) => setNewWorkerName(e.target.value)} placeholder="Full Name" required className="w-full rounded border border-border bg-card px-3 py-2 text-xs" />
              <input value={newWorkerPhone} onChange={(e) => setNewWorkerPhone(e.target.value)} placeholder="Phone Number (optional)" className="w-full rounded border border-border bg-card px-3 py-2 text-xs" />
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">Initial Rate per 1,000 Bricks (₹)</label>
                <input type="number" step="1" value={newWorkerRate} onChange={(e) => setNewWorkerRate(e.target.value)} required className="w-full rounded border border-border bg-card px-3 py-2 text-xs" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddWorker(false)} className="px-3 py-1.5 text-xs border rounded">Cancel</button>
                <button type="submit" className="px-4 py-1.5 text-xs font-bold bg-primary text-primary-foreground rounded">Save Worker</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Weekly Settlement Generator */}
      {showSettlementModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl max-w-xl w-full p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-foreground">Generate Weekly Settlement</h3>
            <form onSubmit={handleFetchUnsettled} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Select Worker</label>
                <select value={settleWorkerId} onChange={(e) => setSettleWorkerId(e.target.value)} required className="w-full rounded border border-border bg-card px-3 py-2 text-xs">
                  <option value="">-- Choose Worker --</option>
                  {workers.map((w) => (
                    <option key={w.id} value={w.id}>{w.full_name} ({w.code})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Start Date</label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required className="w-full rounded border border-border bg-card px-3 py-2 text-xs" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">End Date</label>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required className="w-full rounded border border-border bg-card px-3 py-2 text-xs" />
                </div>
              </div>
              <button type="submit" className="w-full bg-secondary text-secondary-foreground py-2 rounded text-xs font-bold">
                Calculate Unsettled Work
              </button>
            </form>

            {unsettledData && (
              <div className="space-y-3 pt-3 border-t border-border">
                <div className="flex justify-between text-xs font-bold">
                  <span>Total Bricks Moulded: {unsettledData.total_bricks.toLocaleString()}</span>
                  <span>Gross Earned: ₹{(parseInt(unsettledData.gross_amount_paise, 10) / 100).toFixed(2)}</span>
                </div>
                <button
                  onClick={handleGenerateSettlement}
                  disabled={settleSubmitting || unsettledData.total_bricks === 0}
                  className="w-full bg-primary text-primary-foreground py-2.5 rounded text-xs font-bold disabled:opacity-50"
                >
                  {settleSubmitting ? 'Generating...' : 'Confirm & Generate Draft Settlement'}
                </button>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button onClick={() => setShowSettlementModal(false)} className="px-4 py-1.5 text-xs border rounded">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Worker Detail */}
      {selectedWorkerId && workerDetail && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl max-w-2xl w-full p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-foreground">{workerDetail.full_name}</h3>
                <p className="text-xs text-muted-foreground font-mono">{workerDetail.code} • Joined: {workerDetail.joining_date}</p>
              </div>
              <button onClick={() => { setSelectedWorkerId(null); setWorkerDetail(null); }} className="text-xs border px-3 py-1 rounded">Close</button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-muted/30 rounded border border-border">
                <span className="text-[10px] text-muted-foreground uppercase font-bold block">Current Rate</span>
                <span className="text-sm font-bold text-foreground">₹{(parseInt(workerDetail.current_rate_paise || '0', 10) / 100).toFixed(2)}</span>
              </div>
              <div className="p-3 bg-muted/30 rounded border border-border">
                <span className="text-[10px] text-muted-foreground uppercase font-bold block">Total Bricks</span>
                <span className="text-sm font-bold text-foreground">{parseInt(workerDetail.total_bricks_moulded || '0', 10).toLocaleString()}</span>
              </div>
              <div className="p-3 bg-muted/30 rounded border border-border">
                <span className="text-[10px] text-muted-foreground uppercase font-bold block">Pending Balance</span>
                <span className="text-sm font-bold text-amber-600 dark:text-amber-400">₹{(parseInt(workerDetail.payable_balance_paise || '0', 10) / 100).toFixed(2)}</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-foreground uppercase mb-2">Rate History</h4>
              <ul className="divide-y divide-border text-xs">
                {workerDetail.rate_history?.map((rh: any) => (
                  <li key={rh.id} className="py-1.5 flex justify-between">
                    <span>Effective {rh.effective_date}</span>
                    <span className="font-bold">₹{(parseInt(rh.rate_per_1000_paise, 10) / 100).toFixed(2)} / 1,000</span>
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
