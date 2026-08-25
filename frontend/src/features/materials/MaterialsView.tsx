import React, { useState, useEffect } from 'react';
import { Package, Plus, Truck, ShoppingBag } from 'lucide-react';
import { apiRequest } from '../../shared/api/client';
import { formatINR } from '../../shared/utils/formatters';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '../../shared/components/PageHeader';

export const MaterialsView: React.FC = () => {
  const [materials, setMaterials] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'materials' | 'suppliers' | 'purchases'>('materials');

  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [supplierForm, setSupplierForm] = useState<any>({});

  useEffect(() => {
    loadMaterialsData();
  }, []);

  async function loadMaterialsData() {
    try {
      const [m, s, p] = await Promise.all([
        apiRequest('/materials'),
        apiRequest('/suppliers'),
        apiRequest('/materials/purchases'),
      ]);
      setMaterials(m);
      setSuppliers(s);
      setPurchases(p);
    } catch (err: any) {
      console.error(err);
    }
  }

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/suppliers', {
        method: 'POST',
        body: JSON.stringify(supplierForm),
      });
      setIsAddSupplierOpen(false);
      setSupplierForm({});
      loadMaterialsData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Raw Materials & Supplier Procurement"
        description="Coal, soil, sawdust, and firewood inventory, supplier accounts, and purchase logs"
        icon={<Package className="size-5 sm:size-6" />}
        actions={
          <Button 
            onClick={() => setIsAddSupplierOpen(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold gap-2 h-10 px-4 shadow-lg shadow-orange-500/20 text-xs sm:text-sm"
          >
            <Plus className="size-4" /> Add Supplier
          </Button>
        }
      />

      {/* Tabs */}
      <div className="flex items-center gap-2">
        <Button 
          size="sm"
          variant={activeTab === 'materials' ? "default" : "outline"}
          onClick={() => setActiveTab('materials')}
          className={`gap-1.5 font-semibold text-xs h-9 ${
            activeTab === 'materials' ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'border-slate-700 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Package className="size-3.5" /> Materials Stock ({materials.length})
        </Button>
        <Button 
          size="sm"
          variant={activeTab === 'suppliers' ? "default" : "outline"}
          onClick={() => setActiveTab('suppliers')}
          className={`gap-1.5 font-semibold text-xs h-9 ${
            activeTab === 'suppliers' ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'border-slate-700 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Truck className="size-3.5" /> Suppliers ({suppliers.length})
        </Button>
        <Button 
          size="sm"
          variant={activeTab === 'purchases' ? "default" : "outline"}
          onClick={() => setActiveTab('purchases')}
          className={`gap-1.5 font-semibold text-xs h-9 ${
            activeTab === 'purchases' ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'border-slate-700 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <ShoppingBag className="size-3.5" /> Purchase Log ({purchases.length})
        </Button>
      </div>

      {activeTab === 'materials' && (
        <Card className="bg-slate-900/70 border-slate-800 backdrop-blur-xl shadow-md text-slate-100 p-5">
          <div className="rounded-lg border border-slate-800 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-950/60">
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Material Name</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Unit</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Current Stock</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Reorder Threshold</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {materials.map((m) => (
                  <TableRow key={m.id} className="border-slate-800 hover:bg-slate-800/40">
                    <TableCell className="font-bold text-slate-100 text-xs sm:text-sm">{m.name}</TableCell>
                    <TableCell className="text-slate-300 text-xs font-semibold">{m.unit_code}</TableCell>
                    <TableCell className="font-extrabold text-emerald-400 text-xs sm:text-sm">{m.current_stock?.toLocaleString()} {m.unit_code}</TableCell>
                    <TableCell className="text-xs text-slate-400">{m.reorder_threshold ? `${m.reorder_threshold} ${m.unit_code}` : '-'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 bg-emerald-500/10 text-[10px] font-bold">
                        NORMAL
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {activeTab === 'suppliers' && (
        <Card className="bg-slate-900/70 border-slate-800 backdrop-blur-xl shadow-md text-slate-100 p-5">
          <div className="rounded-lg border border-slate-800 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-950/60">
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Supplier Code</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Supplier Name</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Phone</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Outstanding Payables</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.map((s) => (
                  <TableRow key={s.id} className="border-slate-800 hover:bg-slate-800/40">
                    <TableCell className="font-bold text-slate-100 text-xs sm:text-sm">{s.code}</TableCell>
                    <TableCell className="text-slate-200 font-medium text-xs sm:text-sm">{s.name}</TableCell>
                    <TableCell className="text-xs text-slate-400">{s.phone || '-'}</TableCell>
                    <TableCell className="font-bold text-rose-400 text-xs sm:text-sm">{formatINR(s.payable_balance_paise)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {activeTab === 'purchases' && (
        <Card className="bg-slate-900/70 border-slate-800 backdrop-blur-xl shadow-md text-slate-100 p-5">
          <div className="rounded-lg border border-slate-800 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-950/60">
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Purchase #</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Date</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Supplier</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Material</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Quantity</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Total Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchases.map((p) => (
                  <TableRow key={p.id} className="border-slate-800 hover:bg-slate-800/40">
                    <TableCell className="font-bold text-slate-100 text-xs sm:text-sm">{p.purchase_number}</TableCell>
                    <TableCell className="text-xs text-slate-400">{p.purchase_date}</TableCell>
                    <TableCell className="text-slate-200 font-medium text-xs sm:text-sm">{p.supplier_name}</TableCell>
                    <TableCell className="text-slate-300 text-xs">{p.material_name}</TableCell>
                    <TableCell className="text-xs text-slate-300 font-semibold">{p.quantity} {p.unit_code}</TableCell>
                    <TableCell className="font-bold text-white text-xs sm:text-sm">{formatINR(p.total_amount_paise)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Add Supplier Modal */}
      <Dialog open={isAddSupplierOpen} onOpenChange={setIsAddSupplierOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white">Add Supplier</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateSupplier} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-slate-400">Supplier Code</Label>
              <Input placeholder="e.g. SUPP-001" value={supplierForm.code || ''} onChange={e => setSupplierForm({ ...supplierForm, code: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-400">Supplier Name</Label>
              <Input placeholder="e.g. Bharat Coal Traders" value={supplierForm.name || ''} onChange={e => setSupplierForm({ ...supplierForm, name: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-400">Phone</Label>
              <Input placeholder="e.g. +91 9876543210" value={supplierForm.phone || ''} onChange={e => setSupplierForm({ ...supplierForm, phone: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2.5 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddSupplierOpen(false)} className="border-slate-700 hover:bg-slate-800">Cancel</Button>
              <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-bold">Save Supplier</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
