import React, { useState, useEffect } from 'react';
import { Flame, Package, ShoppingCart, Wallet, DollarSign, Truck } from 'lucide-react';
import { apiRequest } from '../api/client';
import { rupeesToPaise } from '../utils/formatters';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface QuickEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const QuickEntryModal: React.FC<QuickEntryModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState<'moulding' | 'purchase' | 'sale' | 'payment' | 'expense' | 'trip'>('moulding');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Master Data State
  const [batches, setBatches] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [brickTypes, setBrickTypes] = useState<any[]>([]);
  const [brickGrades, setBrickGrades] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);

  // Form Fields
  const [form, setForm] = useState<any>({
    date: new Date().toISOString().slice(0, 10),
  });

  useEffect(() => {
    if (isOpen) {
      loadMasterData();
    }
  }, [isOpen]);

  async function loadMasterData() {
    try {
      const [b, w, s, m, c, master, v] = await Promise.all([
        apiRequest('/batches'),
        apiRequest('/workers'),
        apiRequest('/suppliers'),
        apiRequest('/materials'),
        apiRequest('/customers'),
        apiRequest('/settings/master-data'),
        apiRequest('/transport/vehicles'),
      ]);
      setBatches(b.filter((item: any) => item.stage === 'MOULDING' && item.status === 'IN_PROGRESS'));
      setWorkers(w.filter((item: any) => item.is_active));
      setSuppliers(s.filter((item: any) => item.is_active));
      setMaterials(m.filter((item: any) => item.is_active));
      setCustomers(c.filter((item: any) => item.is_active));
      setBrickTypes(master.brick_types);
      setBrickGrades(master.brick_grades);
      setPaymentMethods(master.payment_methods);
      setExpenseCategories(master.expense_categories);
      setVehicles(v);
    } catch (err: any) {
      console.error(err);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (activeTab === 'moulding') {
        await apiRequest('/production/moulding-logs', {
          method: 'POST',
          body: JSON.stringify({
            batch_id: form.batch_id,
            worker_id: form.worker_id,
            work_date: form.date,
            bricks_moulded: parseInt(form.bricks_moulded, 10),
            notes: form.notes,
          }),
        });
      } else if (activeTab === 'purchase') {
        await apiRequest('/purchases', {
          method: 'POST',
          body: JSON.stringify({
            supplier_id: form.supplier_id,
            material_id: form.material_id,
            purchase_date: form.date,
            quantity: parseFloat(form.quantity),
            unit_price_paise: rupeesToPaise(parseFloat(form.unit_price)),
            notes: form.notes,
          }),
        });
      } else if (activeTab === 'sale') {
        await apiRequest('/sales', {
          method: 'POST',
          body: JSON.stringify({
            customer_id: form.customer_id,
            brick_type_id: form.brick_type_id,
            brick_grade_id: form.brick_grade_id,
            sale_date: form.date,
            quantity: parseInt(form.quantity, 10),
            unit_price_paise: rupeesToPaise(parseFloat(form.unit_price)),
            vehicle_id: form.vehicle_id || null,
            notes: form.notes,
          }),
        });
      } else if (activeTab === 'payment') {
        await apiRequest('/payments', {
          method: 'POST',
          body: JSON.stringify({
            direction: form.direction,
            party_type: form.party_type,
            party_id: form.party_id || null,
            payment_date: form.date,
            amount_paise: rupeesToPaise(parseFloat(form.amount)),
            payment_method_id: form.payment_method_id,
            reference_number: form.reference_number,
            notes: form.notes,
          }),
        });
      } else if (activeTab === 'expense') {
        await apiRequest('/expenses', {
          method: 'POST',
          body: JSON.stringify({
            category_id: form.category_id,
            batch_id: form.batch_id || null,
            expense_date: form.date,
            amount_paise: rupeesToPaise(parseFloat(form.amount)),
            payee_name: form.payee_name,
            payment_method_id: form.payment_method_id,
            notes: form.notes,
          }),
        });
      } else if (activeTab === 'trip') {
        await apiRequest('/transport/trips', {
          method: 'POST',
          body: JSON.stringify({
            vehicle_id: form.vehicle_id,
            batch_id: form.batch_id || null,
            trip_date: form.date,
            origin: form.origin,
            destination: form.destination,
            distance_km: form.distance_km ? parseFloat(form.distance_km) : null,
            cost_paise: rupeesToPaise(parseFloat(form.cost)),
            notes: form.notes,
          }),
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Operation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[560px] bg-slate-900 border-slate-800 text-slate-100">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-xl font-bold tracking-tight text-white">Quick Daily Entry</DialogTitle>
        </DialogHeader>

        {/* Action Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 mb-2 border-b border-slate-800">
          {[
            { id: 'moulding', label: 'Moulding', icon: Flame },
            { id: 'purchase', label: 'Purchase', icon: Package },
            { id: 'sale', label: 'Sale', icon: ShoppingCart },
            { id: 'payment', label: 'Payment', icon: Wallet },
            { id: 'expense', label: 'Expense', icon: DollarSign },
            { id: 'trip', label: 'Trip', icon: Truck },
          ].map(t => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <Button
                key={t.id}
                type="button"
                size="sm"
                variant={active ? "default" : "outline"}
                className={`gap-1.5 text-xs font-semibold shrink-0 ${
                  active 
                    ? 'bg-orange-500 hover:bg-orange-600 text-white border-transparent' 
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
                onClick={() => { setActiveTab(t.id as any); setError(''); }}
              >
                <Icon className="size-3.5" /> {t.label}
              </Button>
            );
          })}
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 px-3.5 py-2.5 rounded-md text-xs font-medium mb-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1">
            <Label className="text-slate-400">Date</Label>
            <Input type="date" value={form.date || ''} onChange={e => setForm({ ...form, date: e.target.value })} required />
          </div>

          {activeTab === 'moulding' && (
            <>
              <div className="space-y-1">
                <Label className="text-slate-400">Batch</Label>
                <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm dark:bg-slate-900/80 dark:border-slate-700/60 dark:text-slate-100 focus:outline-none" value={form.batch_id || ''} onChange={e => setForm({ ...form, batch_id: e.target.value })} required>
                  <option value="">-- Select Active Moulding Batch --</option>
                  {batches.map(b => (
                    <option key={b.id} value={b.id}>{b.batch_number} ({b.brick_type_name})</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-slate-400">Worker</Label>
                <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm dark:bg-slate-900/80 dark:border-slate-700/60 dark:text-slate-100 focus:outline-none" value={form.worker_id || ''} onChange={e => setForm({ ...form, worker_id: e.target.value })} required>
                  <option value="">-- Select Worker --</option>
                  {workers.map(w => (
                    <option key={w.id} value={w.id}>{w.full_name} ({w.code})</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-slate-400">Bricks Moulded (Count)</Label>
                <Input type="number" placeholder="e.g. 1500" value={form.bricks_moulded || ''} onChange={e => setForm({ ...form, bricks_moulded: e.target.value })} required min="1" />
              </div>
            </>
          )}

          {activeTab === 'purchase' && (
            <>
              <div className="space-y-1">
                <Label className="text-slate-400">Supplier</Label>
                <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm dark:bg-slate-900/80 dark:border-slate-700/60 dark:text-slate-100 focus:outline-none" value={form.supplier_id || ''} onChange={e => setForm({ ...form, supplier_id: e.target.value })} required>
                  <option value="">-- Select Supplier --</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-slate-400">Material</Label>
                <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm dark:bg-slate-900/80 dark:border-slate-700/60 dark:text-slate-100 focus:outline-none" value={form.material_id || ''} onChange={e => setForm({ ...form, material_id: e.target.value })} required>
                  <option value="">-- Select Material --</option>
                  {materials.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.unit_code})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-slate-400">Quantity</Label>
                  <Input type="number" step="0.001" placeholder="e.g. 10.5" value={form.quantity || ''} onChange={e => setForm({ ...form, quantity: e.target.value })} required />
                </div>
                <div className="space-y-1">
                  <Label className="text-slate-400">Unit Price (₹)</Label>
                  <Input type="number" step="0.01" placeholder="e.g. 1200" value={form.unit_price || ''} onChange={e => setForm({ ...form, unit_price: e.target.value })} required />
                </div>
              </div>
            </>
          )}

          {activeTab === 'sale' && (
            <>
              <div className="space-y-1">
                <Label className="text-slate-400">Customer</Label>
                <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm dark:bg-slate-900/80 dark:border-slate-700/60 dark:text-slate-100 focus:outline-none" value={form.customer_id || ''} onChange={e => setForm({ ...form, customer_id: e.target.value })} required>
                  <option value="">-- Select Customer --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-slate-400">Brick Type</Label>
                  <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm dark:bg-slate-900/80 dark:border-slate-700/60 dark:text-slate-100 focus:outline-none" value={form.brick_type_id || ''} onChange={e => setForm({ ...form, brick_type_id: e.target.value })} required>
                    <option value="">-- Type --</option>
                    {brickTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-slate-400">Brick Grade</Label>
                  <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm dark:bg-slate-900/80 dark:border-slate-700/60 dark:text-slate-100 focus:outline-none" value={form.brick_grade_id || ''} onChange={e => setForm({ ...form, brick_grade_id: e.target.value })} required>
                    <option value="">-- Grade --</option>
                    {brickGrades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-slate-400">Quantity (Bricks)</Label>
                  <Input type="number" placeholder="e.g. 5000" value={form.quantity || ''} onChange={e => setForm({ ...form, quantity: e.target.value })} required min="1" />
                </div>
                <div className="space-y-1">
                  <Label className="text-slate-400">Unit Rate (₹ / Brick)</Label>
                  <Input type="number" step="0.01" placeholder="e.g. 8.50" value={form.unit_price || ''} onChange={e => setForm({ ...form, unit_price: e.target.value })} required />
                </div>
              </div>
            </>
          )}

          {activeTab === 'payment' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-slate-400">Direction</Label>
                  <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm dark:bg-slate-900/80 dark:border-slate-700/60 dark:text-slate-100 focus:outline-none" value={form.direction || 'INCOMING'} onChange={e => setForm({ ...form, direction: e.target.value })}>
                    <option value="INCOMING">INCOMING (Received)</option>
                    <option value="OUTGOING">OUTGOING (Paid)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-slate-400">Party Type</Label>
                  <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm dark:bg-slate-900/80 dark:border-slate-700/60 dark:text-slate-100 focus:outline-none" value={form.party_type || 'CUSTOMER'} onChange={e => setForm({ ...form, party_type: e.target.value })}>
                    <option value="CUSTOMER">Customer</option>
                    <option value="SUPPLIER">Supplier</option>
                    <option value="WORKER">Worker</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-slate-400">Amount (₹)</Label>
                <Input type="number" step="0.01" placeholder="e.g. 25000" value={form.amount || ''} onChange={e => setForm({ ...form, amount: e.target.value })} required />
              </div>
              <div className="space-y-1">
                <Label className="text-slate-400">Payment Method</Label>
                <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm dark:bg-slate-900/80 dark:border-slate-700/60 dark:text-slate-100 focus:outline-none" value={form.payment_method_id || ''} onChange={e => setForm({ ...form, payment_method_id: e.target.value })} required>
                  <option value="">-- Select Payment Method --</option>
                  {paymentMethods.map(pm => <option key={pm.id} value={pm.id}>{pm.name}</option>)}
                </select>
              </div>
            </>
          )}

          {activeTab === 'expense' && (
            <>
              <div className="space-y-1">
                <Label className="text-slate-400">Category</Label>
                <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm dark:bg-slate-900/80 dark:border-slate-700/60 dark:text-slate-100 focus:outline-none" value={form.category_id || ''} onChange={e => setForm({ ...form, category_id: e.target.value })} required>
                  <option value="">-- Select Category --</option>
                  {expenseCategories.map(ec => <option key={ec.id} value={ec.id}>{ec.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-slate-400">Amount (₹)</Label>
                  <Input type="number" step="0.01" placeholder="e.g. 4500" value={form.amount || ''} onChange={e => setForm({ ...form, amount: e.target.value })} required />
                </div>
                <div className="space-y-1">
                  <Label className="text-slate-400">Payment Method</Label>
                  <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm dark:bg-slate-900/80 dark:border-slate-700/60 dark:text-slate-100 focus:outline-none" value={form.payment_method_id || ''} onChange={e => setForm({ ...form, payment_method_id: e.target.value })} required>
                    <option value="">-- Method --</option>
                    {paymentMethods.map(pm => <option key={pm.id} value={pm.id}>{pm.name}</option>)}
                  </select>
                </div>
              </div>
            </>
          )}

          {activeTab === 'trip' && (
            <>
              <div className="space-y-1">
                <Label className="text-slate-400">Vehicle</Label>
                <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm dark:bg-slate-900/80 dark:border-slate-700/60 dark:text-slate-100 focus:outline-none" value={form.vehicle_id || ''} onChange={e => setForm({ ...form, vehicle_id: e.target.value })} required>
                  <option value="">-- Select Vehicle --</option>
                  {vehicles.map(v => <option key={v.id} value={v.id}>{v.registration_number} ({v.driver_name})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-slate-400">Trip Cost (₹)</Label>
                  <Input type="number" step="0.01" placeholder="e.g. 1500" value={form.cost || ''} onChange={e => setForm({ ...form, cost: e.target.value })} required />
                </div>
                <div className="space-y-1">
                  <Label className="text-slate-400">Distance (KM)</Label>
                  <Input type="number" step="0.1" placeholder="e.g. 45" value={form.distance_km || ''} onChange={e => setForm({ ...form, distance_km: e.target.value })} />
                </div>
              </div>
            </>
          )}

          <div className="space-y-1">
            <Label className="text-slate-400">Notes (Optional)</Label>
            <Input type="text" placeholder="Additional details..." value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} />
          </div>

          <div className="flex justify-end gap-2.5 pt-3">
            <Button type="button" variant="outline" onClick={onClose} className="border-slate-700 hover:bg-slate-800">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-orange-500 hover:bg-orange-600 text-white font-semibold">
              {loading ? 'Saving...' : 'Submit Entry'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
