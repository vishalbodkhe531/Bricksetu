import React, { useState, useEffect } from 'react';
import { Flame, Plus, ChevronRight, ArrowRight } from 'lucide-react';
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
import { LoadingSpinner } from '../../shared/components/LoadingSpinner';
import { EmptyState } from '../../shared/components/EmptyState';

export const ProductionView: React.FC = () => {
  const [batches, setBatches] = useState<any[]>([]);
  const [masterData, setMasterData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isTransitionOpen, setIsTransitionOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<any>(null);

  const [createForm, setCreateForm] = useState<any>({});
  const [transitionForm, setTransitionForm] = useState<any>({
    from_stage: '', to_stage: '', input_quantity: '',
    good_quantity: '', damaged_quantity: '',
    transition_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [b, m] = await Promise.all([
        apiRequest('/batches'),
        apiRequest('/settings/master-data'),
      ]);
      setBatches(b);
      setMasterData(m);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/batches', { method: 'POST', body: JSON.stringify(createForm) });
      setIsCreateOpen(false);
      setCreateForm({});
      loadData();
    } catch (err: any) { alert(err.message); }
  };

  const openTransitionModal = (batch: any) => {
    setSelectedBatch(batch);
    setTransitionForm({
      from_stage: batch.current_stage, to_stage: getNextStage(batch.current_stage),
      input_quantity: batch.moulded_quantity || 0, good_quantity: batch.moulded_quantity || 0,
      damaged_quantity: 0, transition_date: new Date().toISOString().split('T')[0],
    });
    setIsTransitionOpen(true);
  };

  const getNextStage = (curr: string) => {
    const map: Record<string, string> = { MOULDING: 'DRYING', DRYING: 'KILN_LOADING', KILN_LOADING: 'FIRING', FIRING: 'UNLOADING', UNLOADING: 'COMPLETED' };
    return map[curr] || 'COMPLETED';
  };

  const handleTransitionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatch) return;
    try {
      await apiRequest(`/batches/${selectedBatch.id}/transition`, {
        method: 'POST',
        body: JSON.stringify({
          from_stage: transitionForm.from_stage, to_stage: transitionForm.to_stage,
          transition_date: transitionForm.transition_date,
          input_quantity: parseInt(transitionForm.input_quantity, 10),
          output_good_quantity: parseInt(transitionForm.good_quantity, 10),
          damaged_quantity: parseInt(transitionForm.damaged_quantity, 10),
          output_grade_id: transitionForm.to_stage === 'UNLOADING' ? transitionForm.output_grade_id : undefined,
        }),
      });
      setIsTransitionOpen(false);
      loadData();
    } catch (err: any) { alert(err.message); }
  };

  if (loading) return <LoadingSpinner label="Loading Production Data..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kiln Batches & Production"
        description="Track 5-stage lifecycle: Moulding → Drying → Kiln Loading → Firing → Unloading"
        icon={<Flame className="size-5 sm:size-6" />}
        actions={
          <Button onClick={() => setIsCreateOpen(true)} className="bg-orange-500 hover:bg-orange-600 text-white font-bold gap-2 h-10 px-4 shadow-lg shadow-orange-500/20 text-xs sm:text-sm">
            <Plus className="size-4" /> Start New Batch
          </Button>
        }
      />

      <Card className="bg-card border-border shadow-xs text-card-foreground p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-foreground">Active Production Batches</h3>
          <span className="text-[11px] text-muted-foreground">Total: {batches.length}</span>
        </div>

        <div className="rounded-lg border border-border overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Batch #</TableHead>
                <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Brick Type</TableHead>
                <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Current Stage</TableHead>
                <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Moulded Qty</TableHead>
                <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Fired Good Qty</TableHead>
                <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Status</TableHead>
                <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batches.length === 0 ? (
                <TableRow><TableCell colSpan={7}><EmptyState title="No batches created" description="Start a new batch to begin production tracking." actionLabel="Start Batch" onAction={() => setIsCreateOpen(true)} /></TableCell></TableRow>
              ) : batches.map((b) => (
                <TableRow key={b.id} className="border-border hover:bg-muted/40">
                  <TableCell className="font-semibold text-foreground text-sm">{b.batch_number}</TableCell>
                  <TableCell className="text-foreground text-sm">{b.brick_type_name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-orange-500/30 text-orange-600 bg-orange-500/10 text-[10px] font-bold dark:text-orange-400">{b.current_stage}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{b.moulded_quantity?.toLocaleString() || '-'}</TableCell>
                  <TableCell className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">{b.fired_good_quantity?.toLocaleString() || '-'}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`${b.status === 'COMPLETED' ? 'border-emerald-500/30 text-emerald-600 bg-emerald-500/10 dark:text-emerald-400' : 'border-amber-500/30 text-amber-600 bg-amber-500/10 dark:text-amber-400'} text-[10px] font-bold`}>{b.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {b.status === 'IN_PROGRESS' && (
                      <Button size="xs" onClick={() => openTransitionModal(b)} className="bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/25 gap-1 text-[11px] font-semibold cursor-pointer">
                        Transition <ChevronRight className="size-3" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Start New Batch Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="bg-card border-border text-card-foreground sm:max-w-[480px]">
          <DialogHeader><DialogTitle className="text-lg font-bold text-foreground">Start New Brick Batch</DialogTitle></DialogHeader>
          <form onSubmit={handleCreateBatch} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">Batch Number / Identifier</Label>
              <Input placeholder="e.g. BATCH-2026-08-A" value={createForm.batch_number || ''} onChange={e => setCreateForm({ ...createForm, batch_number: e.target.value })} required className="bg-muted/30 border-border" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">Brick Type</Label>
              <FormSelect value={createForm.brick_type_id || ''} onChange={e => setCreateForm({ ...createForm, brick_type_id: e.target.value })} required>
                <option value="">-- Select Brick Type --</option>
                {masterData?.brick_types?.map((t: any) => (<option key={t.id} value={t.id}>{t.name} ({t.code})</option>))}
              </FormSelect>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-xs">Moulding Start Date</Label>
                <Input type="date" value={createForm.start_date || new Date().toISOString().split('T')[0]} onChange={e => setCreateForm({ ...createForm, start_date: e.target.value })} required className="bg-muted/30 border-border" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-xs">Target Quantity</Label>
                <Input type="number" placeholder="e.g. 100000" value={createForm.target_quantity || ''} onChange={e => setCreateForm({ ...createForm, target_quantity: e.target.value })} className="bg-muted/30 border-border" />
              </div>
            </div>
            <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} className="border-border hover:bg-muted text-foreground cursor-pointer">Cancel</Button>
              <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold cursor-pointer">Initialize Batch</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Transition Stage Modal */}
      <Dialog open={isTransitionOpen} onOpenChange={setIsTransitionOpen}>
        <DialogContent className="bg-card border-border text-card-foreground sm:max-w-[480px]">
          <DialogHeader><DialogTitle className="text-lg font-bold text-foreground">Stage Transition: {selectedBatch?.batch_number}</DialogTitle></DialogHeader>
          <form onSubmit={handleTransitionSubmit} className="space-y-4">
            <div className="p-3 rounded-lg bg-muted/60 border border-border flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Current: <strong className="text-foreground">{transitionForm.from_stage}</strong></span>
              <ArrowRight className="size-4 text-orange-500 dark:text-orange-400" />
              <span className="text-muted-foreground">Next: <strong className="text-orange-500 dark:text-orange-400 font-bold">{transitionForm.to_stage}</strong></span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-xs">Transition Date</Label>
                <Input type="date" value={transitionForm.transition_date} onChange={e => setTransitionForm({ ...transitionForm, transition_date: e.target.value })} required className="bg-muted/30 border-border" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-xs">Input Qty</Label>
                <Input type="number" value={transitionForm.input_quantity} onChange={e => setTransitionForm({ ...transitionForm, input_quantity: e.target.value })} required className="bg-muted/30 border-border" />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-xs">Good Output Qty</Label>
                <Input type="number" value={transitionForm.good_quantity} onChange={e => setTransitionForm({ ...transitionForm, good_quantity: e.target.value })} required className="bg-muted/30 border-border" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-xs">Damaged / Wastage Qty</Label>
                <Input type="number" value={transitionForm.damaged_quantity} onChange={e => setTransitionForm({ ...transitionForm, damaged_quantity: e.target.value })} required className="bg-muted/30 border-border" />
              </div>
            </div>
            {transitionForm.to_stage === 'UNLOADING' && (
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-xs">Finished Output Grade</Label>
                <FormSelect value={transitionForm.output_grade_id || ''} onChange={e => setTransitionForm({ ...transitionForm, output_grade_id: e.target.value })} required>
                  <option value="">-- Select Grade --</option>
                  {masterData?.brick_grades?.map((g: any) => (<option key={g.id} value={g.id}>{g.name} ({g.code})</option>))}
                </FormSelect>
              </div>
            )}
            <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setIsTransitionOpen(false)} className="border-border hover:bg-muted text-foreground cursor-pointer">Cancel</Button>
              <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold cursor-pointer">Record Transition</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
