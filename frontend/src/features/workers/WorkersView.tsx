import React, { useState, useEffect } from 'react';
import { Users, UserPlus, DollarSign, Calculator, AlertCircle } from 'lucide-react';
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PageHeader } from '../../shared/components/PageHeader';
import { EmptyState } from '../../shared/components/EmptyState';

export const WorkersView: React.FC = () => {
  const [workers, setWorkers] = useState<any[]>([]);
  const [settlements, setSettlements] = useState<any[]>([]);
  const [isAddWorkerOpen, setIsAddWorkerOpen] = useState(false);
  const [isSettleOpen, setIsSettleOpen] = useState(false);
  const [addWorkerError, setAddWorkerError] = useState('');
  const [settleError, setSettleError] = useState('');
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
    setAddWorkerError('');
    try {
      await apiRequest('/workers', { method: 'POST', body: JSON.stringify({ ...workerForm, rate_per_1000_paise: Math.round(parseFloat(workerForm.rate_rupees || '0') * 100) }) });
      setIsAddWorkerOpen(false); setWorkerForm({}); loadWorkerData();
    } catch (err: any) { setAddWorkerError(err.message || 'Failed to add worker'); }
  };

  const handleGenerateSettlement = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettleError('');
    try {
      await apiRequest('/settlements/generate', { method: 'POST', body: JSON.stringify(settleForm) });
      setIsSettleOpen(false); loadWorkerData();
    } catch (err: any) { setSettleError(err.message || 'Failed to generate settlement'); }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Worker Roster & Weekly Settlements"
        description="Paji worker teams, piece-rate moulding wages, advances, and weekly balance settlements"
        icon={<Users className="size-5 sm:size-6" />}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={() => { setSettleError(''); setIsSettleOpen(true); }} className="border-border text-foreground hover:bg-muted font-semibold gap-1.5 h-10 px-3.5 text-xs sm:text-sm cursor-pointer">
              <Calculator className="size-4 text-orange-500 dark:text-orange-400" /> Weekly Settlement
            </Button>
            <Button onClick={() => { setAddWorkerError(''); setIsAddWorkerOpen(true); }} className="bg-orange-500 hover:bg-orange-600 text-white font-bold gap-2 h-10 px-4 shadow-md shadow-orange-500/20 text-xs sm:text-sm border-0 cursor-pointer">
              <UserPlus className="size-4" /> Add Worker
            </Button>
          </div>
        }
      />

      <Tabs defaultValue="workers" className="space-y-4">
        <TabsList className="bg-muted p-1 rounded-xl">
          <TabsTrigger value="workers" className="gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer">
            <Users className="size-3.5" /> Worker Directory ({workers.length})
          </TabsTrigger>
          <TabsTrigger value="settlements" className="gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer">
            <DollarSign className="size-3.5" /> Weekly Settlements ({settlements.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="workers">
          <Card className="bg-card border-border shadow-xs text-card-foreground p-4 sm:p-5">
            <div className="rounded-lg border border-border overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Code</TableHead>
                    <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Worker Name</TableHead>
                    <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Role</TableHead>
                    <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Moulding Rate / 1k</TableHead>
                    <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Outstanding Due</TableHead>
                    <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workers.length === 0 ? (
                    <TableRow><TableCell colSpan={6}><EmptyState title="No workers added" description="Add workers to track moulding logs and settlements." actionLabel="Add Worker" onAction={() => { setAddWorkerError(''); setIsAddWorkerOpen(true); }} /></TableCell></TableRow>
                  ) : workers.map((w) => (
                    <TableRow key={w.id} className="border-border hover:bg-muted/40">
                      <TableCell className="font-semibold text-foreground text-sm">{w.code}</TableCell>
                      <TableCell className="text-foreground text-sm font-medium">{w.full_name}</TableCell>
                      <TableCell><Badge variant="outline" className="border-purple-500/30 text-purple-600 bg-purple-500/10 text-[10px] font-bold dark:text-purple-400">{w.role}</Badge></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{w.rate_per_1000_paise ? formatINR(w.rate_per_1000_paise) : '-'}</TableCell>
                      <TableCell className="font-bold text-rose-600 dark:text-rose-400 text-sm">{formatINR(w.payable_balance_paise)}</TableCell>
                      <TableCell><Badge variant="outline" className="border-emerald-500/30 text-emerald-600 bg-emerald-500/10 text-[10px] font-bold dark:text-emerald-400">ACTIVE</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="settlements">
          <Card className="bg-card border-border shadow-xs text-card-foreground p-4 sm:p-5">
            <div className="rounded-lg border border-border overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Settlement #</TableHead>
                    <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Worker</TableHead>
                    <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Period</TableHead>
                    <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Total Bricks</TableHead>
                    <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Gross Amount</TableHead>
                    <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Net Due</TableHead>
                    <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {settlements.length === 0 ? (
                    <TableRow><TableCell colSpan={7}><EmptyState title="No settlements" description="Generate weekly settlements to see results here." /></TableCell></TableRow>
                  ) : settlements.map((s) => (
                    <TableRow key={s.id} className="border-border hover:bg-muted/40">
                      <TableCell className="font-semibold text-foreground text-sm">{s.settlement_number}</TableCell>
                      <TableCell className="text-foreground text-sm font-medium">{s.worker_name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{s.period_start_date} to {s.period_end_date}</TableCell>
                      <TableCell className="text-sm text-foreground font-semibold">{s.total_bricks?.toLocaleString()}</TableCell>
                      <TableCell className="text-sm text-foreground">{formatINR(s.gross_amount_paise)}</TableCell>
                      <TableCell className="font-bold text-rose-600 dark:text-rose-400 text-sm">{formatINR(s.remaining_due_paise)}</TableCell>
                      <TableCell><Badge variant="outline" className="border-emerald-500/30 text-emerald-600 bg-emerald-500/10 text-[10px] font-bold dark:text-emerald-400">{s.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Worker Dialog */}
      <Dialog open={isAddWorkerOpen} onOpenChange={setIsAddWorkerOpen}>
        <DialogContent className="bg-card border-border text-card-foreground sm:max-w-[480px]">
          <DialogHeader><DialogTitle className="text-lg font-bold text-foreground">Add Worker / Paji</DialogTitle></DialogHeader>
          {addWorkerError && (
            <Alert variant="destructive" className="my-2">
              <AlertCircle className="size-4" />
              <AlertDescription>{addWorkerError}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleCreateWorker} className="space-y-4">
            <div className="space-y-1.5"><Label className="text-muted-foreground text-xs font-semibold">Worker Code</Label><Input placeholder="e.g. WRK-001" value={workerForm.code || ''} onChange={e => setWorkerForm({ ...workerForm, code: e.target.value })} required className="bg-muted/30 border-border" /></div>
            <div className="space-y-1.5"><Label className="text-muted-foreground text-xs font-semibold">Full Name</Label><Input placeholder="e.g. Ramesh Kumar" value={workerForm.full_name || ''} onChange={e => setWorkerForm({ ...workerForm, full_name: e.target.value })} required className="bg-muted/30 border-border" /></div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-xs font-semibold">Role</Label>
                <FormSelect value={workerForm.role || 'MOULDER'} onChange={e => setWorkerForm({ ...workerForm, role: e.target.value })}>
                  <option value="MOULDER">Moulder (Paji)</option><option value="LOADER">Kiln Loader</option><option value="UNLOADER">Unloader</option><option value="GENERAL">General Worker</option>
                </FormSelect>
              </div>
              <div className="space-y-1.5"><Label className="text-muted-foreground text-xs font-semibold">Moulding Rate (₹ / 1,000)</Label><Input type="number" step="0.01" placeholder="e.g. 650.00" value={workerForm.rate_rupees || ''} onChange={e => setWorkerForm({ ...workerForm, rate_rupees: e.target.value })} className="bg-muted/30 border-border" /></div>
            </div>
            <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setIsAddWorkerOpen(false)} className="border-border hover:bg-muted text-foreground cursor-pointer">Cancel</Button>
              <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold border-0 cursor-pointer">Save Worker</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Settle Dialog */}
      <Dialog open={isSettleOpen} onOpenChange={setIsSettleOpen}>
        <DialogContent className="bg-card border-border text-card-foreground sm:max-w-[480px]">
          <DialogHeader><DialogTitle className="text-lg font-bold text-foreground">Generate Weekly Settlement</DialogTitle></DialogHeader>
          {settleError && (
            <Alert variant="destructive" className="my-2">
              <AlertCircle className="size-4" />
              <AlertDescription>{settleError}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleGenerateSettlement} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs font-semibold">Select Worker</Label>
              <FormSelect value={settleForm.worker_id} onChange={e => setSettleForm({ ...settleForm, worker_id: e.target.value })} required>
                <option value="">-- Choose Worker --</option>
                {workers.map(w => (<option key={w.id} value={w.id}>{w.full_name} ({w.code})</option>))}
              </FormSelect>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5"><Label className="text-muted-foreground text-xs font-semibold">Period Start Date</Label><Input type="date" value={settleForm.period_start_date} onChange={e => setSettleForm({ ...settleForm, period_start_date: e.target.value })} required className="bg-muted/30 border-border" /></div>
              <div className="space-y-1.5"><Label className="text-muted-foreground text-xs font-semibold">Period End Date</Label><Input type="date" value={settleForm.period_end_date} onChange={e => setSettleForm({ ...settleForm, period_end_date: e.target.value })} required className="bg-muted/30 border-border" /></div>
            </div>
            <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setIsSettleOpen(false)} className="border-border hover:bg-muted text-foreground cursor-pointer">Cancel</Button>
              <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold border-0 cursor-pointer">Calculate Settlement</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
