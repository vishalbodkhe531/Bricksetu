'use client';

import React, { useState, useEffect } from 'react';
import { Boxes, Sliders, History, Plus, AlertCircle } from 'lucide-react';
import {
  getStockSummaryAction,
  getStockLotsAction,
  getStockLedgerAction,
  postStockAdjustmentAction,
} from '@/features/inventory/actions';
import { DataTable } from '@/components/ui/data-table/data-table';
import { toast } from 'sonner';

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<'matrix' | 'lots' | 'ledger'>('matrix');
  const [summary, setSummary] = useState<any[]>([]);
  const [lots, setLots] = useState<any[]>([]);
  const [ledger, setLedger] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [showAdjustment, setShowAdjustment] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [sRes, lRes, lgRes] = await Promise.all([
      getStockSummaryAction(),
      getStockLotsAction(),
      getStockLedgerAction(),
    ]);
    if (sRes.success) setSummary(sRes.data || []);
    if (lRes.success) setLots(lRes.data || []);
    if (lgRes.success) setLedger(lgRes.data || []);
    setLoading(false);
  }

  const handlePostAdjustment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const res = await postStockAdjustmentAction(formData);
    if (res.success) {
      toast.success('Stock adjustment posted successfully!');
      setShowAdjustment(false);
      loadData();
    } else {
      toast.error(res.error || 'Failed to post adjustment');
    }
  };

  const summaryColumns: any[] = [
    {
      accessorKey: 'brick_type_name',
      header: 'Brick Type',
      cell: ({ row }: any) => (
        <div>
          <div className="font-bold text-foreground">{row.original.brick_type_name}</div>
          <div className="text-[11px] text-muted-foreground font-mono">{row.original.brick_type_code}</div>
        </div>
      ),
    },
    {
      accessorKey: 'brick_grade_name',
      header: 'Brick Grade',
      cell: ({ row }: any) => (
        <span className="font-semibold text-primary">{row.original.brick_grade_name}</span>
      ),
    },
    {
      accessorKey: 'total_available_quantity',
      header: 'Available Qty (Bricks)',
      cell: ({ row }: any) => (
        <span className="font-bold text-base text-foreground">
          {parseInt(row.original.total_available_quantity || '0', 10).toLocaleString()}
        </span>
      ),
    },
  ];

  const lotColumns: any[] = [
    {
      accessorKey: 'lot_number',
      header: 'Lot Number',
      cell: ({ row }: any) => <span className="font-mono font-bold text-foreground">{row.original.lot_number}</span>,
    },
    {
      accessorKey: 'batch_number',
      header: 'Source Batch',
      cell: ({ row }: any) => <span className="font-mono text-muted-foreground">{row.original.batch_number || 'Opening Balance'}</span>,
    },
    {
      accessorKey: 'brick_type_name',
      header: 'Type & Grade',
      cell: ({ row }: any) => (
        <span>
          {row.original.brick_type_name} • <strong className="text-primary">{row.original.brick_grade_name}</strong>
        </span>
      ),
    },
    {
      accessorKey: 'available_quantity',
      header: 'Available Stock',
      cell: ({ row }: any) => (
        <span className="font-bold text-foreground">
          {parseInt(row.original.available_quantity || '0', 10).toLocaleString()}
        </span>
      ),
    },
  ];

  const ledgerColumns: any[] = [
    {
      accessorKey: 'created_at',
      header: 'Timestamp',
      cell: ({ row }: any) => <span className="text-muted-foreground text-xs">{new Date(row.original.created_at).toLocaleString()}</span>,
    },
    {
      accessorKey: 'entry_type',
      header: 'Entry Type',
      cell: ({ row }: any) => {
        const type = row.original.entry_type;
        return (
          <span
            className={`rounded px-2 py-0.5 text-[10px] font-bold ${
              type.includes('IN') || type.includes('UNLOAD')
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'bg-destructive/10 text-destructive'
            }`}
          >
            {type}
          </span>
        );
      },
    },
    {
      accessorKey: 'brick_type_name',
      header: 'Item',
      cell: ({ row }: any) => (
        <span>
          {row.original.brick_type_name} ({row.original.brick_grade_name || 'N/A'})
        </span>
      ),
    },
    {
      accessorKey: 'quantity_change',
      header: 'Qty Change',
      cell: ({ row }: any) => {
        const change = parseInt(row.original.quantity_change || '0', 10);
        return (
          <span className={`font-bold ${change > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}`}>
            {change > 0 ? `+${change.toLocaleString()}` : change.toLocaleString()}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Boxes className="h-6 w-6 text-primary" /> Finished Stock & Inventory
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Real-time finished brick inventory by Type & Grade, FIFO lot breakdown, and audit ledger
          </p>
        </div>
        <button
          onClick={() => setShowAdjustment(true)}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 shadow-xs"
        >
          <Sliders className="h-4 w-4" /> Stock Adjustment
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border gap-2">
        <button
          onClick={() => setActiveTab('matrix')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'matrix'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Stock Matrix ({summary.length})
        </button>
        <button
          onClick={() => setActiveTab('lots')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'lots'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Finished Stock Lots ({lots.length})
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'ledger'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Stock Audit Ledger ({ledger.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'matrix' && (
        <DataTable columns={summaryColumns} data={summary} searchPlaceholder="Search inventory summary..." exportFileName="stock_summary.csv" />
      )}
      {activeTab === 'lots' && (
        <DataTable columns={lotColumns} data={lots} searchPlaceholder="Search stock lots..." exportFileName="stock_lots.csv" />
      )}
      {activeTab === 'ledger' && (
        <DataTable columns={ledgerColumns} data={ledger} searchPlaceholder="Search stock audit ledger..." exportFileName="stock_ledger.csv" />
      )}

      {/* Modal: Manual Stock Adjustment */}
      {showAdjustment && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-foreground">Post Manual Stock Adjustment</h3>
            <form onSubmit={handlePostAdjustment} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground">Finished Stock Lot</label>
                <select name="finished_lot_id" required className="w-full rounded border border-border bg-card px-3 py-2 text-xs">
                  <option value="">-- Select Stock Lot --</option>
                  {lots.map((l) => (
                    <option key={l.id} value={l.id}>{l.lot_number} — {l.brick_type_name} ({l.brick_grade_name}) [Avail: {l.available_quantity}]</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground">Adjustment Type</label>
                <select name="adjustment_type" required className="w-full rounded border border-border bg-card px-3 py-2 text-xs">
                  <option value="BREAKAGE">BREAKAGE (Damage / Loss)</option>
                  <option value="AUDIT_CORRECTION">AUDIT CORRECTION</option>
                  <option value="RETURN">CUSTOMER RETURN</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground">Qty Change (+/-)</label>
                  <input name="quantity_change" type="number" placeholder="e.g. -500" required className="w-full rounded border border-border bg-card px-3 py-2 text-xs" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground">Date</label>
                  <input name="adjustment_date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required className="w-full rounded border border-border bg-card px-3 py-2 text-xs" />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground">Reason / Audit Note</label>
                <input name="reason" placeholder="e.g. Broken during stack move" required className="w-full rounded border border-border bg-card px-3 py-2 text-xs" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAdjustment(false)} className="px-3 py-1.5 text-xs border rounded">Cancel</button>
                <button type="submit" className="px-4 py-1.5 text-xs font-bold bg-primary text-primary-foreground rounded">Post Adjustment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
