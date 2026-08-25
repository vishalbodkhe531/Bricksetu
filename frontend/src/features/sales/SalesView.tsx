import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Users } from 'lucide-react';
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

export const SalesView: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'sales' | 'customers'>('sales');

  const [isNewCustomerOpen, setIsNewCustomerOpen] = useState(false);
  const [customerForm, setCustomerForm] = useState<any>({});

  useEffect(() => {
    loadSalesData();
  }, []);

  async function loadSalesData() {
    try {
      const [c, s] = await Promise.all([
        apiRequest('/customers'),
        apiRequest('/sales'),
      ]);
      setCustomers(c);
      setSales(s);
    } catch (err: any) {
      console.error(err);
    }
  }

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/customers', {
        method: 'POST',
        body: JSON.stringify(customerForm),
      });
      setIsNewCustomerOpen(false);
      setCustomerForm({});
      loadSalesData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Customers & Brick Sales"
        description="Customer accounts, sales orders, automatic FIFO stock deduction, and receivables"
        icon={<ShoppingCart className="size-5 sm:size-6" />}
        actions={
          <Button 
            onClick={() => setIsNewCustomerOpen(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold gap-2 h-10 px-4 shadow-lg shadow-orange-500/20 text-xs sm:text-sm"
          >
            <Plus className="size-4" /> Add Customer
          </Button>
        }
      />

      {/* Tabs */}
      <div className="flex items-center gap-2">
        <Button 
          size="sm"
          variant={activeTab === 'sales' ? "default" : "outline"}
          onClick={() => setActiveTab('sales')}
          className={`gap-1.5 font-semibold text-xs h-9 ${
            activeTab === 'sales' ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'border-slate-700 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <ShoppingCart className="size-3.5" /> Brick Sales Register ({sales.length})
        </Button>
        <Button 
          size="sm"
          variant={activeTab === 'customers' ? "default" : "outline"}
          onClick={() => setActiveTab('customers')}
          className={`gap-1.5 font-semibold text-xs h-9 ${
            activeTab === 'customers' ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'border-slate-700 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Users className="size-3.5" /> Customer Accounts ({customers.length})
        </Button>
      </div>

      {activeTab === 'sales' && (
        <Card className="bg-slate-900/70 border-slate-800 backdrop-blur-xl shadow-md text-slate-100 p-5">
          <div className="rounded-lg border border-slate-800 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-950/60">
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Sale #</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Date</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Customer</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Brick Type & Grade</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Quantity</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Unit Rate</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Total Amount</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Payment Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map((s) => (
                  <TableRow key={s.id} className="border-slate-800 hover:bg-slate-800/40">
                    <TableCell className="font-bold text-slate-100 text-xs sm:text-sm">{s.sale_number}</TableCell>
                    <TableCell className="text-xs text-slate-400">{s.sale_date}</TableCell>
                    <TableCell className="text-slate-200 font-medium text-xs sm:text-sm">{s.customer_name}</TableCell>
                    <TableCell className="text-slate-300 text-xs">{s.brick_type_name} ({s.brick_grade_name})</TableCell>
                    <TableCell className="text-xs text-slate-300 font-semibold">{s.quantity?.toLocaleString()}</TableCell>
                    <TableCell className="text-xs text-slate-400">{formatINR(s.unit_price_paise)} / brick</TableCell>
                    <TableCell className="font-bold text-white text-xs sm:text-sm">{formatINR(s.total_amount_paise)}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={`${
                          s.payment_status === 'PAID' ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10' :
                          s.payment_status === 'PARTIALLY_PAID' ? 'border-blue-500/40 text-blue-400 bg-blue-500/10' :
                          'border-amber-500/40 text-amber-400 bg-amber-500/10'
                        } text-[10px] font-bold`}
                      >
                        {s.payment_status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {activeTab === 'customers' && (
        <Card className="bg-slate-900/70 border-slate-800 backdrop-blur-xl shadow-md text-slate-100 p-5">
          <div className="rounded-lg border border-slate-800 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-950/60">
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Code</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Customer Name</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Phone</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Address</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Outstanding Receivables</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((c) => (
                  <TableRow key={c.id} className="border-slate-800 hover:bg-slate-800/40">
                    <TableCell className="font-bold text-slate-100 text-xs sm:text-sm">{c.code}</TableCell>
                    <TableCell className="text-slate-200 font-medium text-xs sm:text-sm">{c.name}</TableCell>
                    <TableCell className="text-slate-400 text-xs">{c.phone || '-'}</TableCell>
                    <TableCell className="text-slate-400 text-xs">{c.address || '-'}</TableCell>
                    <TableCell className="font-extrabold text-blue-400 text-xs sm:text-sm">{formatINR(c.receivable_balance_paise)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Add Customer Modal */}
      <Dialog open={isNewCustomerOpen} onOpenChange={setIsNewCustomerOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white">Add Customer Profile</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateCustomer} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-slate-400">Customer Code</Label>
              <Input placeholder="e.g. CUST-005" value={customerForm.code || ''} onChange={e => setCustomerForm({ ...customerForm, code: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-400">Customer Name</Label>
              <Input placeholder="e.g. Acme Builders" value={customerForm.name || ''} onChange={e => setCustomerForm({ ...customerForm, name: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-slate-400">Phone</Label>
                <Input value={customerForm.phone || ''} onChange={e => setCustomerForm({ ...customerForm, phone: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-400">Address</Label>
                <Input value={customerForm.address || ''} onChange={e => setCustomerForm({ ...customerForm, address: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end gap-2.5 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsNewCustomerOpen(false)} className="border-slate-700 hover:bg-slate-800">Cancel</Button>
              <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-bold">Save Customer</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
