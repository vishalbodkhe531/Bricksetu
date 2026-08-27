import React, { useState, useEffect } from 'react';
import { Users, UserPlus, DollarSign, Calculator } from 'lucide-react';
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
import { FormSelect } from '@/components/ui/form-select';
import { PageHeader } from '../../shared/components/PageHeader';
import { EmptyState } from '../../shared/components/EmptyState';

export const WorkersView: React.FC = () => {
  const [workers, setWorkers] = useState<any[]>([]);
  const [settlements, setSettlements] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'workers' | 'settlements'>('workers');
  const [isAddWorkerOpen, setIsAddWorkerOpen] = useState(false);
  const [isSettleOpen, setIsSettleOpen] = useState(false);
  const [workerForm, setWorkerForm] = useState<any>({});
  const [settleForm, setSettleForm] = useState<any>({ worker_id: '', period_start_date: '', period_end_date: new Date().toISOString().split('T')[0] });

  useEffect(() => { loadWorkerData(); }, []);

  async function loadWorkerData() {
    try {
      const [w, s] = await Promise.all([apiRequest('/workers'), apiRequest('/settlements')]);
      setWorkers(w); setSettlements(s);
    } catch (err: any) { console.error(err); }
  }

  const handleCreateWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/workers', { method: 'POST', body: JSON.stringify({ ...workerForm, rate_per_1000_paise: Math.round(parseFloat(workerForm.rate_rupees || '0') * 100) }) });
      setIsAddWorkerOpen(false); setWorkerForm({}); loadWorkerData();
    } catch (err: any) { alert(err.message); }
  };

  const handleGenerateSettlement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/settlements/generate', { method: 'POST', body: JSON.stringify(settleForm) });
      setIsSettleOpen(false); loadWorkerData();
    } catch (err: any) { alert(err.message); }
  };

  const tabClasses = (active: boolean) => `gap-1.5 font-semibold text-xs h-8 ${active ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-white'}`;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Worker Roster & Weekly Settlements"
        description="Paji worker teams, piece-rate moulding wages, advances, and weekly balance settlements"
        icon={<Users className="size-5 sm:size-6" />}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={() => setIsSettleOpen(true)} className="border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white font-semibold gap-1.5 h-10 px-3.5 text-xs sm:text-sm">
              <Calculator className="size-4 text-orange-400" /> Weekly Settlement
            </Button>
            <Button onClick={() => setIsAddWorkerOpen(true)} className="bg-orange-500 hover:bg-orange-600 text-white font-bold gap-2 h-10 px-4 shadow-lg shadow-orange-500/20 text-xs sm:text-sm">
              <UserPlus className="size-4" /> Add Worker
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant={activeTab === 'workers' ? "default" : "outline"} onClick={() => setActiveTab('workers')} className={tabClasses(activeTab === 'workers')}>
          <Users className="size-3.5" /> Worker Directory ({workers.length})
        </Button>
        <Button size="sm" variant={activeTab === 'settlements' ? "default" : "outline"} onClick={() => setActiveTab('settlements')} className={tabClasses(activeTab === 'settlements')}>
          <DollarSign className="size-3.5" /> Weekly Settlements ({settlements.length})
        </Button>
      </div>

      {activeTab === 'workers' && (
        <Card className="bg-slate-900/60 border-slate-800/60 backdrop-blur-sm shadow-sm text-slate-100 p-5">
          <div className="rounded-lg border border-slate-800/60 overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-950/40">
                <TableRow className="border-slate-800/60 hover:bg-transparent">
                  <TableHead className="text-slate-500 font-semibold uppercase text-[11px] tracking-wide">Code</TableHead>
                  <TableHead className="text-slate-500 font-semibold uppercase text-[11px] tracking-wide">Worker Name</TableHead>
                  <TableHead className="text-slate-500 font-semibold uppercase text-[11px] tracking-wide">Role</TableHead>
                  <TableHead className="text-slate-500 font-semibold uppercase text-[11px] tracking-wide">Moulding Rate / 1k</TableHead>
                  <TableHead className="text-slate-500 font-semibold uppercase text-[11px] tracking-wide">Outstanding Due</TableHead>
                  <TableHead className="text-slate-500 font-semibold uppercase text-[11px] tracking-wide">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workers.length === 0 ? (
                  <TableRow><TableCell colSpan={6}><EmptyState title="No workers added" description="Add workers to track moulding logs and settlements." actionLabel="Add Worker" onAction={() => setIsAddWorkerOpen(true)} /></TableCell></TableRow>
                ) : workers.map((w) => (
                  <TableRow key={w.id} className="border-slate-800/40 hover:bg-slate-800/30">
                    <TableCell className="font-semibold text-slate-200 text-sm">{w.code}</TableCell>
                    <TableCell className="text-slate-300 text-sm">{w.full_name}</TableCell>
                    <TableCell><Badge variant="outline" className="border-purple-500/30 text-purple-400 bg-purple-500/10 text-[10px] font-bold">{w.role}</Badge></TableCell>
                    <TableCell className="text-sm text-slate-400">{w.rate_per_1000_paise ? formatINR(w.rate_per_1000_paise) : '-'}</TableCell>
                    <TableCell className="font-bold text-rose-400 text-sm">{formatINR(w.payable_balance_paise)}</TableCell>
                    <TableCell><Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 text-[10px] font-bold">ACTIVE</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {activeTab === 'settlements' && (
        <Card className="bg-slate-900/60 border-slate-800/60 backdrop-blur-sm shadow-sm text-slate-100 p-5">
          <div className="rounded-lg border border-slate-800/60 overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-950/40">
                <TableRow className="border-slate-800/60 hover:bg-transparent">
                  <TableHead className="text-slate-500 font-semibold uppercase text-[11px] tracking-wide">Settlement #</TableHead>
                  <TableHead className="text-slate-500 font-semibold uppercase text-[11px] tracking-wide">Worker</TableHead>
                  <TableHead className="text-slate-500 font-semibold uppercase text-[11px] tracking-wide">Period</TableHead>
                  <TableHead className="text-slate-500 font-semibold uppercase text-[11px] tracking-wide">Total Bricks</TableHead>
                  <TableHead className="text-slate-500 font-semibold uppercase text-[11px] tracking-wide">Gross Amount</TableHead>
                  <TableHead className="text-slate-500 font-semibold uppercase text-[11px] tracking-wide">Net Due</TableHead>
                  <TableHead className="text-slate-500 font-semibold uppercase text-[11px] tracking-wide">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {settlements.length === 0 ? (
                  <TableRow><TableCell colSpan={7}><EmptyState title="No settlements" description="Generate weekly settlements to see results here." /></TableCell></TableRow>
                ) : settlements.map((s) => (
                  <TableRow key={s.id} className="border-slate-800/40 hover:bg-slate-800/30">
                    <TableCell className="font-semibold text-slate-200 text-sm">{s.settlement_number}</TableCell>
                    <TableCell className="text-slate-300 text-sm">{s.worker_name}</TableCell>
                    <TableCell className="text-sm text-slate-400">{s.period_start_date} to {s.period_end_date}</TableCell>
                    <TableCell className="text-sm text-slate-300 font-semibold">{s.total_bricks?.toLocaleString()}</TableCell>
                    <TableCell className="text-sm text-slate-300">{formatINR(s.gross_amount_paise)}</TableCell>
                    <TableCell className="font-bold text-rose-400 text-sm">{formatINR(s.remaining_due_paise)}</TableCell>
                    <TableCell><Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 text-[10px] font-bold">{s.status}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      <Dialog open={isAddWorkerOpen} onOpenChange={setIsAddWorkerOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 sm:max-w-[480px]">
          <DialogHeader><DialogTitle className="text-lg font-bold text-white">Add Worker / Paji</DialogTitle></DialogHeader>
          <form onSubmit={handleCreateWorker} className="space-y-4">
            <div className="space-y-1.5"><Label className="text-slate-400 text-xs">Worker Code</Label><Input placeholder="e.g. WRK-001" value={workerForm.code || ''} onChange={e => setWorkerForm({ ...workerForm, code: e.target.value })} required className="bg-slate-950/40 border-slate-700/60" /></div>
            <div className="space-y-1.5"><Label className="text-slate-400 text-xs">Full Name</Label><Input placeholder="e.g. Ramesh Kumar" value={workerForm.full_name || ''} onChange={e => setWorkerForm({ ...workerForm, full_name: e.target.value })} required className="bg-slate-950/40 border-slate-700/60" /></div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-slate-400 text-xs">Role</Label>
                <FormSelect value={workerForm.role || 'MOULDER'} onChange={e => setWorkerForm({ ...workerForm, role: e.target.value })}>
                  <option value="MOULDER">Moulder (Paji)</option><option value="LOADER">Kiln Loader</option><option value="UNLOADER">Unloader</option><option value="GENERAL">General Worker</option>
                </FormSelect>
              </div>
              <div className="space-y-1.5"><Label className="text-slate-400 text-xs">Moulding Rate (₹ / 1,000)</Label><Input type="number" step="0.01" placeholder="e.g. 650.00" value={workerForm.rate_rupees || ''} onChange={e => setWorkerForm({ ...workerForm, rate_rupees: e.target.value })} className="bg-slate-950/40 border-slate-700/60" /></div>
            </div>
            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800/40">
              <Button type="button" variant="outline" onClick={() => setIsAddWorkerOpen(false)} className="border-slate-700 hover:bg-slate-800 text-slate-300">Cancel</Button>
              <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold">Save Worker</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isSettleOpen} onOpenChange={setIsSettleOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 sm:max-w-[480px]">
          <DialogHeader><DialogTitle className="text-lg font-bold text-white">Generate Weekly Settlement</DialogTitle></DialogHeader>
          <form onSubmit={handleGenerateSettlement} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-slate-400 text-xs">Select Worker</Label>
              <FormSelect value={settleForm.worker_id} onChange={e => setSettleForm({ ...settleForm, worker_id: e.target.value })} required>
                <option value="">-- Choose Worker --</option>
                {workers.map(w => (<option key={w.id} value={w.id}>{w.full_name} ({w.code})</option>))}
              </FormSelect>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5"><Label className="text-slate-400 text-xs">Period Start Date</Label><Input type="date" value={settleForm.period_start_date} onChange={e => setSettleForm({ ...settleForm, period_start_date: e.target.value })} required className="bg-slate-950/40 border-slate-700/60" /></div>
              <div className="space-y-1.5"><Label className="text-slate-400 text-xs">Period End Date</Label><Input type="date" value={settleForm.period_end_date} onChange={e => setSettleForm({ ...settleForm, period_end_date: e.target.value })} required className="bg-slate-950/40 border-slate-700/60" /></div>
            </div>
            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800/40">
              <Button type="button" variant="outline" onClick={() => setIsSettleOpen(false)} className="border-slate-700 hover:bg-slate-800 text-slate-300">Cancel</Button>
              <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold">Calculate Settlement</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
