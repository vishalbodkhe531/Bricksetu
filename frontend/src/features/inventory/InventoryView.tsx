import React, { useState, useEffect } from 'react';
import { Layers, Plus, History } from 'lucide-react';
import { apiRequest } from '../../shared/api/client';
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
import { FormSelect } from '@/components/ui/form-select';
import { PageHeader } from '../../shared/components/PageHeader';
import { EmptyState } from '../../shared/components/EmptyState';

export const InventoryView: React.FC = () => {
  const [stockLots, setStockLots] = useState<any[]>([]);
  const [ledger, setLedger] = useState<any[]>([]);
  const [masterData, setMasterData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'lots' | 'ledger'>('lots');

  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [adjustForm, setAdjustForm] = useState<any>({ adjustment_type: 'DAMAGE', quantity: '', reason: '' });

  useEffect(() => { loadInventoryData(); }, []);

  async function loadInventoryData() {
    try {
      const [lots, ledg, m] = await Promise.all([
        apiRequest('/inventory/lots'), apiRequest('/inventory/ledger'), apiRequest('/settings/master-data'),
      ]);
      setStockLots(lots); setLedger(ledg); setMasterData(m);
    } catch (err: any) { console.error(err); }
  }

  const handleAdjustmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/inventory/adjust', {
        method: 'POST',
        body: JSON.stringify({
          brick_type_id: adjustForm.brick_type_id, brick_grade_id: adjustForm.brick_grade_id,
          quantity_change: adjustForm.adjustment_type === 'DAMAGE' || adjustForm.adjustment_type === 'CORRECTION_MINUS'
            ? -Math.abs(parseInt(adjustForm.quantity, 10)) : Math.abs(parseInt(adjustForm.quantity, 10)),
          reason: `[${adjustForm.adjustment_type}] ${adjustForm.reason}`,
        }),
      });
      setIsAdjustOpen(false);
      setAdjustForm({ adjustment_type: 'DAMAGE', quantity: '', reason: '' });
      loadInventoryData();
    } catch (err: any) { alert(err.message); }
  };

  const tabClasses = (active: boolean) => `gap-1.5 font-semibold text-xs h-8 cursor-pointer ${active ? 'bg-orange-500 hover:bg-orange-600 text-white border-transparent' : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground'}`;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Finished Stock & Inventory Ledger"
        description="Monitor ready brick quantities by type & grade, audit movements, and record adjustments"
        icon={<Layers className="size-5 sm:size-6" />}
        actions={
          <Button onClick={() => setIsAdjustOpen(true)} className="bg-orange-500 hover:bg-orange-600 text-white font-bold gap-2 h-10 px-4 shadow-md shadow-orange-500/20 text-xs sm:text-sm border-0 cursor-pointer">
            <Plus className="size-4" /> Stock Adjustment
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant={activeTab === 'lots' ? "default" : "outline"} onClick={() => setActiveTab('lots')} className={tabClasses(activeTab === 'lots')}>
          <Layers className="size-3.5" /> Stock Lots ({stockLots.length})
        </Button>
        <Button size="sm" variant={activeTab === 'ledger' ? "default" : "outline"} onClick={() => setActiveTab('ledger')} className={tabClasses(activeTab === 'ledger')}>
          <History className="size-3.5" /> Audit Ledger ({ledger.length})
        </Button>
      </div>

      {activeTab === 'lots' && (
        <Card className="bg-card border-border shadow-xs text-card-foreground p-5">
          <div className="rounded-lg border border-border overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Brick Type</TableHead>
                  <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Grade</TableHead>
                  <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Available Quantity</TableHead>
                  <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Avg Unit Cost</TableHead>
                  <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stockLots.length === 0 ? (
                  <TableRow><TableCell colSpan={5}><EmptyState title="No stock lots" description="Stock will appear after batch unloading or opening balance setup." /></TableCell></TableRow>
                ) : stockLots.map((lot) => (
                  <TableRow key={lot.id} className="border-border hover:bg-muted/40">
                    <TableCell className="font-semibold text-foreground text-sm">{lot.brick_type_name}</TableCell>
                    <TableCell><Badge variant="outline" className="border-amber-500/30 text-amber-600 bg-amber-500/10 text-[10px] font-bold dark:text-amber-400">{lot.brick_grade_name}</Badge></TableCell>
                    <TableCell className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">{lot.current_quantity?.toLocaleString()} bricks</TableCell>
                    <TableCell className="text-sm text-muted-foreground">₹{(lot.avg_unit_cost_paise / 100).toFixed(2)} / brick</TableCell>
                    <TableCell><Badge variant="outline" className="border-emerald-500/30 text-emerald-600 bg-emerald-500/10 text-[10px] font-bold dark:text-emerald-400">IN_STOCK</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {activeTab === 'ledger' && (
        <Card className="bg-card border-border shadow-xs text-card-foreground p-5">
          <div className="rounded-lg border border-border overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Date</TableHead>
                  <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Type</TableHead>
                  <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Brick Type & Grade</TableHead>
                  <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Qty Change</TableHead>
                  <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Balance After</TableHead>
                  <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Reason / Reference</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ledger.length === 0 ? (
                  <TableRow><TableCell colSpan={6}><EmptyState title="No ledger entries" description="Stock movements will appear here as transactions occur." /></TableCell></TableRow>
                ) : ledger.map((item) => (
                  <TableRow key={item.id} className="border-border hover:bg-muted/40">
                    <TableCell className="text-sm text-muted-foreground">{item.transaction_date}</TableCell>
                    <TableCell><Badge variant="outline" className="border-blue-500/30 text-blue-600 bg-blue-500/10 text-[10px] font-bold dark:text-blue-400">{item.transaction_type}</Badge></TableCell>
                    <TableCell className="text-foreground text-sm">{item.brick_type_name} ({item.brick_grade_name})</TableCell>
                    <TableCell className={`font-bold text-sm ${item.quantity_change >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {item.quantity_change > 0 ? `+${item.quantity_change.toLocaleString()}` : item.quantity_change.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm text-foreground font-semibold">{item.balance_after?.toLocaleString()}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{item.reason || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      <Dialog open={isAdjustOpen} onOpenChange={setIsAdjustOpen}>
        <DialogContent className="bg-card border-border text-card-foreground sm:max-w-[480px]">
          <DialogHeader><DialogTitle className="text-lg font-bold text-foreground">Record Stock Adjustment</DialogTitle></DialogHeader>
          <form onSubmit={handleAdjustmentSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">Adjustment Type</Label>
              <FormSelect value={adjustForm.adjustment_type} onChange={e => setAdjustForm({ ...adjustForm, adjustment_type: e.target.value })} required>
                <option value="DAMAGE">Damage / Breakage (-)</option>
                <option value="CORRECTION_MINUS">Inventory Audit Correction (-)</option>
                <option value="CORRECTION_PLUS">Inventory Audit Addition (+)</option>
              </FormSelect>
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">Brick Type</Label>
              <FormSelect value={adjustForm.brick_type_id || ''} onChange={e => setAdjustForm({ ...adjustForm, brick_type_id: e.target.value })} required>
                <option value="">-- Select Type --</option>
                {masterData?.brick_types?.map((t: any) => (<option key={t.id} value={t.id}>{t.name}</option>))}
              </FormSelect>
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">Brick Grade</Label>
              <FormSelect value={adjustForm.brick_grade_id || ''} onChange={e => setAdjustForm({ ...adjustForm, brick_grade_id: e.target.value })} required>
                <option value="">-- Select Grade --</option>
                {masterData?.brick_grades?.map((g: any) => (<option key={g.id} value={g.id}>{g.name}</option>))}
              </FormSelect>
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">Quantity (Bricks)</Label>
              <Input type="number" placeholder="e.g. 500" value={adjustForm.quantity} onChange={e => setAdjustForm({ ...adjustForm, quantity: e.target.value })} required className="bg-muted/30 border-border" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">Reason / Notes</Label>
              <Input placeholder="e.g. Broken during yard transit" value={adjustForm.reason} onChange={e => setAdjustForm({ ...adjustForm, reason: e.target.value })} required className="bg-muted/30 border-border" />
            </div>
            <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setIsAdjustOpen(false)} className="border-border hover:bg-muted text-foreground cursor-pointer">Cancel</Button>
              <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold cursor-pointer">Commit Adjustment</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
