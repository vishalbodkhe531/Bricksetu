import React, { useState, useEffect } from 'react';
import { Package, Plus, Truck, ShoppingBag, AlertCircle } from 'lucide-react';
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PageHeader } from '../../shared/components/PageHeader';
import { EmptyState } from '../../shared/components/EmptyState';

export const MaterialsView: React.FC = () => {
  const [materials, setMaterials] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [supplierError, setSupplierError] = useState('');
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
    setSupplierError('');
    try {
      await apiRequest('/suppliers', { method: 'POST', body: JSON.stringify(supplierForm) });
      setIsAddSupplierOpen(false); setSupplierForm({}); loadMaterialsData();
    } catch (err: any) { setSupplierError(err.message || 'Failed to add supplier'); }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Raw Materials & Supplier Procurement"
        description="Coal, soil, sawdust, and firewood inventory, supplier accounts, and purchase logs"
        icon={<Package className="size-5 sm:size-6" />}
        actions={
          <Button onClick={() => { setSupplierError(''); setIsAddSupplierOpen(true); }} className="bg-orange-500 hover:bg-orange-600 text-white font-bold gap-2 h-10 px-4 shadow-md shadow-orange-500/20 text-xs sm:text-sm border-0 cursor-pointer">
            <Plus className="size-4" /> Add Supplier
          </Button>
        }
      />

      <Tabs defaultValue="materials" className="space-y-4">
        <TabsList className="bg-muted p-1 rounded-xl">
          <TabsTrigger value="materials" className="gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer">
            <Package className="size-3.5" /> Materials ({materials.length})
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer">
            <Truck className="size-3.5" /> Suppliers ({suppliers.length})
          </TabsTrigger>
          <TabsTrigger value="purchases" className="gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer">
            <ShoppingBag className="size-3.5" /> Purchase Log ({purchases.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="materials">
          <Card className="bg-card border-border shadow-xs text-card-foreground p-4 sm:p-5">
            <div className="rounded-lg border border-border overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Material Name</TableHead>
                    <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Unit</TableHead>
                    <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Stock Quantity</TableHead>
                    <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {materials.length === 0 ? (
                    <TableRow><TableCell colSpan={4}><EmptyState title="No materials configured" description="System master materials list is empty." /></TableCell></TableRow>
                  ) : materials.map((m) => (
                    <TableRow key={m.id} className="border-border hover:bg-muted/40">
                      <TableCell className="font-semibold text-foreground text-sm">{m.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{m.unit}</TableCell>
                      <TableCell className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">{m.stock_quantity} {m.unit}</TableCell>
                      <TableCell><Badge variant="outline" className="border-emerald-500/30 text-emerald-600 bg-emerald-500/10 text-[10px] font-bold dark:text-emerald-400">ACTIVE</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="suppliers">
          <Card className="bg-card border-border shadow-xs text-card-foreground p-4 sm:p-5">
            <div className="rounded-lg border border-border overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Code</TableHead>
                    <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Supplier Name</TableHead>
                    <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Phone</TableHead>
                    <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Outstanding Payable</TableHead>
                    <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suppliers.length === 0 ? (
                    <TableRow><TableCell colSpan={5}><EmptyState title="No suppliers" description="Add vendor accounts to record material purchases." actionLabel="Add Supplier" onAction={() => { setSupplierError(''); setIsAddSupplierOpen(true); }} /></TableCell></TableRow>
                  ) : suppliers.map((s) => (
                    <TableRow key={s.id} className="border-border hover:bg-muted/40">
                      <TableCell className="font-semibold text-foreground text-sm">{s.code}</TableCell>
                      <TableCell className="text-foreground text-sm font-medium">{s.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{s.phone || '-'}</TableCell>
                      <TableCell className="font-bold text-rose-600 dark:text-rose-400 text-sm">{formatINR(s.payable_balance_paise)}</TableCell>
                      <TableCell><Badge variant="outline" className="border-emerald-500/30 text-emerald-600 bg-emerald-500/10 text-[10px] font-bold dark:text-emerald-400">ACTIVE</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="purchases">
          <Card className="bg-card border-border shadow-xs text-card-foreground p-4 sm:p-5">
            <div className="rounded-lg border border-border overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Invoice #</TableHead>
                    <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Supplier</TableHead>
                    <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Material</TableHead>
                    <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Date</TableHead>
                    <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Quantity</TableHead>
                    <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Total Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchases.length === 0 ? (
                    <TableRow><TableCell colSpan={6}><EmptyState title="No purchases recorded" description="Use Quick Entry to log material purchases." /></TableCell></TableRow>
                  ) : purchases.map((p) => (
                    <TableRow key={p.id} className="border-border hover:bg-muted/40">
                      <TableCell className="font-semibold text-foreground text-sm">{p.invoice_number}</TableCell>
                      <TableCell className="text-foreground text-sm font-medium">{p.supplier_name}</TableCell>
                      <TableCell className="text-sm text-foreground">{p.material_name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{p.purchase_date}</TableCell>
                      <TableCell className="text-sm font-semibold text-foreground">{p.quantity} {p.unit}</TableCell>
                      <TableCell className="font-bold text-foreground text-sm">{formatINR(p.total_amount_paise)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Supplier Dialog */}
      <Dialog open={isAddSupplierOpen} onOpenChange={setIsAddSupplierOpen}>
        <DialogContent className="bg-card border-border text-card-foreground sm:max-w-[480px]">
          <DialogHeader><DialogTitle className="text-lg font-bold text-foreground">Add Material Supplier</DialogTitle></DialogHeader>
          {supplierError && (
            <Alert variant="destructive" className="my-2">
              <AlertCircle className="size-4" />
              <AlertDescription>{supplierError}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleCreateSupplier} className="space-y-4">
            <div className="space-y-1.5"><Label className="text-muted-foreground text-xs font-semibold">Supplier Code</Label><Input placeholder="e.g. SUP-001" value={supplierForm.code || ''} onChange={e => setSupplierForm({ ...supplierForm, code: e.target.value })} required className="bg-muted/30 border-border" /></div>
            <div className="space-y-1.5"><Label className="text-muted-foreground text-xs font-semibold">Supplier Name / Business</Label><Input placeholder="e.g. Singrauli Coal Syndicate" value={supplierForm.name || ''} onChange={e => setSupplierForm({ ...supplierForm, name: e.target.value })} required className="bg-muted/30 border-border" /></div>
            <div className="space-y-1.5"><Label className="text-muted-foreground text-xs font-semibold">Phone Number</Label><Input placeholder="e.g. 9876543210" value={supplierForm.phone || ''} onChange={e => setSupplierForm({ ...supplierForm, phone: e.target.value })} className="bg-muted/30 border-border" /></div>
            <div className="space-y-1.5"><Label className="text-muted-foreground text-xs font-semibold">Address / Depot Location</Label><Input placeholder="e.g. Yard #4, Main Highway" value={supplierForm.address || ''} onChange={e => setSupplierForm({ ...supplierForm, address: e.target.value })} className="bg-muted/30 border-border" /></div>
            <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setIsAddSupplierOpen(false)} className="border-border hover:bg-muted text-foreground cursor-pointer">Cancel</Button>
              <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold border-0 cursor-pointer">Save Supplier</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
