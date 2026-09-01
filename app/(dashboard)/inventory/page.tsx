'use client';

import React, { useState } from 'react';
import { Boxes, Sliders, Plus, X } from 'lucide-react';
import {
  useInventoryTransactions,
  useStockSummary,
  useRawMaterials,
  useCreateInventoryTransaction,
} from '@/features/inventory/hooks/useInventory';
import { useAuth } from '@/context/AuthContext';
import { DataTable, Column } from '@/components/ui/data-table/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import type { InventoryTransaction, StockSummary } from '@/features/inventory/types/inventory.types';

export default function InventoryPage() {
  const { profile } = useAuth();
  const orgId = profile?.organization_id ?? '';

  const [activeTab, setActiveTab] = useState<'summary' | 'transactions'>('summary');

  const { data: summary = [], isLoading: loadingSummary } = useStockSummary(orgId);
  const { data: transactions = [], isLoading: loadingTx } = useInventoryTransactions(orgId);
  const { data: rawMaterials = [] } = useRawMaterials(orgId);

  const createTx = useCreateInventoryTransaction(orgId);

  // Modal
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [itemType, setItemType] = useState<'raw_material' | 'finished_goods'>('raw_material');
  const [itemId, setItemId] = useState('');
  const [txType, setTxType] = useState<'in' | 'out'>('in');
  const [quantity, setQuantity] = useState('');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);

  const canWrite = profile?.role && ['owner', 'manager'].includes(profile.role);

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    createTx.mutate(
      {
        item_type: itemType,
        item_id: itemId,
        transaction_type: txType,
        quantity: parseFloat(quantity),
        transaction_date: txDate,
      },
      {
        onSuccess: () => {
          toast.success('Inventory transaction recorded successfully');
          setShowAddTransaction(false);
          setItemId('');
          setQuantity('');
        },
        onError: (err: Error) => {
          toast.error(err.message || 'Failed to record inventory transaction');
        },
      }
    );
  };

  const summaryColumns: Column<StockSummary>[] = [
    {
      accessorKey: 'item_name',
      header: 'Item Name',
      cell: ({ row }) => (
        <div className="font-semibold text-foreground">{row.original.item_name}</div>
      ),
    },
    {
      accessorKey: 'item_type',
      header: 'Type',
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize font-mono text-[10px]">
          {row.original.item_type.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      accessorKey: 'unit',
      header: 'Unit',
      cell: ({ row }) => <span className="text-muted-foreground text-xs">{row.original.unit}</span>,
    },
    {
      accessorKey: 'stock',
      header: 'Current Stock',
      align: 'right',
      cell: ({ row }) => (
        <span className="font-mono font-bold text-foreground">
          {Number(row.original.stock).toLocaleString()}
        </span>
      ),
    },
  ];

  const transactionColumns: Column<InventoryTransaction>[] = [
    {
      accessorKey: 'transaction_date',
      header: 'Date',
      cell: ({ row }) => (
        <span className="text-muted-foreground font-mono text-[11px]">{row.original.transaction_date}</span>
      ),
    },
    {
      accessorKey: 'item_type',
      header: 'Item Type',
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize font-mono text-[10px]">
          {row.original.item_type.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      accessorKey: 'transaction_type',
      header: 'Type',
      align: 'center',
      cell: ({ row }) => (
        <Badge variant={row.original.transaction_type === 'in' ? 'success' : 'destructive'}>
          {row.original.transaction_type.toUpperCase()}
        </Badge>
      ),
    },
    {
      accessorKey: 'quantity',
      header: 'Quantity',
      align: 'right',
      cell: ({ row }) => {
        const isIn = row.original.transaction_type === 'in';
        return (
          <span className={`font-mono font-bold ${isIn ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}`}>
            {isIn ? `+${row.original.quantity}` : `-${row.original.quantity}`}
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
            <Boxes className="h-6 w-6 text-primary" /> Inventory & Raw Materials
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Real-time finished brick stock, raw material supplies (coal, clay), and inventory log
          </p>
        </div>
        {canWrite && (
          <Button onClick={() => setShowAddTransaction(true)}>
            <Plus className="h-4 w-4" /> Record Transaction
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {(['summary', 'transactions'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'summary' ? 'Stock Summary' : 'Transactions Log'}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'summary' ? (
        <DataTable
          columns={summaryColumns}
          data={summary}
          searchPlaceholder="Search inventory summary..."
          showExport={false}
        />
      ) : (
        <DataTable
          columns={transactionColumns}
          data={transactions}
          searchPlaceholder="Search transactions log..."
          showExport={false}
        />
      )}

      {/* Modal: New Inventory Transaction */}
      {showAddTransaction && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">Record Inventory Transaction</h3>
              <button
                onClick={() => setShowAddTransaction(false)}
                className="text-muted-foreground hover:text-foreground rounded p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateTransaction} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                    Item Type *
                  </label>
                  <select
                    value={itemType}
                    onChange={(e) => setItemType(e.target.value as any)}
                    required
                    className="w-full rounded border border-border bg-card px-3 py-2 text-xs text-foreground focus:ring-1 focus:ring-primary"
                  >
                    <option value="raw_material">Raw Material</option>
                    <option value="finished_goods">Finished Goods</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                    Transaction Type *
                  </label>
                  <select
                    value={txType}
                    onChange={(e) => setTxType(e.target.value as any)}
                    required
                    className="w-full rounded border border-border bg-card px-3 py-2 text-xs text-foreground focus:ring-1 focus:ring-primary"
                  >
                    <option value="in">IN (Addition)</option>
                    <option value="out">OUT (Deduction)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                  Item *
                </label>
                {itemType === 'raw_material' ? (
                  <select
                    value={itemId}
                    onChange={(e) => setItemId(e.target.value)}
                    required
                    className="w-full rounded border border-border bg-card px-3 py-2 text-xs text-foreground focus:ring-1 focus:ring-primary"
                  >
                    <option value="">-- Select Raw Material --</option>
                    {rawMaterials.map((rm) => (
                      <option key={rm.id} value={rm.id}>
                        {rm.name} ({rm.unit})
                      </option>
                    ))}
                  </select>
                ) : (
                  <Input
                    value={itemId}
                    onChange={(e) => setItemId(e.target.value)}
                    placeholder="Enter Brick Type ID"
                    required
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                    Date *
                  </label>
                  <Input
                    type="date"
                    value={txDate}
                    onChange={(e) => setTxDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                    Quantity *
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="e.g. 50"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setShowAddTransaction(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createTx.isPending}>
                  {createTx.isPending ? 'Saving...' : 'Save Entry'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
