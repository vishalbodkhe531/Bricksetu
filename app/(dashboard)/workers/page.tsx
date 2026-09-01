'use client';

import React, { useState } from 'react';
import { Users, Plus, FileCheck, X } from 'lucide-react';
import {
  useWorkers,
  useCreateWorker,
  useDeleteWorker,
  useRecordAdvance,
  useCreateSettlement,
  useSettlements,
} from '@/features/workers/hooks/useWorkers';
import { useAuth } from '@/context/AuthContext';
import { DataTable, Column } from '@/components/ui/data-table/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import type { Worker } from '@/features/workers/types/worker.types';

export default function WorkersPage() {
  const { profile } = useAuth();
  const orgId = profile?.organization_id ?? '';

  const { data: workers = [], isLoading: loadingWorkers } = useWorkers(orgId);
  const { data: settlements = [], isLoading: loadingSettlements } = useSettlements(orgId);
  const createWorker = useCreateWorker(orgId);
  const deleteWorker = useDeleteWorker(orgId);
  const recordAdvance = useRecordAdvance(orgId, '');

  const [activeTab, setActiveTab] = useState<'workers' | 'settlements'>('workers');
  const [showAddWorker, setShowAddWorker] = useState(false);
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('');

  // New Worker Form
  const [newWorkerName, setNewWorkerName] = useState('');
  const [newWorkerPhone, setNewWorkerPhone] = useState('');
  const [newWorkerCategory, setNewWorkerCategory] = useState('');
  const [newWorkerJoiningDate, setNewWorkerJoiningDate] = useState('');

  // Advance Form
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [advanceDateGiven, setAdvanceDateGiven] = useState(new Date().toISOString().split('T')[0]);
  const [advanceReason, setAdvanceReason] = useState('');

  const isLoading = loadingWorkers || loadingSettlements;
  const canWrite = profile?.role && ['owner', 'manager'].includes(profile.role);

  const handleCreateWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    createWorker.mutate(
      {
        full_name: newWorkerName,
        phone: newWorkerPhone || null,
        category: newWorkerCategory || null,
        joining_date: newWorkerJoiningDate || null,
        status: 'active',
      },
      {
        onSuccess: () => {
          toast.success('Worker registered successfully');
          setShowAddWorker(false);
          setNewWorkerName('');
          setNewWorkerPhone('');
          setNewWorkerCategory('');
          setNewWorkerJoiningDate('');
        },
        onError: (err: Error) => {
          toast.error(err.message || 'Failed to create worker');
        },
      }
    );
  };

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
          toast.success('Advance recorded successfully');
          setShowAdvanceModal(false);
          setSelectedWorkerId('');
          setAdvanceAmount('');
          setAdvanceReason('');
        },
        onError: (err: Error) => {
          toast.error(err.message || 'Failed to record advance');
        },
      }
    );
  };

  const workerColumns: Column<Worker>[] = [
    {
      accessorKey: 'full_name',
      header: 'Worker Name',
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <div className="font-semibold text-foreground">{row.original.full_name}</div>
          {row.original.category && (
            <Badge variant="outline" className="font-mono text-[10px] text-muted-foreground bg-muted/30 py-0 px-1">
              {row.original.category}
            </Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }) => (
        <span className="text-muted-foreground font-mono text-[11px]">{row.original.phone || '—'}</span>
      ),
    },
    {
      accessorKey: 'joining_date',
      header: 'Joining Date',
      cell: ({ row }) => (
        <span className="text-muted-foreground text-xs">{row.original.joining_date || '—'}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      align: 'center',
      cell: ({ row }) => (
        <Badge variant={row.original.status === 'active' ? 'success' : 'secondary'}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      align: 'center',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 justify-center">
          {canWrite && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-[11px] gap-1 cursor-pointer"
              onClick={() => {
                setSelectedWorkerId(row.original.id);
                setShowAdvanceModal(true);
              }}
            >
              Record Advance
            </Button>
          )}
          {profile?.role === 'owner' && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-[11px] text-destructive hover:text-destructive"
              onClick={() => {
                if (confirm(`Deactivate ${row.original.full_name}?`)) {
                  deleteWorker.mutate(row.original.id, {
                    onSuccess: () => toast.success('Worker deactivated'),
                    onError: (err: Error) => toast.error(err.message),
                  });
                }
              }}
            >
              Deactivate
            </Button>
          )}
        </div>
      ),
    },
  ];

  const settlementColumns: Column<any>[] = [
    {
      accessorKey: 'worker_id',
      header: 'Worker',
      cell: ({ row }) => (
        <span className="font-medium text-foreground">
          {row.original.workers?.full_name ?? row.original.worker_id}
        </span>
      ),
    },
    {
      accessorKey: 'period_start',
      header: 'Period',
      cell: ({ row }) => (
        <span className="text-muted-foreground font-mono text-[11px]">
          {row.original.period_start} → {row.original.period_end}
        </span>
      ),
    },
    {
      accessorKey: 'gross_wage',
      header: 'Gross Wage',
      align: 'right',
      cell: ({ row }) => (
        <span className="font-mono font-semibold">₹{Number(row.original.gross_wage).toFixed(2)}</span>
      ),
    },
    {
      accessorKey: 'advances_deducted',
      header: 'Advances',
      align: 'right',
      cell: ({ row }) => (
        <span className="font-mono text-amber-600">₹{Number(row.original.advances_deducted).toFixed(2)}</span>
      ),
    },
    {
      accessorKey: 'net_payable',
      header: 'Net Payable',
      align: 'right',
      cell: ({ row }) => (
        <span className="font-mono font-bold text-emerald-600">₹{Number(row.original.net_payable).toFixed(2)}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      align: 'center',
      cell: ({ row }) => (
        <Badge variant={row.original.status === 'paid' ? 'success' : 'warning'}>
          {row.original.status}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Users className="h-6 w-6 text-primary shrink-0" /> Workers & Wage Ledger
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Worker roster, wage rates, advances, and settlements
          </p>
        </div>

        {canWrite && (
          <div className="flex items-center gap-2.5 shrink-0">
            <Button variant="default" onClick={() => setShowAddWorker(true)}>
              <Plus className="h-4 w-4" /> Register Worker
            </Button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {(['workers', 'settlements'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'workers' ? 'Workers' : 'Settlements'}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'workers' ? (
        <DataTable
          columns={workerColumns}
          data={workers}
          searchPlaceholder="Search worker by name or category..."
          showExport={false}
        />
      ) : (
        <DataTable
          columns={settlementColumns}
          data={settlements}
          searchPlaceholder="Search settlements..."
          showExport={false}
        />
      )}

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
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Full Name *
                </label>
                <Input
                  value={newWorkerName}
                  onChange={(e) => setNewWorkerName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Phone Number
                </label>
                <Input
                  value={newWorkerPhone}
                  onChange={(e) => setNewWorkerPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Category
                </label>
                <Input
                  value={newWorkerCategory}
                  onChange={(e) => setNewWorkerCategory(e.target.value)}
                  placeholder="e.g. moulder, fireman, loader"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Joining Date
                </label>
                <Input
                  type="date"
                  value={newWorkerJoiningDate}
                  onChange={(e) => setNewWorkerJoiningDate(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowAddWorker(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createWorker.isPending}>
                  {createWorker.isPending ? 'Saving...' : 'Save Worker'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Record Advance */}
      {showAdvanceModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 space-y-4 shadow-md">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">Record Advance Payment</h3>
              <button
                onClick={() => setShowAdvanceModal(false)}
                className="text-muted-foreground hover:text-foreground rounded p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleRecordAdvance} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Worker
                </label>
                <select
                  value={selectedWorkerId}
                  onChange={(e) => setSelectedWorkerId(e.target.value)}
                  required
                  className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">-- Choose Worker --</option>
                  {workers.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.full_name}
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
                  onChange={(e) => setAdvanceAmount(e.target.value)}
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
                  onChange={(e) => setAdvanceDateGiven(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Reason
                </label>
                <Input
                  value={advanceReason}
                  onChange={(e) => setAdvanceReason(e.target.value)}
                  placeholder="Optional reason for advance"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowAdvanceModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={recordAdvance.isPending}>
                  {recordAdvance.isPending ? 'Saving...' : 'Record Advance'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
