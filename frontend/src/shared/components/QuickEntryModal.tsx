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
import { FormSelect } from '@/components/ui/form-select';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { closeQuickEntry, triggerRefresh } from '@/store/slices/uiSlice';
import { fetchMasterData } from '@/store/slices/masterDataSlice';

interface QuickEntryModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
}

export const QuickEntryModal: React.FC<QuickEntryModalProps> = ({
  isOpen: propsIsOpen,
  onClose: propsOnClose,
  onSuccess: propsOnSuccess,
}) => {
  const dispatch = useAppDispatch();
  const reduxIsOpen = useAppSelector((state) => state.ui.isQuickEntryOpen);
  const isOpen = propsIsOpen !== undefined ? propsIsOpen : reduxIsOpen;

  const masterData = useAppSelector((state) => state.masterData);
  const {
    batches,
    workers,
    suppliers,
    materials,
    customers,
    brickTypes,
    brickGrades,
    paymentMethods,
    expenseCategories,
    vehicles,
    lastFetched,
  } = masterData;

  const [activeTab, setActiveTab] = useState<'moulding' | 'purchase' | 'sale' | 'payment' | 'expense' | 'trip'>('moulding');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form Fields
  const [form, setForm] = useState<any>({
    date: new Date().toISOString().slice(0, 10),
  });

  useEffect(() => {
    if (isOpen && !lastFetched) {
      dispatch(fetchMasterData());
    }
  }, [isOpen, lastFetched, dispatch]);

  const handleClose = () => {
    if (propsOnClose) {
      propsOnClose();
    } else {
      dispatch(closeQuickEntry());
    }
  };

  const handleSuccess = () => {
    if (propsOnSuccess) {
      propsOnSuccess();
    } else {
      dispatch(triggerRefresh());
      dispatch(closeQuickEntry());
    }
  };

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

      handleSuccess();
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Operation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[560px] bg-card border-border text-card-foreground">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-lg font-bold tracking-tight text-foreground">Quick Daily Entry</DialogTitle>
        </DialogHeader>

        {/* Action Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 mb-2 border-b border-border">
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
                className={`gap-1.5 text-xs font-semibold shrink-0 cursor-pointer ${
                  active 
                    ? 'bg-orange-500 hover:bg-orange-600 text-white border-transparent' 
                    : 'bg-transparent border-border text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
                onClick={() => { setActiveTab(t.id as any); setError(''); }}
              >
                <Icon className="size-3.5" /> {t.label}
              </Button>
            );
          })}
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 px-3.5 py-2.5 rounded-lg text-xs font-medium mb-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1.5">
            <Label className="text-slate-400 text-xs">Date</Label>
            <Input type="date" value={form.date || ''} onChange={e => setForm({ ...form, date: e.target.value })} required className="bg-slate-950/40 border-slate-700/60" />
          </div>

          {activeTab === 'moulding' && (
            <>
              <div className="space-y-1.5">
                <Label className="text-slate-400 text-xs">Batch</Label>
                <FormSelect value={form.batch_id || ''} onChange={e => setForm({ ...form, batch_id: e.target.value })} required>
                  <option value="">-- Select Active Moulding Batch --</option>
                  {batches.map(b => (
                    <option key={b.id} value={b.id}>{b.batch_number} ({b.brick_type_name})</option>
                  ))}
                </FormSelect>
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-400 text-xs">Worker</Label>
                <FormSelect value={form.worker_id || ''} onChange={e => setForm({ ...form, worker_id: e.target.value })} required>
                  <option value="">-- Select Worker --</option>
                  {workers.map(w => (
                    <option key={w.id} value={w.id}>{w.full_name} ({w.code})</option>
                  ))}
                </FormSelect>
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-400 text-xs">Bricks Moulded (Count)</Label>
                <Input type="number" placeholder="e.g. 1500" value={form.bricks_moulded || ''} onChange={e => setForm({ ...form, bricks_moulded: e.target.value })} required min="1" className="bg-slate-950/40 border-slate-700/60" />
              </div>
            </>
          )}

          {activeTab === 'purchase' && (
            <>
              <div className="space-y-1.5">
                <Label className="text-slate-400 text-xs">Supplier</Label>
                <FormSelect value={form.supplier_id || ''} onChange={e => setForm({ ...form, supplier_id: e.target.value })} required>
                  <option value="">-- Select Supplier --</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                </FormSelect>
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-400 text-xs">Material</Label>
                <FormSelect value={form.material_id || ''} onChange={e => setForm({ ...form, material_id: e.target.value })} required>
                  <option value="">-- Select Material --</option>
                  {materials.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.unit_code})</option>
                  ))}
                </FormSelect>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs">Quantity</Label>
                  <Input type="number" step="0.001" placeholder="e.g. 10.5" value={form.quantity || ''} onChange={e => setForm({ ...form, quantity: e.target.value })} required className="bg-slate-950/40 border-slate-700/60" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs">Unit Price (₹)</Label>
                  <Input type="number" step="0.01" placeholder="e.g. 1200" value={form.unit_price || ''} onChange={e => setForm({ ...form, unit_price: e.target.value })} required className="bg-slate-950/40 border-slate-700/60" />
                </div>
              </div>
            </>
          )}

          {activeTab === 'sale' && (
            <>
              <div className="space-y-1.5">
                <Label className="text-slate-400 text-xs">Customer</Label>
                <FormSelect value={form.customer_id || ''} onChange={e => setForm({ ...form, customer_id: e.target.value })} required>
                  <option value="">-- Select Customer --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                  ))}
                </FormSelect>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs">Brick Type</Label>
                  <FormSelect value={form.brick_type_id || ''} onChange={e => setForm({ ...form, brick_type_id: e.target.value })} required>
                    <option value="">-- Type --</option>
                    {brickTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </FormSelect>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs">Brick Grade</Label>
                  <FormSelect value={form.brick_grade_id || ''} onChange={e => setForm({ ...form, brick_grade_id: e.target.value })} required>
                    <option value="">-- Grade --</option>
                    {brickGrades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </FormSelect>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs">Quantity (Bricks)</Label>
                  <Input type="number" placeholder="e.g. 5000" value={form.quantity || ''} onChange={e => setForm({ ...form, quantity: e.target.value })} required min="1" className="bg-slate-950/40 border-slate-700/60" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs">Unit Rate (₹ / Brick)</Label>
                  <Input type="number" step="0.01" placeholder="e.g. 8.50" value={form.unit_price || ''} onChange={e => setForm({ ...form, unit_price: e.target.value })} required className="bg-slate-950/40 border-slate-700/60" />
                </div>
              </div>
            </>
          )}

          {activeTab === 'payment' && (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs">Direction</Label>
                  <FormSelect value={form.direction || 'INCOMING'} onChange={e => setForm({ ...form, direction: e.target.value })}>
                    <option value="INCOMING">INCOMING (Received)</option>
                    <option value="OUTGOING">OUTGOING (Paid)</option>
                  </FormSelect>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs">Party Type</Label>
                  <FormSelect value={form.party_type || 'CUSTOMER'} onChange={e => setForm({ ...form, party_type: e.target.value })}>
                    <option value="CUSTOMER">Customer</option>
                    <option value="SUPPLIER">Supplier</option>
                    <option value="WORKER">Worker</option>
                  </FormSelect>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-400 text-xs">Amount (₹)</Label>
                <Input type="number" step="0.01" placeholder="e.g. 25000" value={form.amount || ''} onChange={e => setForm({ ...form, amount: e.target.value })} required className="bg-slate-950/40 border-slate-700/60" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-400 text-xs">Payment Method</Label>
                <FormSelect value={form.payment_method_id || ''} onChange={e => setForm({ ...form, payment_method_id: e.target.value })} required>
                  <option value="">-- Select Payment Method --</option>
                  {paymentMethods.map(pm => <option key={pm.id} value={pm.id}>{pm.name}</option>)}
                </FormSelect>
              </div>
            </>
          )}

          {activeTab === 'expense' && (
            <>
              <div className="space-y-1.5">
                <Label className="text-slate-400 text-xs">Category</Label>
                <FormSelect value={form.category_id || ''} onChange={e => setForm({ ...form, category_id: e.target.value })} required>
                  <option value="">-- Select Category --</option>
                  {expenseCategories.map(ec => <option key={ec.id} value={ec.id}>{ec.name}</option>)}
                </FormSelect>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs">Amount (₹)</Label>
                  <Input type="number" step="0.01" placeholder="e.g. 4500" value={form.amount || ''} onChange={e => setForm({ ...form, amount: e.target.value })} required className="bg-slate-950/40 border-slate-700/60" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs">Payment Method</Label>
                  <FormSelect value={form.payment_method_id || ''} onChange={e => setForm({ ...form, payment_method_id: e.target.value })} required>
                    <option value="">-- Method --</option>
                    {paymentMethods.map(pm => <option key={pm.id} value={pm.id}>{pm.name}</option>)}
                  </FormSelect>
                </div>
              </div>
            </>
          )}

          {activeTab === 'trip' && (
            <>
              <div className="space-y-1.5">
                <Label className="text-slate-400 text-xs">Vehicle</Label>
                <FormSelect value={form.vehicle_id || ''} onChange={e => setForm({ ...form, vehicle_id: e.target.value })} required>
                  <option value="">-- Select Vehicle --</option>
                  {vehicles.map(v => <option key={v.id} value={v.id}>{v.registration_number} ({v.driver_name})</option>)}
                </FormSelect>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs">Trip Cost (₹)</Label>
                  <Input type="number" step="0.01" placeholder="e.g. 1500" value={form.cost || ''} onChange={e => setForm({ ...form, cost: e.target.value })} required className="bg-slate-950/40 border-slate-700/60" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs">Distance (KM)</Label>
                  <Input type="number" step="0.1" placeholder="e.g. 45" value={form.distance_km || ''} onChange={e => setForm({ ...form, distance_km: e.target.value })} className="bg-slate-950/40 border-slate-700/60" />
                </div>
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <Label className="text-slate-400 text-xs">Notes (Optional)</Label>
            <Input type="text" placeholder="Additional details..." value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} className="bg-slate-950/40 border-slate-700/60" />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800/40">
            <Button type="button" variant="outline" onClick={handleClose} className="border-slate-700 hover:bg-slate-800 text-slate-300">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-orange-500 hover:bg-orange-600 text-white font-semibold min-w-[120px]">
              {loading ? 'Saving...' : 'Submit Entry'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
