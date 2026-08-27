import React, { useState, useEffect } from 'react';
import { Package, Plus, Truck, ShoppingBag } from 'lucide-react';
import { apiRequest } from '../../shared/api/client';
import { formatINR } from '../../shared/utils/formatters';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '../../shared/components/PageHeader';
import { EmptyState } from '../../shared/components/EmptyState';

export const MaterialsView: React.FC = () => {
  const [materials, setMaterials] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'materials' | 'suppliers' | 'purchases'>('materials');
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [supplierForm, setSupplierForm] = useState<any>({});

  useEffect(() => { loadMaterialsData(); }, []);

  async function loadMaterialsData() {
    try {
      const [m, s, p] = await Promise.all([apiRequest('/materials'), apiRequest('/suppliers'), apiRequest('/materials/purchases')]);
      setMaterials(m); setSuppliers(s); setPurchases(p);
    } catch (err: any) { console.error(err); }
  }

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/suppliers', { method: 'POST', body: JSON.stringify(supplierForm) });
      setIsAddSupplierOpen(false); setSupplierForm({}); loadMaterialsData();
    } catch (err: any) { alert(err.message); }
  };

  const tabClasses = (active: boolean) => `gap-1.5 font-semibold text-xs h-8 ${active ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-white'}`;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Raw Materials & Supplier Procurement"
        description="Coal, soil, sawdust, and firewood inventory, supplier accounts, and purchase logs"
        icon={<Package className="size-5 sm:size-6" />}
        actions={
          <Button onClick={() => setIsAddSupplierOpen(true)} className="bg-orange-500 hover:bg-orange-600 text-white font-bold gap-2 h-10 px-4 shadow-lg shadow-orange-500/20 text-xs sm:text-sm">
            <Plus className="size-4" /> Add Supplier
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant={activeTab === 'materials' ? "default" : "outline"} onClick={() => setActiveTab('materials')} className={tabClasses(activeTab === 'materials')}><Package className="size-3.5" /> Materials ({materials.length})</Button>
        <Button size="sm" variant={activeTab === 'suppliers' ? "default" : "outline"} onClick={() => setActiveTab('suppliers')} className={tabClasses(activeTab === 'suppliers')}><Truck className="size-3.5" /> Suppliers ({suppliers.length})</Button>
        <Button size="sm" variant={activeTab === 'purchases' ? "default" : "outline"} onClick={() => setActiveTab('purchases')} className={tabClasses(activeTab === 'purchases')}><ShoppingBag className="size-3.5" /> Purchases ({purchases.length})</Button>
      </div>

      {activeTab === 'materials' && (
        <Card className="bg-slate-900/60 border-slate-800/60 backdrop-blur-sm shadow-sm text-slate-100 p-5">
          <div className="rounded-lg border border-slate-800/60 overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-950/40"><TableRow className="border-slate-800/60 hover:bg-transparent">
                <TableHead className="text-slate-500 font-semibold uppercase text-[11px] tracking-wide">Material Name</TableHead>
                <TableHead className="text-slate-500 font-semibold uppercase text-[11px] tracking-wide">Unit</TableHead>
                <TableHead className="text-slate-500 font-semibold uppercase text-[11px] tracking-wide">Current Stock</TableHead>
                <TableHead className="text-slate-500 font-semibold uppercase text-[11px] tracking-wide">Reorder Threshold</TableHead>
                <TableHead className="text-slate-500 font-semibold uppercase text-[11px] tracking-wide">Status</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {materials.length === 0 ? (<TableRow><TableCell colSpan={5}><EmptyState title="No materials configured" /></TableCell></TableRow>) : materials.map((m) => (
                  <TableRow key={m.id} className="border-slate-800/40 hover:bg-slate-800/30">
                    <TableCell className="font-semibold text-slate-200 text-sm">{m.name}</TableCell>
                    <TableCell className="text-slate-400 text-sm font-medium">{m.unit_code}</TableCell>
                    <TableCell className="font-bold text-emerald-400 text-sm">{m.current_stock?.toLocaleString()} {m.unit_code}</TableCell>
                    <TableCell className="text-sm text-slate-500">{m.reorder_threshold ? `${m.reorder_threshold} ${m.unit_code}` : '-'}</TableCell>
                    <TableCell><Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 text-[10px] font-bold">NORMAL</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {activeTab === 'suppliers' && (
        <Card className="bg-slate-900/60 border-slate-800/60 backdrop-blur-sm shadow-sm text-slate-100 p-5">
          <div className="rounded-lg border border-slate-800/60 overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-950/40"><TableRow className="border-slate-800/60 hover:bg-transparent">
                <TableHead className="text-slate-500 font-semibold uppercase text-[11px] tracking-wide">Supplier Code</TableHead>
                <TableHead className="text-slate-500 font-semibold uppercase text-[11px] tracking-wide">Supplier Name</TableHead>
                <TableHead className="text-slate-500 font-semibold uppercase text-[11px] tracking-wide">Phone</TableHead>
                <TableHead className="text-slate-500 font-semibold uppercase text-[11px] tracking-wide">Outstanding Payables</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {suppliers.length === 0 ? (<TableRow><TableCell colSpan={4}><EmptyState title="No suppliers added" actionLabel="Add Supplier" onAction={() => setIsAddSupplierOpen(true)} /></TableCell></TableRow>) : suppliers.map((s) => (
                  <TableRow key={s.id} className="border-slate-800/40 hover:bg-slate-800/30">
                    <TableCell className="font-semibold text-slate-200 text-sm">{s.code}</TableCell>
                    <TableCell className="text-slate-300 text-sm">{s.name}</TableCell>
                    <TableCell className="text-sm text-slate-500">{s.phone || '-'}</TableCell>
                    <TableCell className="font-bold text-rose-400 text-sm">{formatINR(s.payable_balance_paise)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {activeTab === 'purchases' && (
        <Card className="bg-slate-900/60 border-slate-800/60 backdrop-blur-sm shadow-sm text-slate-100 p-5">
          <div className="rounded-lg border border-slate-800/60 overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-950/40"><TableRow className="border-slate-800/60 hover:bg-transparent">
                <TableHead className="text-slate-500 font-semibold uppercase text-[11px] tracking-wide">Purchase #</TableHead>
                <TableHead className="text-slate-500 font-semibold uppercase text-[11px] tracking-wide">Date</TableHead>
                <TableHead className="text-slate-500 font-semibold uppercase text-[11px] tracking-wide">Supplier</TableHead>
                <TableHead className="text-slate-500 font-semibold uppercase text-[11px] tracking-wide">Material</TableHead>
                <TableHead className="text-slate-500 font-semibold uppercase text-[11px] tracking-wide">Quantity</TableHead>
                <TableHead className="text-slate-500 font-semibold uppercase text-[11px] tracking-wide">Total Amount</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {purchases.length === 0 ? (<TableRow><TableCell colSpan={6}><EmptyState title="No purchases recorded" /></TableCell></TableRow>) : purchases.map((p) => (
                  <TableRow key={p.id} className="border-slate-800/40 hover:bg-slate-800/30">
                    <TableCell className="font-semibold text-slate-200 text-sm">{p.purchase_number}</TableCell>
                    <TableCell className="text-sm text-slate-400">{p.purchase_date}</TableCell>
                    <TableCell className="text-slate-300 text-sm">{p.supplier_name}</TableCell>
                    <TableCell className="text-slate-400 text-sm">{p.material_name}</TableCell>
                    <TableCell className="text-sm text-slate-300 font-semibold">{p.quantity} {p.unit_code}</TableCell>
                    <TableCell className="font-bold text-white text-sm">{formatINR(p.total_amount_paise)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      <Dialog open={isAddSupplierOpen} onOpenChange={setIsAddSupplierOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 sm:max-w-[480px]">
          <DialogHeader><DialogTitle className="text-lg font-bold text-white">Add Supplier</DialogTitle></DialogHeader>
          <form onSubmit={handleCreateSupplier} className="space-y-4">
            <div className="space-y-1.5"><Label className="text-slate-400 text-xs">Supplier Code</Label><Input placeholder="e.g. SUPP-001" value={supplierForm.code || ''} onChange={e => setSupplierForm({ ...supplierForm, code: e.target.value })} required className="bg-slate-950/40 border-slate-700/60" /></div>
            <div className="space-y-1.5"><Label className="text-slate-400 text-xs">Supplier Name</Label><Input placeholder="e.g. Bharat Coal Traders" value={supplierForm.name || ''} onChange={e => setSupplierForm({ ...supplierForm, name: e.target.value })} required className="bg-slate-950/40 border-slate-700/60" /></div>
            <div className="space-y-1.5"><Label className="text-slate-400 text-xs">Phone</Label><Input placeholder="e.g. +91 9876543210" value={supplierForm.phone || ''} onChange={e => setSupplierForm({ ...supplierForm, phone: e.target.value })} className="bg-slate-950/40 border-slate-700/60" /></div>
            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800/40">
              <Button type="button" variant="outline" onClick={() => setIsAddSupplierOpen(false)} className="border-slate-700 hover:bg-slate-800 text-slate-300">Cancel</Button>
              <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold">Save Supplier</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
