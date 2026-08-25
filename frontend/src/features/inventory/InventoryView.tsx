import React, { useState, useEffect } from 'react';
import { Layers, Plus, History, Scale } from 'lucide-react';
import { apiRequest } from '../../shared/api/client';
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

export const InventoryView: React.FC = () => {
  const [stockLots, setStockLots] = useState<any[]>([]);
  const [ledger, setLedger] = useState<any[]>([]);
  const [masterData, setMasterData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'lots' | 'ledger'>('lots');

  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [adjustForm, setAdjustForm] = useState<any>({
    adjustment_type: 'DAMAGE',
    quantity: '',
    reason: '',
  });

  useEffect(() => {
    loadInventoryData();
  }, []);

  async function loadInventoryData() {
    try {
      const [lots, ledg, m] = await Promise.all([
        apiRequest('/inventory/lots'),
        apiRequest('/inventory/ledger'),
        apiRequest('/settings/master-data'),
      ]);
      setStockLots(lots);
      setLedger(ledg);
      setMasterData(m);
    } catch (err: any) {
      console.error(err);
    }
  }

  const handleAdjustmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/inventory/adjust', {
        method: 'POST',
        body: JSON.stringify({
          brick_type_id: adjustForm.brick_type_id,
          brick_grade_id: adjustForm.brick_grade_id,
          quantity_change: adjustForm.adjustment_type === 'DAMAGE' || adjustForm.adjustment_type === 'CORRECTION_MINUS' 
            ? -Math.abs(parseInt(adjustForm.quantity, 10))
            : Math.abs(parseInt(adjustForm.quantity, 10)),
          reason: `[${adjustForm.adjustment_type}] ${adjustForm.reason}`,
        }),
      });
      setIsAdjustOpen(false);
      setAdjustForm({ adjustment_type: 'DAMAGE', quantity: '', reason: '' });
      loadInventoryData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Finished Stock & Inventory Ledger"
        description="Monitor ready brick quantities by type & grade, audit movements, and record adjustments"
        icon={<Layers className="size-5 sm:size-6" />}
        actions={
          <Button 
            onClick={() => setIsAdjustOpen(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold gap-2 h-10 px-4 shadow-lg shadow-orange-500/20 text-xs sm:text-sm"
          >
            <Plus className="size-4" /> Stock Adjustment
          </Button>
        }
      />

      {/* Tabs */}
      <div className="flex items-center gap-2">
        <Button 
          size="sm"
          variant={activeTab === 'lots' ? "default" : "outline"}
          onClick={() => setActiveTab('lots')}
          className={`gap-1.5 font-semibold text-xs h-9 ${
            activeTab === 'lots' ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'border-slate-700 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Layers className="size-3.5" /> Stock Lots ({stockLots.length})
        </Button>
        <Button 
          size="sm"
          variant={activeTab === 'ledger' ? "default" : "outline"}
          onClick={() => setActiveTab('ledger')}
          className={`gap-1.5 font-semibold text-xs h-9 ${
            activeTab === 'ledger' ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'border-slate-700 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <History className="size-3.5" /> Audit Ledger ({ledger.length})
        </Button>
      </div>

      {activeTab === 'lots' && (
        <Card className="bg-slate-900/70 border-slate-800 backdrop-blur-xl shadow-md text-slate-100 p-5">
          <div className="rounded-lg border border-slate-800 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-950/60">
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Brick Type</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Grade</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Available Quantity</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Avg Unit Cost</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stockLots.map((lot) => (
                  <TableRow key={lot.id} className="border-slate-800 hover:bg-slate-800/40">
                    <TableCell className="font-bold text-slate-100 text-xs sm:text-sm">{lot.brick_type_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-amber-500/40 text-amber-400 bg-amber-500/10 text-[10px] font-bold">
                        {lot.brick_grade_name}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-extrabold text-emerald-400 text-xs sm:text-sm">
                      {lot.current_quantity?.toLocaleString()} bricks
                    </TableCell>
                    <TableCell className="text-xs text-slate-300">
                      ₹{(lot.avg_unit_cost_paise / 100).toFixed(2)} / brick
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 bg-emerald-500/10 text-[10px] font-bold">
                        IN_STOCK
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {activeTab === 'ledger' && (
        <Card className="bg-slate-900/70 border-slate-800 backdrop-blur-xl shadow-md text-slate-100 p-5">
          <div className="rounded-lg border border-slate-800 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-950/60">
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Date</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Type</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Brick Type & Grade</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Qty Change</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Balance After</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Reason / Reference</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ledger.map((item) => (
                  <TableRow key={item.id} className="border-slate-800 hover:bg-slate-800/40">
                    <TableCell className="text-xs text-slate-400">{item.transaction_date}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-blue-500/40 text-blue-400 bg-blue-500/10 text-[10px] font-bold">
                        {item.transaction_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-200 font-medium text-xs sm:text-sm">
                      {item.brick_type_name} ({item.brick_grade_name})
                    </TableCell>
                    <TableCell className={`font-bold text-xs sm:text-sm ${item.quantity_change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {item.quantity_change > 0 ? `+${item.quantity_change.toLocaleString()}` : item.quantity_change.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-xs text-slate-300 font-semibold">{item.balance_after?.toLocaleString()}</TableCell>
                    <TableCell className="text-xs text-slate-400">{item.reason || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Stock Adjustment Modal */}
      <Dialog open={isAdjustOpen} onOpenChange={setIsAdjustOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white">Record Stock Adjustment</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdjustmentSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-slate-400">Adjustment Type</Label>
              <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm dark:bg-slate-900/80 dark:border-slate-700/60 dark:text-slate-100 focus:outline-none" value={adjustForm.adjustment_type} onChange={e => setAdjustForm({ ...adjustForm, adjustment_type: e.target.value })} required>
                <option value="DAMAGE">Damage / Breakage (-)</option>
                <option value="CORRECTION_MINUS">Inventory Audit Correction (-)</option>
                <option value="CORRECTION_PLUS">Inventory Audit Addition (+)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-400">Brick Type</Label>
              <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm dark:bg-slate-900/80 dark:border-slate-700/60 dark:text-slate-100 focus:outline-none" value={adjustForm.brick_type_id || ''} onChange={e => setAdjustForm({ ...adjustForm, brick_type_id: e.target.value })} required>
                <option value="">-- Select Type --</option>
                {masterData?.brick_types?.map((t: any) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-400">Brick Grade</Label>
              <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm dark:bg-slate-900/80 dark:border-slate-700/60 dark:text-slate-100 focus:outline-none" value={adjustForm.brick_grade_id || ''} onChange={e => setAdjustForm({ ...adjustForm, brick_grade_id: e.target.value })} required>
                <option value="">-- Select Grade --</option>
                {masterData?.brick_grades?.map((g: any) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-400">Quantity (Bricks)</Label>
              <Input type="number" placeholder="e.g. 500" value={adjustForm.quantity} onChange={e => setAdjustForm({ ...adjustForm, quantity: e.target.value })} required />
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-400">Reason / Notes</Label>
              <Input placeholder="e.g. Broken during yard transit" value={adjustForm.reason} onChange={e => setAdjustForm({ ...adjustForm, reason: e.target.value })} required />
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAdjustOpen(false)} className="border-slate-700 hover:bg-slate-800">Cancel</Button>
              <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-bold">Commit Adjustment</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
