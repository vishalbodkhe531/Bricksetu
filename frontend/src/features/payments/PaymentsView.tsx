import React, { useState, useEffect } from 'react';
import { Wallet, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';
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
import { PageHeader } from '../../shared/components/PageHeader';

export const PaymentsView: React.FC = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'payments' | 'expenses'>('payments');

  // Allocation modal
  const [isAllocateOpen, setIsAllocateOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [unpaidCharges, setUnpaidCharges] = useState<any[]>([]);
  const [allocationsForm, setAllocationsForm] = useState<Record<string, string>>({});

  useEffect(() => {
    loadFinanceData();
  }, []);

  async function loadFinanceData() {
    try {
      const [pmts, exps] = await Promise.all([
        apiRequest('/payments'),
        apiRequest('/expenses'),
      ]);
      setPayments(pmts);
      setExpenses(exps);
    } catch (err: any) {
      console.error(err);
    }
  }

  const openAllocationModal = async (payment: any) => {
    setSelectedPayment(payment);
    try {
      const charges = await apiRequest(`/payments/unpaid-charges?party_type=${payment.party_type}&party_id=${payment.party_id}`);
      setUnpaidCharges(charges);
      setIsAllocateOpen(true);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAllocationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayment) return;

    const allocations = Object.entries(allocationsForm)
      .map(([charge_id, rupees]) => ({
        charge_id,
        amount_paise: Math.round(parseFloat(rupees) * 100),
      }))
      .filter(a => a.amount_paise > 0);

    if (allocations.length === 0) {
      alert('Please enter allocation amount.');
      return;
    }

    try {
      await apiRequest(`/payments/${selectedPayment.id}/allocations`, {
        method: 'POST',
        body: JSON.stringify({ allocations }),
      });
      setIsAllocateOpen(false);
      loadFinanceData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Payments & Operating Expenses"
        description="Incoming/outgoing money transfers, charge allocations, and expense logging"
        icon={<Wallet className="size-5 sm:size-6" />}
      />

      {/* Tabs */}
      <div className="flex items-center gap-2">
        <Button 
          size="sm"
          variant={activeTab === 'payments' ? "default" : "outline"}
          onClick={() => setActiveTab('payments')}
          className={`gap-1.5 font-semibold text-xs h-9 ${
            activeTab === 'payments' ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'border-slate-700 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Wallet className="size-3.5" /> Payments Register ({payments.length})
        </Button>
        <Button 
          size="sm"
          variant={activeTab === 'expenses' ? "default" : "outline"}
          onClick={() => setActiveTab('expenses')}
          className={`gap-1.5 font-semibold text-xs h-9 ${
            activeTab === 'expenses' ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'border-slate-700 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <DollarSign className="size-3.5" /> Operating Expenses ({expenses.length})
        </Button>
      </div>

      {activeTab === 'payments' && (
        <Card className="bg-slate-900/70 border-slate-800 backdrop-blur-xl shadow-md text-slate-100 p-5">
          <div className="rounded-lg border border-slate-800 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-950/60">
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Payment #</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Date</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Direction</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Party</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Amount</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Allocated</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Method</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((p) => {
                  const unallocatedPaise = BigInt(p.amount_paise) - BigInt(p.allocated_amount_paise);
                  return (
                    <TableRow key={p.id} className="border-slate-800 hover:bg-slate-800/40">
                      <TableCell className="font-bold text-slate-100 text-xs sm:text-sm">{p.payment_number}</TableCell>
                      <TableCell className="text-xs text-slate-400">{p.payment_date}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`${
                            p.direction === 'INCOMING' ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10' : 'border-rose-500/40 text-rose-400 bg-rose-500/10'
                          } text-[10px] font-bold gap-1`}
                        >
                          {p.direction === 'INCOMING' ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />} {p.direction}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-200 text-xs font-medium">{p.party_name} ({p.party_type})</TableCell>
                      <TableCell className="font-bold text-white text-xs sm:text-sm">{formatINR(p.amount_paise)}</TableCell>
                      <TableCell className="text-xs text-slate-300">{formatINR(p.allocated_amount_paise)}</TableCell>
                      <TableCell className="text-xs text-slate-400">{p.payment_method_name}</TableCell>
                      <TableCell>
                        {unallocatedPaise > 0n && p.party_id && (
                          <Button size="xs" variant="outline" onClick={() => openAllocationModal(p)} className="border-slate-700 text-slate-300 hover:bg-slate-800 text-[11px]">
                            Allocate ({formatINR(unallocatedPaise.toString())})
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {activeTab === 'expenses' && (
        <Card className="bg-slate-900/70 border-slate-800 backdrop-blur-xl shadow-md text-slate-100 p-5">
          <div className="rounded-lg border border-slate-800 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-950/60">
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Date</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Category</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Payee Name</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Batch</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Amount</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Payment Method</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((e) => (
                  <TableRow key={e.id} className="border-slate-800 hover:bg-slate-800/40">
                    <TableCell className="text-xs text-slate-400">{e.expense_date}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-purple-500/40 text-purple-400 bg-purple-500/10 text-[10px] font-bold">
                        {e.category_name}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-200 font-medium text-xs sm:text-sm">{e.payee_name || '-'}</TableCell>
                    <TableCell className="text-slate-400 text-xs">{e.batch_number || 'General Overhead'}</TableCell>
                    <TableCell className="font-bold text-white text-xs sm:text-sm">{formatINR(e.amount_paise)}</TableCell>
                    <TableCell className="text-xs text-slate-400">{e.payment_method_name}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Payment Allocation Modal */}
      <Dialog open={isAllocateOpen} onOpenChange={setIsAllocateOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 sm:max-w-[500px]">
          {selectedPayment && (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-white">
                  Allocate Payment {selectedPayment.payment_number}
                </DialogTitle>
              </DialogHeader>
              <p className="text-xs text-slate-400">
                Unallocated Amount: <strong className="text-emerald-400">{formatINR((BigInt(selectedPayment.amount_paise) - BigInt(selectedPayment.allocated_amount_paise)).toString())}</strong>
              </p>

              <form onSubmit={handleAllocationSubmit} className="space-y-4 mt-2">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide">Open Unpaid Charges</h4>
                  {unpaidCharges.length === 0 ? (
                    <p className="text-xs text-slate-400 py-2">No open unpaid charges found for this party.</p>
                  ) : (
                    unpaidCharges.map(chg => (
                      <div key={chg.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/60 border border-slate-700/50 gap-3">
                        <div className="flex-1">
                          <strong className="text-xs text-slate-200 font-bold block">{chg.description}</strong>
                          <p className="text-[11px] text-slate-400 mt-0.5">Date: {chg.charge_date} | Due: {formatINR(chg.remaining_unpaid_paise)}</p>
                        </div>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={allocationsForm[chg.id] || ''}
                          onChange={e => setAllocationsForm({ ...allocationsForm, [chg.id]: e.target.value })}
                          className="w-28 text-right bg-slate-950/60 border-slate-700 text-xs"
                        />
                      </div>
                    ))
                  )}
                </div>

                <div className="flex justify-end gap-2.5 pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsAllocateOpen(false)} className="border-slate-700 hover:bg-slate-800">Cancel</Button>
                  <Button type="submit" disabled={unpaidCharges.length === 0} className="bg-orange-500 hover:bg-orange-600 text-white font-bold">Save Allocation</Button>
                </div>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
