'use client';

import React, { useState } from 'react';
import { Factory, Plus, Eye, X } from 'lucide-react';
import {
  useProductionBatches,
  useBrickTypes,
  useCreateProductionBatch,
} from '@/features/production/hooks/useProduction';
import { useWorkers } from '@/features/workers/hooks/useWorkers';
import { useAuth } from '@/context/AuthContext';
import { DataTable, Column } from '@/components/ui/data-table/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import type { ProductionBatch } from '@/features/production/types/production.types';

export default function ProductionPage() {
  const { profile } = useAuth();
  const orgId = profile?.organization_id ?? '';

  const { data: batches = [], isLoading: loadingBatches } = useProductionBatches(orgId);
  const { data: brickTypes = [] } = useBrickTypes(orgId);
  const { data: workers = [] } = useWorkers(orgId);

  const createBatch = useCreateProductionBatch(orgId);

  // Modal state
  const [showAddBatch, setShowAddBatch] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<ProductionBatch | null>(null);

  // Form State
  const [brickTypeId, setBrickTypeId] = useState('');
  const [workerId, setWorkerId] = useState('');
  const [productionDate, setProductionDate] = useState(new Date().toISOString().split('T')[0]);
  const [bricksMoulded, setBricksMoulded] = useState('');
  const [notes, setNotes] = useState('');

  const canWrite = profile?.role && ['owner', 'manager'].includes(profile.role);

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    createBatch.mutate(
      {
        brick_type_id: brickTypeId,
        worker_id: workerId || null,
        production_date: productionDate,
        bricks_moulded: parseInt(bricksMoulded, 10),
        notes: notes || null,
      },
      {
        onSuccess: () => {
          toast.success('Production batch logged successfully');
          setShowAddBatch(false);
          setBrickTypeId('');
          setWorkerId('');
          setBricksMoulded('');
          setNotes('');
        },
        onError: (err: Error) => {
          toast.error(err.message || 'Failed to log production batch');
        },
      }
    );
  };

  const columns: Column<ProductionBatch>[] = [
    {
      accessorKey: 'production_date',
      header: 'Date',
      cell: ({ row }) => (
        <span className="text-muted-foreground font-mono text-[11px]">{row.original.production_date}</span>
      ),
    },
    {
      accessorKey: 'brick_type',
      header: 'Brick Type',
      cell: ({ row }) => (
        <div className="font-semibold text-foreground">
          {row.original.brick_type?.name ?? 'Standard Brick'}
        </div>
      ),
    },
    {
      accessorKey: 'worker_name',
      header: 'Moulding Worker',
      cell: ({ row }) => (
        <span className="text-muted-foreground text-xs">{row.original.worker_name ?? '—'}</span>
      ),
    },
    {
      accessorKey: 'bricks_moulded',
      header: 'Bricks Moulded',
      align: 'right',
      cell: ({ row }) => (
        <span className="font-mono font-bold text-foreground">
          {row.original.bricks_moulded.toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: 'notes',
      header: 'Notes',
      cell: ({ row }) => (
        <span className="text-muted-foreground text-xs truncate max-w-[200px] block">
          {row.original.notes || '—'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Action',
      align: 'center',
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-[11px] gap-1 cursor-pointer"
          onClick={() => setSelectedBatch(row.original)}
        >
          <Eye className="h-3.5 w-3.5" /> View
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Factory className="h-6 w-6 text-primary" /> Production & Moulding Logs
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Track daily moulding output by brick type and worker
          </p>
        </div>
        {canWrite && (
          <Button onClick={() => setShowAddBatch(true)}>
            <Plus className="h-4 w-4" /> Log Production Batch
          </Button>
        )}
      </div>

      {/* Batches Table */}
      <DataTable
        columns={columns}
        data={batches}
        searchPlaceholder="Search production batches..."
        exportFileName="production_batches.csv"
      />

      {/* Modal: Log Production Batch */}
      {showAddBatch && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">Log Production Batch</h3>
              <button
                onClick={() => setShowAddBatch(false)}
                className="text-muted-foreground hover:text-foreground rounded p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateBatch} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                  Brick Type *
                </label>
                <select
                  value={brickTypeId}
                  onChange={(e) => setBrickTypeId(e.target.value)}
                  required
                  className="w-full rounded border border-border bg-card px-3 py-2 text-xs text-foreground focus:ring-1 focus:ring-primary"
                >
                  <option value="">-- Select Brick Type --</option>
                  {brickTypes.map((bt) => (
                    <option key={bt.id} value={bt.id}>
                      {bt.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                  Moulding Worker
                </label>
                <select
                  value={workerId}
                  onChange={(e) => setWorkerId(e.target.value)}
                  className="w-full rounded border border-border bg-card px-3 py-2 text-xs text-foreground focus:ring-1 focus:ring-primary"
                >
                  <option value="">-- Choose Worker (Optional) --</option>
                  {workers.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                    Production Date *
                  </label>
                  <Input
                    type="date"
                    value={productionDate}
                    onChange={(e) => setProductionDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                    Bricks Moulded *
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={bricksMoulded}
                    onChange={(e) => setBricksMoulded(e.target.value)}
                    placeholder="e.g. 1500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                  Notes / Observations
                </label>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Morning shift moulding batch"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setShowAddBatch(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createBatch.isPending}>
                  {createBatch.isPending ? 'Saving...' : 'Save Batch'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Batch Detail */}
      {selectedBatch && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">Batch Details</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedBatch(null)}
              >
                Close
              </Button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-muted-foreground">Production Date:</span>
                <span className="font-mono font-semibold">{selectedBatch.production_date}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-muted-foreground">Brick Type:</span>
                <span className="font-semibold">{selectedBatch.brick_type?.name ?? 'Standard'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-muted-foreground">Worker:</span>
                <span>{selectedBatch.worker_name ?? 'Unassigned'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-muted-foreground">Bricks Moulded:</span>
                <span className="font-mono font-bold text-primary">
                  {selectedBatch.bricks_moulded.toLocaleString()}
                </span>
              </div>
              {selectedBatch.notes && (
                <div className="pt-2">
                  <span className="text-muted-foreground text-xs block mb-1">Notes:</span>
                  <p className="text-xs bg-muted/40 p-2 rounded border border-border">{selectedBatch.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
