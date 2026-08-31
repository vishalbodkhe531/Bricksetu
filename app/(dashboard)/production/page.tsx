'use client';

import React, { useState, useEffect } from 'react';
import { Factory, Plus, Flame, ArrowRight, Layers, Eye, CheckCircle2 } from 'lucide-react';
import {
  getBatchesAction,
  createBatchAction,
  getBatchDetailAction,
  recordMouldingLogAction,
  transitionStageAction,
} from '@/features/production/actions';
import { getMasterDataAction } from '@/features/settings/actions';
import { getWorkersAction } from '@/features/workers/actions';
import { DataTable } from '@/components/ui/data-table/data-table';
import { toast } from 'sonner';

export default function ProductionPage() {
  const [batches, setBatches] = useState<any[]>([]);
  const [brickTypes, setBrickTypes] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddBatch, setShowAddBatch] = useState(false);
  const [showLogMoulding, setShowLogMoulding] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [batchDetail, setBatchDetail] = useState<any | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [bRes, mRes, wRes] = await Promise.all([
      getBatchesAction(),
      getMasterDataAction(),
      getWorkersAction(),
    ]);
    if (bRes.success) setBatches(bRes.data || []);
    if (mRes.success) setBrickTypes(mRes.data?.brick_types || []);
    if (wRes.success) setWorkers(wRes.data || []);
    setLoading(false);
  }

  const handleCreateBatch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const res = await createBatchAction(formData);
    if (res.success) {
      toast.success('Kiln Batch initialized');
      setShowAddBatch(false);
      loadData();
    } else {
      toast.error(res.error || 'Failed to create batch');
    }
  };

  const handleRecordMoulding = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const res = await recordMouldingLogAction(formData);
    if (res.success) {
      toast.success('Daily moulding output recorded!');
      setShowLogMoulding(false);
      loadData();
    } else {
      toast.error(res.error || 'Failed to record moulding log');
    }
  };

  const handleViewBatch = async (id: string) => {
    setSelectedBatchId(id);
    const res = await getBatchDetailAction(id);
    if (res.success) {
      setBatchDetail(res.data);
    } else {
      toast.error(res.error || 'Failed to load batch details');
    }
  };

  const batchColumns: any[] = [
    {
      accessorKey: 'batch_number',
      header: 'Batch Number',
      cell: ({ row }: any) => (
        <div>
          <div className="font-mono font-bold text-foreground">{row.original.batch_number}</div>
          <div className="text-[11px] text-muted-foreground">{row.original.brick_type_name}</div>
        </div>
      ),
    },
    {
      accessorKey: 'stage',
      header: 'Current Stage',
      cell: ({ row }: any) => {
        const stage = row.original.stage;
        return (
          <span
            className={`rounded px-2.5 py-1 text-[11px] font-bold ${
              stage === 'MOULDING'
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                : stage === 'SETTING'
                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                : stage === 'FIRING'
                ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
                : stage === 'UNLOADED'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {stage}
          </span>
        );
      },
    },
    {
      accessorKey: 'moulded_quantity',
      header: 'Moulded Qty',
      cell: ({ row }: any) => (
        <span className="font-semibold text-foreground">
          {parseInt(row.original.moulded_quantity || '0', 10).toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: 'fired_good_quantity',
      header: 'Fired Good Qty',
      cell: ({ row }: any) => (
        <span className="font-bold text-emerald-600 dark:text-emerald-400">
          {parseInt(row.original.fired_good_quantity || '0', 10).toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: 'start_date',
      header: 'Start Date',
      cell: ({ row }: any) => <span className="text-muted-foreground">{row.original.start_date}</span>,
    },
    {
      id: 'actions',
      header: 'Action',
      cell: ({ row }: any) => (
        <button
          onClick={() => handleViewBatch(row.original.id)}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-border bg-card text-xs font-semibold hover:bg-accent"
        >
          <Eye className="h-3.5 w-3.5" /> Details
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Factory className="h-6 w-6 text-primary" /> Production & Kiln Batches
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Track batch lifecycle (Moulding → Setting → Firing → Sorting → Unloaded) and detailed batch unit costing
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLogMoulding(true)}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3.5 py-2 text-xs font-bold text-foreground hover:bg-accent shadow-xs"
          >
            <Layers className="h-4 w-4" /> Log Moulding Output
          </button>
          <button
            onClick={() => setShowAddBatch(true)}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 shadow-xs"
          >
            <Plus className="h-4 w-4" /> Initialize Batch
          </button>
        </div>
      </div>

      {/* Batches Table */}
      <DataTable columns={batchColumns} data={batches} searchPlaceholder="Search production batches..." exportFileName="production_batches.csv" />

      {/* Modal: Initialize Batch */}
      {showAddBatch && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-foreground">Initialize New Kiln Batch</h3>
            <form onSubmit={handleCreateBatch} className="space-y-3">
              <input name="batch_number" placeholder="Batch Number (e.g. BATCH-2026-01)" required className="w-full rounded border border-border bg-card px-3 py-2 text-xs" />
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground">Brick Type</label>
                <select name="brick_type_id" required className="w-full rounded border border-border bg-card px-3 py-2 text-xs">
                  <option value="">-- Select Brick Type --</option>
                  {brickTypes.map((bt) => (
                    <option key={bt.id} value={bt.id}>{bt.name} ({bt.code})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground">Target Production Qty</label>
                <input name="target_quantity" type="number" placeholder="e.g. 100000" defaultValue="100000" className="w-full rounded border border-border bg-card px-3 py-2 text-xs" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground">Batch Start Date</label>
                <input name="start_date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required className="w-full rounded border border-border bg-card px-3 py-2 text-xs" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddBatch(false)} className="px-3 py-1.5 text-xs border rounded">Cancel</button>
                <button type="submit" className="px-4 py-1.5 text-xs font-bold bg-primary text-primary-foreground rounded">Save Batch</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Log Moulding */}
      {showLogMoulding && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-foreground">Record Daily Moulding Output</h3>
            <form onSubmit={handleRecordMoulding} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground">Select Active Batch</label>
                <select name="batch_id" required className="w-full rounded border border-border bg-card px-3 py-2 text-xs">
                  <option value="">-- Choose Batch --</option>
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>{b.batch_number} ({b.brick_type_name})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground">Select Moulding Worker</label>
                <select name="worker_id" required className="w-full rounded border border-border bg-card px-3 py-2 text-xs">
                  <option value="">-- Choose Worker --</option>
                  {workers.map((w) => (
                    <option key={w.id} value={w.id}>{w.full_name} ({w.code})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground">Work Date</label>
                <input name="work_date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required className="w-full rounded border border-border bg-card px-3 py-2 text-xs" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground">Bricks Moulded</label>
                <input name="bricks_moulded" type="number" placeholder="e.g. 1500" required className="w-full rounded border border-border bg-card px-3 py-2 text-xs" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowLogMoulding(false)} className="px-3 py-1.5 text-xs border rounded">Cancel</button>
                <button type="submit" className="px-4 py-1.5 text-xs font-bold bg-primary text-primary-foreground rounded">Record Output</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Batch Detail Drawer & Costing Breakdown */}
      {selectedBatchId && batchDetail && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl max-w-3xl w-full p-6 space-y-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-foreground">Batch {batchDetail.batch_number}</h3>
                <p className="text-xs text-muted-foreground">Type: {batchDetail.brick_type_name} • Current Stage: <span className="font-bold text-primary">{batchDetail.stage}</span></p>
              </div>
              <button onClick={() => { setSelectedBatchId(null); setBatchDetail(null); }} className="text-xs border px-3 py-1 rounded">Close</button>
            </div>

            {/* Cost Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-muted/30 rounded border border-border">
                <span className="text-[10px] text-muted-foreground uppercase font-bold block">Moulding Labor</span>
                <span className="text-sm font-bold text-foreground">₹{(parseInt(batchDetail.cost_breakdown?.moulding_cost_paise || '0', 10) / 100).toFixed(2)}</span>
              </div>
              <div className="p-3 bg-muted/30 rounded border border-border">
                <span className="text-[10px] text-muted-foreground uppercase font-bold block">Materials (Coal/Clay)</span>
                <span className="text-sm font-bold text-foreground">₹{(parseInt(batchDetail.cost_breakdown?.material_cost_paise || '0', 10) / 100).toFixed(2)}</span>
              </div>
              <div className="p-3 bg-muted/30 rounded border border-border">
                <span className="text-[10px] text-muted-foreground uppercase font-bold block">Total Batch Cost</span>
                <span className="text-sm font-bold text-primary">₹{(parseInt(batchDetail.cost_breakdown?.total_cost_paise || '0', 10) / 100).toFixed(2)}</span>
              </div>
              <div className="p-3 bg-muted/30 rounded border border-border">
                <span className="text-[10px] text-muted-foreground uppercase font-bold block">Cost / 1,000 Bricks</span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {batchDetail.cost_breakdown?.cost_per_1000_paise ? `₹${(parseInt(batchDetail.cost_breakdown.cost_per_1000_paise, 10) / 100).toFixed(2)}` : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
