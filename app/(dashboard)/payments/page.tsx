'use client';

import React, { useState } from 'react';
import { Receipt, Plus, ArrowUpRight, ArrowDownLeft, X } from 'lucide-react';
import {
  usePayments,
  useCreatePayment,
} from '@/features/payments/hooks/usePayments';
import { useCustomers } from '@/features/sales/hooks/useSales';
import { useWorkers } from '@/features/workers/hooks/useWorkers';
import { useAuth } from '@/context/AuthContext';
import { DataTable, Column } from '@/components/ui/data-table/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import type { Payment } from '@/features/payments/types/payment.types';

export default function PaymentsPage() {
  const { profile } = useAuth();
  const orgId = profile?.organization_id ?? '';

  const { data: payments = [], isLoading: loadingPayments } = usePayments(orgId);
  const { data: customers = [] } = useCustomers(orgId);
  const { data: workers = [] } = useWorkers(orgId);

  const createPayment = useCreatePayment(orgId);

  // Modal State
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [paymentMode, setPaymentMode] = useState<Payment['payment_mode']>('cash');
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');

  const canWrite = profile?.role && ['owner', 'manager', 'accountant'].includes(profile.role);

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    createPayment.mutate(
      {
        customer_id: selectedCustomerId,
        sales_order_id: null,
        amount: parseFloat(amount),
        payment_date: paymentDate,
        payment_mode: paymentMode,
        reference_number: referenceNumber || null,
      },
      {
        onSuccess: () => {
          toast.success('Payment recorded successfully!');
          setShowAddPayment(false);
          setAmount('');
          setSelectedCustomerId('');
          setReferenceNumber('');
        },
        onError: (err: Error) => {
          toast.error(err.message || 'Failed to record payment');
        },
      }
    );
  };

  const columns: Column<Payment>[] = [
    {
      accessorKey: 'payment_date',
      header: 'Date',
      cell: ({ row }) => (
        <span className="text-muted-foreground font-mono text-[11px]">{row.original.payment_date}</span>
      ),
    },
    {
      accessorKey: 'customers',
      header: 'Customer',
      cell: ({ row }) => (
        <div>
          <div className="font-bold text-foreground">
            {row.original.customer?.name ?? 'General Payment'}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      align: 'right',
      cell: ({ row }) => (
        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
          ₹{Number(row.original.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      accessorKey: 'payment_mode',
      header: 'Mode',
      align: 'center',
      cell: ({ row }) => (
        <Badge variant="outline" className="uppercase font-mono text-[10px]">
          {row.original.payment_mode}
        </Badge>
      ),
    },
    {
      accessorKey: 'reference_number',
      header: 'Ref #',
      cell: ({ row }) => (
        <span className="font-mono text-muted-foreground text-xs">
          {row.original.reference_number || '—'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Receipt className="h-6 w-6 text-primary" /> Financial Payments & Receipts
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Customer cash receipts, bank transfers, UPI transactions, and payment allocations
          </p>
        </div>
        {canWrite && (
          <Button onClick={() => setShowAddPayment(true)}>
            <Plus className="h-4 w-4" /> Record New Payment
          </Button>
        )}
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={payments}
        searchPlaceholder="Search payment transactions..."
        exportFileName="payments.csv"
      />

      {/* Modal: Record Payment */}
      {showAddPayment && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">Record Payment Receipt</h3>
              <button
                onClick={() => setShowAddPayment(false)}
                className="text-muted-foreground hover:text-foreground rounded p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreatePayment} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                  Customer
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full rounded border border-border bg-card px-3 py-2 text-xs text-foreground focus:ring-1 focus:ring-primary"
                >
                  <option value="">-- Choose Customer (Optional) --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                    Payment Date *
                  </label>
                  <Input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                    Amount (₹) *
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 25000"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                    Payment Mode *
                  </label>
                  <select
                    value={paymentMode ?? 'cash'}
                    onChange={(e) => setPaymentMode(e.target.value as Payment['payment_mode'])}
                    required
                    className="w-full rounded border border-border bg-card px-3 py-2 text-xs text-foreground focus:ring-1 focus:ring-primary"
                  >
                    <option value="cash">Cash</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="cheque">Cheque</option>
                    <option value="upi">UPI</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                    Reference / Cheque #
                  </label>
                  <Input
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    placeholder="e.g. UPI/123456"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setShowAddPayment(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createPayment.isPending}>
                  {createPayment.isPending ? 'Saving...' : 'Save Payment'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
