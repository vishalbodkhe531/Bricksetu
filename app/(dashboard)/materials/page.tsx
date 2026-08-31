'use client';

import React, { useState, useEffect } from 'react';
import { Package, Plus, ShoppingBag, Truck, Flame, AlertCircle } from 'lucide-react';
import {
  getMaterialsAction,
  createMaterialAction,
  getSuppliersAction,
  createSupplierAction,
  getPurchasesAction,
  createPurchaseAction,
  consumeMaterialAction,
} from '@/features/materials/actions';
import { DataTable } from '@/components/ui/data-table/data-table';
import { toast } from 'sonner';

export default function MaterialsPage() {
  const [activeTab, setActiveTab] = useState<'catalogue' | 'purchases' | 'suppliers'>('catalogue');
  const [materials, setMaterials] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddPurchase, setShowAddPurchase] = useState(false);
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [showAddMaterial, setShowAddMaterial] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [mRes, pRes, sRes] = await Promise.all([
      getMaterialsAction(),
      getPurchasesAction(),
      getSuppliersAction(),
    ]);
    if (mRes.success) setMaterials(mRes.data || []);
    if (pRes.success) setPurchases(pRes.data || []);
    if (sRes.success) setSuppliers(sRes.data || []);
    setLoading(false);
  }

  const handleCreatePurchase = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const res = await createPurchaseAction(formData);
    if (res.success) {
      toast.success('Material purchase logged successfully');
      setShowAddPurchase(false);
      loadData();
    } else {
      toast.error(res.error || 'Failed to post purchase');
    }
  };

  const handleCreateSupplier = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const res = await createSupplierAction(formData);
    if (res.success) {
      toast.success('Supplier registered');
      setShowAddSupplier(false);
      loadData();
    } else {
      toast.error(res.error || 'Failed to create supplier');
    }
  };

  const handleCreateMaterial = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const res = await createMaterialAction(formData);
    if (res.success) {
      toast.success('Material item added');
      setShowAddMaterial(false);
      loadData();
    } else {
      toast.error(res.error || 'Failed to add material');
    }
  };

  const materialColumns: any[] = [
    {
      accessorKey: 'name',
      header: 'Material Name',
      cell: ({ row }: any) => (
        <div>
          <div className="font-bold text-foreground">{row.original.name}</div>
          <div className="text-[11px] text-muted-foreground font-mono">{row.original.code}</div>
        </div>
      ),
    },
    {
      accessorKey: 'unit_name',
      header: 'Unit',
      cell: ({ row }: any) => <span className="font-mono text-muted-foreground">{row.original.unit_code}</span>,
    },
    {
      accessorKey: 'current_stock',
      header: 'Current Stock',
      cell: ({ row }: any) => (
        <span className="font-bold text-foreground">
          {parseFloat(row.original.current_stock || '0').toLocaleString()} {row.original.unit_code}
        </span>
      ),
    },
    {
      accessorKey: 'reorder_level',
      header: 'Reorder Threshold',
      cell: ({ row }: any) => (
        <span className="text-muted-foreground">
          {parseFloat(row.original.reorder_level || '0').toLocaleString()} {row.original.unit_code}
        </span>
      ),
    },
  ];

  const purchaseColumns: any[] = [
    {
      accessorKey: 'purchase_number',
      header: 'Purchase #',
      cell: ({ row }: any) => <span className="font-mono font-bold text-foreground">{row.original.purchase_number}</span>,
    },
    {
      accessorKey: 'purchase_date',
      header: 'Date',
      cell: ({ row }: any) => <span className="text-muted-foreground">{row.original.purchase_date}</span>,
    },
    {
      accessorKey: 'supplier_name',
      header: 'Supplier',
      cell: ({ row }: any) => <span>{row.original.supplier_name}</span>,
    },
    {
      accessorKey: 'material_name',
      header: 'Material',
      cell: ({ row }: any) => <span>{row.original.material_name}</span>,
    },
    {
      accessorKey: 'quantity',
      header: 'Quantity',
      cell: ({ row }: any) => (
        <span className="font-bold">
          {parseFloat(row.original.quantity).toLocaleString()} {row.original.unit_code}
        </span>
      ),
    },
    {
      accessorKey: 'total_amount_paise',
      header: 'Total Cost',
      cell: ({ row }: any) => (
        <span className="font-bold text-foreground">
          ₹{(parseInt(row.original.total_amount_paise || '0', 10) / 100).toFixed(2)}
        </span>
      ),
    },
  ];

  const supplierColumns: any[] = [
    {
      accessorKey: 'name',
      header: 'Supplier Name',
      cell: ({ row }: any) => (
        <div>
          <div className="font-bold text-foreground">{row.original.name}</div>
          <div className="text-[11px] text-muted-foreground font-mono">{row.original.code}</div>
        </div>
      ),
    },
    {
      accessorKey: 'contact_person',
      header: 'Contact Person',
      cell: ({ row }: any) => <span className="text-muted-foreground">{row.original.contact_person || '—'}</span>,
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }: any) => <span className="text-muted-foreground">{row.original.phone || '—'}</span>,
    },
    {
      accessorKey: 'payable_balance_paise',
      header: 'Outstanding Balance',
      cell: ({ row }: any) => {
        const val = parseInt(row.original.payable_balance_paise || '0', 10) / 100;
        return (
          <span className={`font-bold ${val > 0 ? 'text-destructive' : 'text-emerald-600 dark:text-emerald-400'}`}>
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
            <Package className="h-6 w-6 text-primary" /> Materials & Procurement
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Coal, clay, sawdust, diesel stock tracking, FIFO lot pricing, and supplier ledger accounts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddSupplier(true)}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-xs font-bold text-foreground hover:bg-accent shadow-xs"
          >
            <Truck className="h-4 w-4" /> Add Supplier
          </button>
          <button
            onClick={() => setShowAddPurchase(true)}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 shadow-xs"
          >
            <ShoppingBag className="h-4 w-4" /> Log Purchase
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border gap-2">
        <button
          onClick={() => setActiveTab('catalogue')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'catalogue'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Material Stock ({materials.length})
        </button>
        <button
          onClick={() => setActiveTab('purchases')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'purchases'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Purchase Entries ({purchases.length})
        </button>
        <button
          onClick={() => setActiveTab('suppliers')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'suppliers'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Suppliers ({suppliers.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'catalogue' && (
        <DataTable columns={materialColumns} data={materials} searchPlaceholder="Search materials..." exportFileName="materials.csv" />
      )}
      {activeTab === 'purchases' && (
        <DataTable columns={purchaseColumns} data={purchases} searchPlaceholder="Search purchases..." exportFileName="purchases.csv" />
      )}
      {activeTab === 'suppliers' && (
        <DataTable columns={supplierColumns} data={suppliers} searchPlaceholder="Search suppliers..." exportFileName="suppliers.csv" />
      )}

      {/* Modal: Log Purchase */}
      {showAddPurchase && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-foreground">Log Material Purchase</h3>
            <form onSubmit={handleCreatePurchase} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground">Supplier</label>
                <select name="supplier_id" required className="w-full rounded border border-border bg-card px-3 py-2 text-xs">
                  <option value="">-- Select Supplier --</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground">Material Item</label>
                <select name="material_id" required className="w-full rounded border border-border bg-card px-3 py-2 text-xs">
                  <option value="">-- Select Material --</option>
                  {materials.map((m) => (
                    <option key={m.id} value={m.id}>{m.name} ({m.unit_code})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground">Purchase Date</label>
                <input name="purchase_date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required className="w-full rounded border border-border bg-card px-3 py-2 text-xs" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground">Quantity</label>
                  <input name="quantity" type="number" step="0.01" placeholder="e.g. 50" required className="w-full rounded border border-border bg-card px-3 py-2 text-xs" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground">Unit Price (₹)</label>
                  <input name="unit_price" type="number" step="0.01" placeholder="e.g. 8500" required className="w-full rounded border border-border bg-card px-3 py-2 text-xs" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddPurchase(false)} className="px-3 py-1.5 text-xs border rounded">Cancel</button>
                <button type="submit" className="px-4 py-1.5 text-xs font-bold bg-primary text-primary-foreground rounded">Save Purchase</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Supplier */}
      {showAddSupplier && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-foreground">Register New Supplier</h3>
            <form onSubmit={handleCreateSupplier} className="space-y-3">
              <input name="code" placeholder="Supplier Code (e.g. SUP-001)" required className="w-full rounded border border-border bg-card px-3 py-2 text-xs" />
              <input name="name" placeholder="Supplier Firm Name" required className="w-full rounded border border-border bg-card px-3 py-2 text-xs" />
              <input name="contact_person" placeholder="Contact Person (optional)" className="w-full rounded border border-border bg-card px-3 py-2 text-xs" />
              <input name="phone" placeholder="Phone Number" className="w-full rounded border border-border bg-card px-3 py-2 text-xs" />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddSupplier(false)} className="px-3 py-1.5 text-xs border rounded">Cancel</button>
                <button type="submit" className="px-4 py-1.5 text-xs font-bold bg-primary text-primary-foreground rounded">Save Supplier</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
