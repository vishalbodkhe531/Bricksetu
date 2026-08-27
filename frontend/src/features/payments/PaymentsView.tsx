import React, { useState, useEffect } from 'react';
import { Wallet, DollarSign, ArrowUpRight, ArrowDownRight, AlertCircle } from 'lucide-react';
import { apiRequest } from '../../shared/api/client';
import { formatINR } from '../../shared/utils/formatters';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PageHeader } from '../../shared/components/PageHeader';
import { EmptyState } from '../../shared/components/EmptyState';

export const PaymentsView: React.FC = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [isAllocateOpen, setIsAllocateOpen] = useState(false);
  const [allocateError, setAllocateError] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [unpaidCharges, setUnpaidCharges] = useState<any[]>([]);
  const [allocationsForm, setAllocationsForm] = useState<Record<string, string>>({});

  useEffect(() => { loadFinanceData(); }, []);

  async function loadFinanceData() {
    try {
      const [pmts, exps] = await Promise.all([apiRequest('/payments'), apiRequest('/expenses')]);
      setPayments(pmts); setExpenses(exps);
    } catch (err: any) { console.error(err); }
  }

  const openAllocationModal = async (payment: any) => {
    setSelectedPayment(payment);
    setAllocateError('');
    try {
      const charges = await apiRequest(`/payments/unpaid-charges?party_type=${payment.party_type}&party_id=${payment.party_id}`);
      setUnpaidCharges(charges); setIsAllocateOpen(true);
    } catch (err: any) { setAllocateError(err.message || 'Failed to fetch unpaid charges'); }
  };

  const handleAllocationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayment) return;
    setAllocateError('');
    const allocations = Object.entries(allocationsForm).map(([charge_id, rupees]) => ({ charge_id, amount_paise: Math.round(parseFloat(rupees) * 100) })).filter(a => a.amount_paise > 0);
    if (allocations.length === 0) { setAllocateError('Please enter an allocation amount.'); return; }
    try {
      await apiRequest(`/payments/${selectedPayment.id}/allocations`, { method: 'POST', body: JSON.stringify({ allocations }) });
      setIsAllocateOpen(false); loadFinanceData();
    } catch (err: any) { setAllocateError(err.message || 'Allocation failed'); }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Payments & Operating Expenses" description="Incoming/outgoing money transfers, charge allocations, and expense logging" icon={<Wallet className="size-5 sm:size-6" />} />

      <Tabs defaultValue="payments" className="space-y-4">
        <TabsList className="bg-muted p-1 rounded-xl">
          <TabsTrigger value="payments" className="gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer">
            <Wallet className="size-3.5" /> Payments ({payments.length})
          </TabsTrigger>
          <TabsTrigger value="expenses" className="gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer">
            <DollarSign className="size-3.5" /> Operating Expenses ({expenses.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payments">
          <Card className="bg-card border-border shadow-xs text-card-foreground p-4 sm:p-5">
            <div className="rounded-lg border border-border overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Ref #</TableHead>
                    <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Date</TableHead>
                    <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Direction</TableHead>
                    <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Party Type</TableHead>
                    <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Amount</TableHead>
                    <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Unallocated Balance</TableHead>
                    <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.length === 0 ? (
                    <TableRow><TableCell colSpan={7}><EmptyState title="No payments logged" description="Use Quick Entry to record incoming or outgoing payments." /></TableCell></TableRow>
                  ) : payments.map((p) => (
                    <TableRow key={p.id} className="border-border hover:bg-muted/40">
                      <TableCell className="font-semibold text-foreground text-sm">{p.payment_number}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{p.payment_date}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] font-bold gap-1 ${p.direction === 'INBOUND' ? 'border-emerald-500/30 text-emerald-600 bg-emerald-500/10 dark:text-emerald-400' : 'border-rose-500/30 text-rose-600 bg-rose-500/10 dark:text-rose-400'}`}>
                          {p.direction === 'INBOUND' ? <ArrowDownRight className="size-3" /> : <ArrowUpRight className="size-3" />}
                          {p.direction}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-foreground font-medium">{p.party_type}</TableCell>
                      <TableCell className="font-bold text-foreground text-sm">{formatINR(p.amount_paise)}</TableCell>
                      <TableCell className="text-sm text-amber-600 dark:text-amber-400 font-semibold">{formatINR(p.unallocated_amount_paise)}</TableCell>
                      <TableCell className="text-right">
                        {p.unallocated_amount_paise > 0 && p.party_id && (
                          <Button size="sm" onClick={() => openAllocationModal(p)} className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs h-8 px-3 border-0 cursor-pointer">
                            Allocate
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="expenses">
          <Card className="bg-card border-border shadow-xs text-card-foreground p-4 sm:p-5">
            <div className="rounded-lg border border-border overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Expense #</TableHead>
                    <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Date</TableHead>
                    <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Category</TableHead>
                    <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Payee Name</TableHead>
                    <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.length === 0 ? (
                    <TableRow><TableCell colSpan={5}><EmptyState title="No expenses recorded" description="Use Quick Entry to log daily operating expenses." /></TableCell></TableRow>
                  ) : expenses.map((e) => (
                    <TableRow key={e.id} className="border-border hover:bg-muted/40">
                      <TableCell className="font-semibold text-foreground text-sm">{e.expense_number}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{e.expense_date}</TableCell>
                      <TableCell><Badge variant="outline" className="border-purple-500/30 text-purple-600 bg-purple-500/10 text-[10px] font-bold dark:text-purple-400">{e.category_name}</Badge></TableCell>
                      <TableCell className="text-sm text-foreground font-medium">{e.payee_name || '-'}</TableCell>
                      <TableCell className="font-bold text-rose-600 dark:text-rose-400 text-sm">{formatINR(e.amount_paise)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Charge Allocation Dialog */}
      <Dialog open={isAllocateOpen} onOpenChange={setIsAllocateOpen}>
        <DialogContent className="bg-card border-border text-card-foreground sm:max-w-[520px]">
          <DialogHeader><DialogTitle className="text-lg font-bold text-foreground">Allocate Payment to Invoices / Charges</DialogTitle></DialogHeader>
          {allocateError && (
            <Alert variant="destructive" className="my-2">
              <AlertCircle className="size-4" />
              <AlertDescription>{allocateError}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleAllocationSubmit} className="space-y-4">
            <div className="p-3 bg-muted/40 rounded-xl border border-border flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Unallocated Available:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">{formatINR(selectedPayment?.unallocated_amount_paise || 0)}</span>
            </div>

            <div className="space-y-2.5 max-h-[240px] overflow-y-auto pr-1">
              {unpaidCharges.length === 0 ? (
                <p className="text-xs text-muted-foreground italic text-center py-4">No pending unpaid charges found for this party.</p>
              ) : unpaidCharges.map((ch: any) => (
                <div key={ch.id} className="p-3 border border-border rounded-xl bg-card flex items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-foreground block">{ch.description || ch.charge_type}</span>
                    <span className="text-[10px] text-muted-foreground block">Due: {formatINR(ch.remaining_due_paise)}</span>
                  </div>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="₹ 0.00"
                    value={allocationsForm[ch.id] || ''}
                    onChange={e => setAllocationsForm({ ...allocationsForm, [ch.id]: e.target.value })}
                    className="w-32 bg-muted/30 border-border text-right text-xs"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setIsAllocateOpen(false)} className="border-border hover:bg-muted text-foreground cursor-pointer">Cancel</Button>
              <Button type="submit" disabled={unpaidCharges.length === 0} className="bg-orange-500 hover:bg-orange-600 text-white font-semibold border-0 cursor-pointer">Save Allocations</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
