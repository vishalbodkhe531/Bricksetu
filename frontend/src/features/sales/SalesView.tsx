import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Users } from 'lucide-react';
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
import { PageHeader } from '../../shared/components/PageHeader';
import { EmptyState } from '../../shared/components/EmptyState';

export const SalesView: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'sales' | 'customers'>('sales');
  const [isNewCustomerOpen, setIsNewCustomerOpen] = useState(false);
  const [customerForm, setCustomerForm] = useState<any>({});

  useEffect(() => { loadSalesData(); }, []);

  async function loadSalesData() {
    try {
      const [c, s] = await Promise.all([apiRequest('/customers'), apiRequest('/sales')]);
      setCustomers(c); setSales(s);
    } catch (err: any) { console.error(err); }
  }

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/customers', { method: 'POST', body: JSON.stringify(customerForm) });
      setIsNewCustomerOpen(false); setCustomerForm({}); loadSalesData();
    } catch (err: any) { alert(err.message); }
  };

  const tabClasses = (active: boolean) => `gap-1.5 font-semibold text-xs h-8 cursor-pointer ${active ? 'bg-orange-500 hover:bg-orange-600 text-white border-transparent' : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground'}`;

  return (
    <div className="space-y-6">
      <PageHeader title="Customers & Brick Sales" description="Customer accounts, sales orders, automatic FIFO stock deduction, and receivables" icon={<ShoppingCart className="size-5 sm:size-6" />}
        actions={<Button onClick={() => setIsNewCustomerOpen(true)} className="bg-orange-500 hover:bg-orange-600 text-white font-bold gap-2 h-10 px-4 shadow-md shadow-orange-500/20 text-xs sm:text-sm border-0 cursor-pointer"><Plus className="size-4" /> Add Customer</Button>} />

      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant={activeTab === 'sales' ? "default" : "outline"} onClick={() => setActiveTab('sales')} className={tabClasses(activeTab === 'sales')}><ShoppingCart className="size-3.5" /> Sales Register ({sales.length})</Button>
        <Button size="sm" variant={activeTab === 'customers' ? "default" : "outline"} onClick={() => setActiveTab('customers')} className={tabClasses(activeTab === 'customers')}><Users className="size-3.5" /> Customer Accounts ({customers.length})</Button>
      </div>

      {activeTab === 'sales' && (
        <Card className="bg-card border-border shadow-xs text-card-foreground p-5">
          <div className="rounded-lg border border-border overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50"><TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Sale #</TableHead>
                <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Date</TableHead>
                <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Customer</TableHead>
                <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Brick Type & Grade</TableHead>
                <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Quantity</TableHead>
                <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Unit Rate</TableHead>
                <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Total Amount</TableHead>
                <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Payment Status</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {sales.length === 0 ? (<TableRow><TableCell colSpan={8}><EmptyState title="No sales recorded" description="Sales will appear here after recording via Quick Entry." /></TableCell></TableRow>) : sales.map((s) => (
                  <TableRow key={s.id} className="border-border hover:bg-muted/40">
                    <TableCell className="font-semibold text-foreground text-sm">{s.sale_number}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{s.sale_date}</TableCell>
                    <TableCell className="text-foreground text-sm">{s.customer_name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{s.brick_type_name} ({s.brick_grade_name})</TableCell>
                    <TableCell className="text-sm text-foreground font-semibold">{s.quantity?.toLocaleString()}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatINR(s.unit_price_paise)} / brick</TableCell>
                    <TableCell className="font-bold text-foreground text-sm">{formatINR(s.total_amount_paise)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${
                        s.payment_status === 'PAID' ? 'border-emerald-500/30 text-emerald-600 bg-emerald-500/10 dark:text-emerald-400' :
                        s.payment_status === 'PARTIALLY_PAID' ? 'border-blue-500/30 text-blue-600 bg-blue-500/10 dark:text-blue-400' :
                        'border-amber-500/30 text-amber-600 bg-amber-500/10 dark:text-amber-400'
                      } text-[10px] font-bold`}>{s.payment_status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {activeTab === 'customers' && (
        <Card className="bg-card border-border shadow-xs text-card-foreground p-5">
          <div className="rounded-lg border border-border overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50"><TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Code</TableHead>
                <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Customer Name</TableHead>
                <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Phone</TableHead>
                <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Address</TableHead>
                <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Outstanding Receivables</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {customers.length === 0 ? (<TableRow><TableCell colSpan={5}><EmptyState title="No customers added" actionLabel="Add Customer" onAction={() => setIsNewCustomerOpen(true)} /></TableCell></TableRow>) : customers.map((c) => (
                  <TableRow key={c.id} className="border-border hover:bg-muted/40">
                    <TableCell className="font-semibold text-foreground text-sm">{c.code}</TableCell>
                    <TableCell className="text-foreground text-sm">{c.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{c.phone || '-'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{c.address || '-'}</TableCell>
                    <TableCell className="font-bold text-blue-600 dark:text-blue-400 text-sm">{formatINR(c.receivable_balance_paise)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      <Dialog open={isNewCustomerOpen} onOpenChange={setIsNewCustomerOpen}>
        <DialogContent className="bg-card border-border text-card-foreground sm:max-w-[480px]">
          <DialogHeader><DialogTitle className="text-lg font-bold text-foreground">Add Customer Profile</DialogTitle></DialogHeader>
          <form onSubmit={handleCreateCustomer} className="space-y-4">
            <div className="space-y-1.5"><Label className="text-muted-foreground text-xs">Customer Code</Label><Input placeholder="e.g. CUST-005" value={customerForm.code || ''} onChange={e => setCustomerForm({ ...customerForm, code: e.target.value })} required className="bg-muted/30 border-border" /></div>
            <div className="space-y-1.5"><Label className="text-muted-foreground text-xs">Customer Name</Label><Input placeholder="e.g. Acme Builders" value={customerForm.name || ''} onChange={e => setCustomerForm({ ...customerForm, name: e.target.value })} required className="bg-muted/30 border-border" /></div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5"><Label className="text-muted-foreground text-xs">Phone</Label><Input value={customerForm.phone || ''} onChange={e => setCustomerForm({ ...customerForm, phone: e.target.value })} className="bg-muted/30 border-border" /></div>
              <div className="space-y-1.5"><Label className="text-muted-foreground text-xs">Address</Label><Input value={customerForm.address || ''} onChange={e => setCustomerForm({ ...customerForm, address: e.target.value })} className="bg-muted/30 border-border" /></div>
            </div>
            <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setIsNewCustomerOpen(false)} className="border-border hover:bg-muted text-foreground cursor-pointer">Cancel</Button>
              <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold cursor-pointer">Save Customer</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
