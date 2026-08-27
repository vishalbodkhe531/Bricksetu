import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Users, AlertCircle } from 'lucide-react';
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

export const SalesView: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [isNewCustomerOpen, setIsNewCustomerOpen] = useState(false);
  const [customerError, setCustomerError] = useState('');
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
    setCustomerError('');
    try {
      await apiRequest('/customers', { method: 'POST', body: JSON.stringify(customerForm) });
      setIsNewCustomerOpen(false); setCustomerForm({}); loadSalesData();
    } catch (err: any) { setCustomerError(err.message || 'Failed to add customer'); }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers & Brick Sales"
        description="Customer accounts, sales orders, automatic FIFO stock deduction, and receivables"
        icon={<ShoppingCart className="size-5 sm:size-6" />}
        actions={
          <Button onClick={() => { setCustomerError(''); setIsNewCustomerOpen(true); }} className="bg-orange-500 hover:bg-orange-600 text-white font-bold gap-2 h-10 px-4 shadow-md shadow-orange-500/20 text-xs sm:text-sm border-0 cursor-pointer">
            <Plus className="size-4" /> Add Customer
          </Button>
        }
      />

      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList className="bg-muted p-1 rounded-xl">
          <TabsTrigger value="sales" className="gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer">
            <ShoppingCart className="size-3.5" /> Sales Register ({sales.length})
          </TabsTrigger>
          <TabsTrigger value="customers" className="gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer">
            <Users className="size-3.5" /> Customer Accounts ({customers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sales">
          <Card className="bg-card border-border shadow-xs text-card-foreground p-4 sm:p-5">
            <div className="rounded-lg border border-border overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Sale #</TableHead>
                    <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Date</TableHead>
                    <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Customer</TableHead>
                    <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Item</TableHead>
                    <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Quantity</TableHead>
                    <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Total Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.length === 0 ? (
                    <TableRow><TableCell colSpan={6}><EmptyState title="No sales recorded" description="Use Quick Entry to log daily brick sales." /></TableCell></TableRow>
                  ) : sales.map((s) => (
                    <TableRow key={s.id} className="border-border hover:bg-muted/40">
                      <TableCell className="font-semibold text-foreground text-sm">{s.sale_number}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{s.sale_date}</TableCell>
                      <TableCell className="text-foreground text-sm font-medium">{s.customer_name}</TableCell>
                      <TableCell className="text-sm text-foreground">{s.brick_type_name} ({s.brick_grade_name})</TableCell>
                      <TableCell className="text-sm font-semibold text-foreground">{s.quantity?.toLocaleString()} bricks</TableCell>
                      <TableCell className="font-bold text-foreground text-sm">{formatINR(s.total_amount_paise)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="customers">
          <Card className="bg-card border-border shadow-xs text-card-foreground p-4 sm:p-5">
            <div className="rounded-lg border border-border overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Code</TableHead>
                    <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Customer Name</TableHead>
                    <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Phone</TableHead>
                    <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Receivable Due</TableHead>
                    <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.length === 0 ? (
                    <TableRow><TableCell colSpan={5}><EmptyState title="No customers added" description="Add customer accounts to record brick dispatch." actionLabel="Add Customer" onAction={() => { setCustomerError(''); setIsNewCustomerOpen(true); }} /></TableCell></TableRow>
                  ) : customers.map((c) => (
                    <TableRow key={c.id} className="border-border hover:bg-muted/40">
                      <TableCell className="font-semibold text-foreground text-sm">{c.code}</TableCell>
                      <TableCell className="text-foreground text-sm font-medium">{c.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{c.phone || '-'}</TableCell>
                      <TableCell className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">{formatINR(c.receivable_balance_paise)}</TableCell>
                      <TableCell><Badge variant="outline" className="border-emerald-500/30 text-emerald-600 bg-emerald-500/10 text-[10px] font-bold dark:text-emerald-400">ACTIVE</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Customer Dialog */}
      <Dialog open={isNewCustomerOpen} onOpenChange={setIsNewCustomerOpen}>
        <DialogContent className="bg-card border-border text-card-foreground sm:max-w-[480px]">
          <DialogHeader><DialogTitle className="text-lg font-bold text-foreground">Add Customer Account</DialogTitle></DialogHeader>
          {customerError && (
            <Alert variant="destructive" className="my-2">
              <AlertCircle className="size-4" />
              <AlertDescription>{customerError}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleCreateCustomer} className="space-y-4">
            <div className="space-y-1.5"><Label className="text-muted-foreground text-xs font-semibold">Customer Code</Label><Input placeholder="e.g. CUST-001" value={customerForm.code || ''} onChange={e => setCustomerForm({ ...customerForm, code: e.target.value })} required className="bg-muted/30 border-border" /></div>
            <div className="space-y-1.5"><Label className="text-muted-foreground text-xs font-semibold">Customer / Company Name</Label><Input placeholder="e.g. Vikas Construction" value={customerForm.name || ''} onChange={e => setCustomerForm({ ...customerForm, name: e.target.value })} required className="bg-muted/30 border-border" /></div>
            <div className="space-y-1.5"><Label className="text-muted-foreground text-xs font-semibold">Phone Number</Label><Input placeholder="e.g. 9876543210" value={customerForm.phone || ''} onChange={e => setCustomerForm({ ...customerForm, phone: e.target.value })} className="bg-muted/30 border-border" /></div>
            <div className="space-y-1.5"><Label className="text-muted-foreground text-xs font-semibold">Delivery Address</Label><Input placeholder="e.g. Site #12, Civil Lines" value={customerForm.address || ''} onChange={e => setCustomerForm({ ...customerForm, address: e.target.value })} className="bg-muted/30 border-border" /></div>
            <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setIsNewCustomerOpen(false)} className="border-border hover:bg-muted text-foreground cursor-pointer">Cancel</Button>
              <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold border-0 cursor-pointer">Save Customer</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
