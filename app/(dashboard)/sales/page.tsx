'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Users, Receipt, AlertCircle } from 'lucide-react';
import {
  getSalesAction,
  postSaleAction,
  getCustomersAction,
  createCustomerAction,
} from '@/features/sales/actions';
import { getMasterDataAction } from '@/features/settings/actions';
import { DataTable } from '@/components/ui/data-table/data-table';
import { toast } from 'sonner';

export default function SalesPage() {
  const [activeTab, setActiveTab] = useState<'sales' | 'customers'>('sales');
  const [sales, setSales] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [brickTypes, setBrickTypes] = useState<any[]>([]);
  const [brickGrades, setBrickGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showPostSale, setShowPostSale] = useState(false);
  const [showAddCustomer, setShowAddCustomer] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [sRes, cRes, mRes] = await Promise.all([
      getSalesAction(),
      getCustomersAction(),
      getMasterDataAction(),
    ]);
    if (sRes.success) setSales(sRes.data || []);
    if (cRes.success) setCustomers(cRes.data || []);
    if (mRes.success) {
      setBrickTypes(mRes.data?.brick_types || []);
      setBrickGrades(mRes.data?.brick_grades || []);
    }
    setLoading(false);
  }

  const handlePostSale = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const res = await postSaleAction(formData);
    if (res.success) {
      toast.success('Sale dispatch recorded with FIFO stock deduction!');
      setShowPostSale(false);
      loadData();
    } else {
      toast.error(res.error || 'Failed to post sale');
    }
  };

  const handleCreateCustomer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const res = await createCustomerAction(formData);
    if (res.success) {
      toast.success('Customer profile registered');
      setShowAddCustomer(false);
      loadData();
    } else {
      toast.error(res.error || 'Failed to create customer');
    }
  };

  const saleColumns: any[] = [
    {
      accessorKey: 'sale_number',
      header: 'Dispatch #',
      cell: ({ row }: any) => <span className="font-mono font-bold text-foreground">{row.original.sale_number}</span>,
    },
    {
      accessorKey: 'sale_date',
      header: 'Date',
      cell: ({ row }: any) => <span className="text-muted-foreground">{row.original.sale_date}</span>,
    },
    {
      accessorKey: 'customer_name',
      header: 'Customer',
      cell: ({ row }: any) => <span className="font-bold text-foreground">{row.original.customer_name}</span>,
    },
    {
      accessorKey: 'brick_type_name',
      header: 'Brick Item',
      cell: ({ row }: any) => (
        <span>
          {row.original.brick_type_name} • <strong className="text-primary">{row.original.brick_grade_name}</strong>
        </span>
      ),
    },
    {
      accessorKey: 'quantity',
      header: 'Bricks Sold',
      cell: ({ row }: any) => (
        <span className="font-bold text-foreground">
          {parseInt(row.original.quantity || '0', 10).toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: 'total_amount_paise',
      header: 'Invoice Total',
      cell: ({ row }: any) => (
        <span className="font-bold text-foreground">
          ₹{(parseInt(row.original.total_amount_paise || '0', 10) / 100).toFixed(2)}
        </span>
      ),
    },
    {
      accessorKey: 'payment_status',
      header: 'Payment Status',
      cell: ({ row }: any) => {
        const s = row.original.payment_status;
        return (
          <span
            className={`rounded px-2 py-0.5 text-[10px] font-bold ${
              s === 'PAID'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : s === 'PARTIALLY_PAID'
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                : 'bg-destructive/10 text-destructive'
            }`}
          >
            {s || 'UNPAID'}
          </span>
        );
      },
    },
  ];

  const customerColumns: any[] = [
    {
      accessorKey: 'name',
      header: 'Customer Name',
      cell: ({ row }: any) => (
        <div>
          <div className="font-bold text-foreground">{row.original.name}</div>
          <div className="text-[11px] text-muted-foreground font-mono">{row.original.code}</div>
        </div>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }: any) => <span className="text-muted-foreground">{row.original.phone || '—'}</span>,
    },
    {
      accessorKey: 'receivable_balance_paise',
      header: 'Receivable Due',
      cell: ({ row }: any) => {
        const val = parseInt(row.original.receivable_balance_paise || '0', 10) / 100;
        return (
          <span className={`font-bold ${val > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            ₹{val.toFixed(2)}
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
            <ShoppingCart className="h-6 w-6 text-primary" /> Sales & Customer Orders
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Finished brick sales dispatches, automatic FIFO lot stock consumption, and customer debt ledgers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddCustomer(true)}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-xs font-bold text-foreground hover:bg-accent shadow-xs"
          >
            <Users className="h-4 w-4" /> Add Customer
          </button>
          <button
            onClick={() => setShowPostSale(true)}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 shadow-xs"
          >
            <Plus className="h-4 w-4" /> New Sale Dispatch
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border gap-2">
        <button
          onClick={() => setActiveTab('sales')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'sales'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Sales Dispatches ({sales.length})
        </button>
        <button
          onClick={() => setActiveTab('customers')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'customers'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Customers ({customers.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'sales' && (
        <DataTable columns={saleColumns} data={sales} searchPlaceholder="Search sales entries..." exportFileName="sales.csv" />
      )}
      {activeTab === 'customers' && (
        <DataTable columns={customerColumns} data={customers} searchPlaceholder="Search customers..." exportFileName="customers.csv" />
      )}

      {/* Modal: New Sale */}
      {showPostSale && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-foreground">Record New Brick Sale Dispatch</h3>
            <form onSubmit={handlePostSale} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground">Customer</label>
                <select name="customer_id" required className="w-full rounded border border-border bg-card px-3 py-2 text-xs">
                  <option value="">-- Select Customer --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground">Brick Type</label>
                  <select name="brick_type_id" required className="w-full rounded border border-border bg-card px-3 py-2 text-xs">
                    <option value="">-- Type --</option>
                    {brickTypes.map((bt) => (
                      <option key={bt.id} value={bt.id}>{bt.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground">Brick Grade</label>
                  <select name="brick_grade_id" required className="w-full rounded border border-border bg-card px-3 py-2 text-xs">
                    <option value="">-- Grade --</option>
                    {brickGrades.map((bg) => (
                      <option key={bg.id} value={bg.id}>{bg.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground">Sale Date</label>
                <input name="sale_date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required className="w-full rounded border border-border bg-card px-3 py-2 text-xs" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground">Quantity (Bricks)</label>
                  <input name="quantity" type="number" placeholder="e.g. 5000" required className="w-full rounded border border-border bg-card px-3 py-2 text-xs" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground">Unit Price (₹ / brick)</label>
                  <input name="unit_price" type="number" step="0.01" placeholder="e.g. 7.50" required className="w-full rounded border border-border bg-card px-3 py-2 text-xs" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowPostSale(false)} className="px-3 py-1.5 text-xs border rounded">Cancel</button>
                <button type="submit" className="px-4 py-1.5 text-xs font-bold bg-primary text-primary-foreground rounded">Confirm Sale</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Customer */}
      {showAddCustomer && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-foreground">Register New Customer</h3>
            <form onSubmit={handleCreateCustomer} className="space-y-3">
              <input name="code" placeholder="Customer Code (e.g. CUST-001)" required className="w-full rounded border border-border bg-card px-3 py-2 text-xs" />
              <input name="name" placeholder="Full Name / Builder Name" required className="w-full rounded border border-border bg-card px-3 py-2 text-xs" />
              <input name="phone" placeholder="Phone Number" className="w-full rounded border border-border bg-card px-3 py-2 text-xs" />
              <input name="address" placeholder="Delivery Address / Site" className="w-full rounded border border-border bg-card px-3 py-2 text-xs" />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddCustomer(false)} className="px-3 py-1.5 text-xs border rounded">Cancel</button>
                <button type="submit" className="px-4 py-1.5 text-xs font-bold bg-primary text-primary-foreground rounded">Save Customer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
