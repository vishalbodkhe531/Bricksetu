'use client';

import React, { useState, useEffect } from 'react';
import { Receipt, Plus, ArrowUpRight, ArrowDownLeft, AlertCircle } from 'lucide-react';
import {
  getPaymentsAction,
  createPaymentAction,
} from '@/features/payments/actions';
import { getMasterDataAction } from '@/features/settings/actions';
import { getCustomersAction, getSalesAction } from '@/features/sales/actions';
import { getSuppliersAction } from '@/features/materials/actions';
import { getWorkersAction } from '@/features/workers/actions';
import { DataTable } from '@/components/ui/data-table/data-table';
import { toast } from 'sonner';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [partyType, setPartyType] = useState<string>('CUSTOMER');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [pRes, mRes, cRes, sRes, wRes] = await Promise.all([
      getPaymentsAction(),
      getMasterDataAction(),
      getCustomersAction(),
      getSuppliersAction(),
      getWorkersAction(),
    ]);
    if (pRes.success) setPayments(pRes.data || []);
    if (mRes.success) setPaymentMethods(mRes.data?.payment_methods || []);
    if (cRes.success) setCustomers(cRes.data || []);
    if (sRes.success) setSuppliers(sRes.data || []);
    if (wRes.success) setWorkers(wRes.data || []);
    setLoading(false);
  }

  const handleCreatePayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const res = await createPaymentAction(formData);
    if (res.success) {
      toast.success('Payment recorded successfully!');
      setShowAddPayment(false);
      loadData();
    } else {
      toast.error(res.error || 'Failed to record payment');
    }
  };

  const columns: any[] = [
    {
      accessorKey: 'payment_number',
      header: 'Payment #',
      cell: ({ row }: any) => <span className="font-mono font-bold text-foreground">{row.original.payment_number}</span>,
    },
    {
      accessorKey: 'payment_date',
      header: 'Date',
      cell: ({ row }: any) => <span className="text-muted-foreground">{row.original.payment_date}</span>,
    },
    {
      accessorKey: 'direction',
      header: 'Direction',
      cell: ({ row }: any) => {
        const dir = row.original.direction;
        return (
          <span
            className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold ${
              dir === 'INCOMING'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
            }`}
          >
            {dir === 'INCOMING' ? <ArrowDownLeft className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
            {dir}
          </span>
        );
      },
    },
    {
      accessorKey: 'party_name',
      header: 'Party',
      cell: ({ row }: any) => (
        <div>
          <div className="font-bold text-foreground">{row.original.party_name}</div>
          <div className="text-[10px] text-muted-foreground uppercase">{row.original.party_type}</div>
        </div>
      ),
    },
    {
      accessorKey: 'amount_paise',
      header: 'Amount',
      cell: ({ row }: any) => (
        <span className="font-bold text-foreground">
          ₹{(parseInt(row.original.amount_paise || '0', 10) / 100).toFixed(2)}
        </span>
      ),
    },
    {
      accessorKey: 'payment_method_name',
      header: 'Method',
      cell: ({ row }: any) => <span className="text-muted-foreground font-medium">{row.original.payment_method_name}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Receipt className="h-6 w-6 text-primary" /> Financial Payments & Ledger Allocations
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Cash receipts from customers, outgoing payments to suppliers, and worker wage advances
          </p>
        </div>
        <button
          onClick={() => setShowAddPayment(true)}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 shadow-xs"
        >
          <Plus className="h-4 w-4" /> Record New Payment
        </button>
      </div>

      {/* Table */}
      <DataTable columns={columns} data={payments} searchPlaceholder="Search payment transactions..." exportFileName="payments.csv" />

      {/* Modal: New Payment */}
      {showAddPayment && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-foreground">Record Payment Entry</h3>
            <form onSubmit={handleCreatePayment} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground">Direction</label>
                  <select name="direction" required className="w-full rounded border border-border bg-card px-3 py-2 text-xs">
                    <option value="INCOMING">INCOMING (Receipt)</option>
                    <option value="OUTGOING">OUTGOING (Payment)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground">Party Type</label>
                  <select
                    name="party_type"
                    value={partyType}
                    onChange={(e) => setPartyType(e.target.value)}
                    required
                    className="w-full rounded border border-border bg-card px-3 py-2 text-xs"
                  >
                    <option value="CUSTOMER">CUSTOMER</option>
                    <option value="SUPPLIER">SUPPLIER</option>
                    <option value="WORKER">WORKER</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-foreground">Select Party</label>
                <select name="party_id" required className="w-full rounded border border-border bg-card px-3 py-2 text-xs">
                  <option value="">-- Choose Party --</option>
                  {partyType === 'CUSTOMER' &&
                    customers.map((c) => (
                      <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                    ))}
                  {partyType === 'SUPPLIER' &&
                    suppliers.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                    ))}
                  {partyType === 'WORKER' &&
                    workers.map((w) => (
                      <option key={w.id} value={w.id}>{w.full_name} ({w.code})</option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground">Payment Date</label>
                  <input name="payment_date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required className="w-full rounded border border-border bg-card px-3 py-2 text-xs" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground">Amount (₹)</label>
                  <input name="amount" type="number" step="0.01" placeholder="e.g. 25000" required className="w-full rounded border border-border bg-card px-3 py-2 text-xs" />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-foreground">Payment Method</label>
                <select name="payment_method_id" required className="w-full rounded border border-border bg-card px-3 py-2 text-xs">
                  <option value="">-- Method --</option>
                  {paymentMethods.map((pm) => (
                    <option key={pm.id} value={pm.id}>{pm.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddPayment(false)} className="px-3 py-1.5 text-xs border rounded">Cancel</button>
                <button type="submit" className="px-4 py-1.5 text-xs font-bold bg-primary text-primary-foreground rounded">Save Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
