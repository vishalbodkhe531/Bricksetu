import React, { useState, useEffect } from 'react';
import { Users, UserPlus, DollarSign, Calculator } from 'lucide-react';
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

export const WorkersView: React.FC = () => {
  const [workers, setWorkers] = useState<any[]>([]);
  const [settlements, setSettlements] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'workers' | 'settlements'>('workers');

  const [isAddWorkerOpen, setIsAddWorkerOpen] = useState(false);
  const [isSettleOpen, setIsSettleOpen] = useState(false);

  const [workerForm, setWorkerForm] = useState<any>({});
  const [settleForm, setSettleForm] = useState<any>({
    worker_id: '',
    period_start_date: '',
    period_end_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadWorkerData();
  }, []);

  async function loadWorkerData() {
    try {
      const [w, s] = await Promise.all([
        apiRequest('/workers'),
        apiRequest('/settlements'),
      ]);
      setWorkers(w);
      setSettlements(s);
    } catch (err: any) {
      console.error(err);
    }
  }

  const handleCreateWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/workers', {
        method: 'POST',
        body: JSON.stringify({
          ...workerForm,
          rate_per_1000_paise: Math.round(parseFloat(workerForm.rate_rupees || '0') * 100),
        }),
      });
      setIsAddWorkerOpen(false);
      setWorkerForm({});
      loadWorkerData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleGenerateSettlement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/settlements/generate', {
        method: 'POST',
        body: JSON.stringify(settleForm),
      });
      setIsSettleOpen(false);
      loadWorkerData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Worker Roster & Weekly Settlements"
        description="Paji worker teams, piece-rate moulding wages, advances, and weekly balance settlements"
        icon={<Users className="size-5 sm:size-6" />}
        actions={
          <div className="flex items-center gap-2">
            <Button 
              variant="outline"
              onClick={() => setIsSettleOpen(true)}
              className="border-slate-700 text-slate-200 hover:bg-slate-800 font-semibold gap-1.5 h-10 px-3.5 text-xs sm:text-sm"
            >
              <Calculator className="size-4 text-orange-400" /> Weekly Settlement
            </Button>
            <Button 
              onClick={() => setIsAddWorkerOpen(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold gap-2 h-10 px-4 shadow-lg shadow-orange-500/20 text-xs sm:text-sm"
            >
              <UserPlus className="size-4" /> Add Worker
            </Button>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex items-center gap-2">
        <Button 
          size="sm"
          variant={activeTab === 'workers' ? "default" : "outline"}
          onClick={() => setActiveTab('workers')}
          className={`gap-1.5 font-semibold text-xs h-9 ${
            activeTab === 'workers' ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'border-slate-700 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Users className="size-3.5" /> Worker Directory ({workers.length})
        </Button>
        <Button 
          size="sm"
          variant={activeTab === 'settlements' ? "default" : "outline"}
          onClick={() => setActiveTab('settlements')}
          className={`gap-1.5 font-semibold text-xs h-9 ${
            activeTab === 'settlements' ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'border-slate-700 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <DollarSign className="size-3.5" /> Weekly Settlements ({settlements.length})
        </Button>
      </div>

      {activeTab === 'workers' && (
        <Card className="bg-slate-900/70 border-slate-800 backdrop-blur-xl shadow-md text-slate-100 p-5">
          <div className="rounded-lg border border-slate-800 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-950/60">
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Code</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Worker Name</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Role</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Moulding Rate / 1k</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Outstanding Due</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workers.map((w) => (
                  <TableRow key={w.id} className="border-slate-800 hover:bg-slate-800/40">
                    <TableCell className="font-bold text-slate-100 text-xs sm:text-sm">{w.code}</TableCell>
                    <TableCell className="text-slate-200 font-medium text-xs sm:text-sm">{w.full_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-purple-500/40 text-purple-400 bg-purple-500/10 text-[10px] font-bold">
                        {w.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-slate-300">
                      {w.rate_per_1000_paise ? formatINR(w.rate_per_1000_paise) : '-'}
                    </TableCell>
                    <TableCell className="font-bold text-rose-400 text-xs sm:text-sm">
                      {formatINR(w.payable_balance_paise)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 bg-emerald-500/10 text-[10px] font-bold">
                        ACTIVE
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {activeTab === 'settlements' && (
        <Card className="bg-slate-900/70 border-slate-800 backdrop-blur-xl shadow-md text-slate-100 p-5">
          <div className="rounded-lg border border-slate-800 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-950/60">
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Settlement #</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Worker</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Period</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Total Bricks</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Gross Amount</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Net Due</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {settlements.map((s) => (
                  <TableRow key={s.id} className="border-slate-800 hover:bg-slate-800/40">
                    <TableCell className="font-bold text-slate-100 text-xs sm:text-sm">{s.settlement_number}</TableCell>
                    <TableCell className="text-slate-200 font-medium text-xs sm:text-sm">{s.worker_name}</TableCell>
                    <TableCell className="text-xs text-slate-400">{s.period_start_date} to {s.period_end_date}</TableCell>
                    <TableCell className="text-xs text-slate-300 font-semibold">{s.total_bricks?.toLocaleString()}</TableCell>
                    <TableCell className="text-xs text-slate-300">{formatINR(s.gross_amount_paise)}</TableCell>
                    <TableCell className="font-bold text-rose-400 text-xs sm:text-sm">{formatINR(s.remaining_due_paise)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 bg-emerald-500/10 text-[10px] font-bold">
                        {s.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Add Worker Modal */}
      <Dialog open={isAddWorkerOpen} onOpenChange={setIsAddWorkerOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white">Add Worker / Paji</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateWorker} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-slate-400">Worker Code</Label>
              <Input placeholder="e.g. WRK-001" value={workerForm.code || ''} onChange={e => setWorkerForm({ ...workerForm, code: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-400">Full Name</Label>
              <Input placeholder="e.g. Ramesh Kumar" value={workerForm.full_name || ''} onChange={e => setWorkerForm({ ...workerForm, full_name: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-slate-400">Role</Label>
                <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm dark:bg-slate-900/80 dark:border-slate-700/60 dark:text-slate-100 focus:outline-none" value={workerForm.role || 'MOULDER'} onChange={e => setWorkerForm({ ...workerForm, role: e.target.value })}>
                  <option value="MOULDER">Moulder (Paji)</option>
                  <option value="LOADER">Kiln Loader</option>
                  <option value="UNLOADER">Unloader</option>
                  <option value="GENERAL">General Worker</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-400">Moulding Rate (₹ / 1,000)</Label>
                <Input type="number" step="0.01" placeholder="e.g. 650.00" value={workerForm.rate_rupees || ''} onChange={e => setWorkerForm({ ...workerForm, rate_rupees: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end gap-2.5 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddWorkerOpen(false)} className="border-slate-700 hover:bg-slate-800">Cancel</Button>
              <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-bold">Save Worker</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Weekly Settlement Modal */}
      <Dialog open={isSettleOpen} onOpenChange={setIsSettleOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white">Generate Weekly Settlement</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleGenerateSettlement} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-slate-400">Select Worker</Label>
              <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm dark:bg-slate-900/80 dark:border-slate-700/60 dark:text-slate-100 focus:outline-none" value={settleForm.worker_id} onChange={e => setSettleForm({ ...settleForm, worker_id: e.target.value })} required>
                <option value="">-- Choose Worker --</option>
                {workers.map(w => (
                  <option key={w.id} value={w.id}>{w.full_name} ({w.code})</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-slate-400">Period Start Date</Label>
                <Input type="date" value={settleForm.period_start_date} onChange={e => setSettleForm({ ...settleForm, period_start_date: e.target.value })} required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-400">Period End Date</Label>
                <Input type="date" value={settleForm.period_end_date} onChange={e => setSettleForm({ ...settleForm, period_end_date: e.target.value })} required />
              </div>
            </div>
            <div className="flex justify-end gap-2.5 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsSettleOpen(false)} className="border-slate-700 hover:bg-slate-800">Cancel</Button>
              <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-bold">Calculate Settlement</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
