import React, { useState, useEffect } from 'react';
import { X, Flame, Package, ShoppingCart, Wallet, DollarSign, Truck } from 'lucide-react';
import { apiRequest } from '../api/client';
import { rupeesToPaise } from '../utils/formatters';

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

  if (!isOpen) return null;

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
    <div className="modal-overlay">
      <div className="modal-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Quick Daily Entry</h3>
          <button className="btn btn-secondary btn-sm" onClick={onClose}><X size={16} /></button>
        </div>

        {/* Action Tabs */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '16px' }}>
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
              <button
                key={t.id}
                type="button"
                className={`btn ${active ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                onClick={() => { setActiveTab(t.id as any); setError(''); }}
              >
                <Icon size={14} /> {t.label}
              </button>
            );
          })}
        </div>

        {error && (
          <div style={{ background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.3)', color: 'var(--accent-rose)', padding: '10px 14px', borderRadius: 'var(--radius-md)', marginBottom: '16px', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Date</label>
            <input type="date" className="form-input" value={form.date || ''} onChange={e => setForm({ ...form, date: e.target.value })} required />
          </div>

          {activeTab === 'moulding' && (
            <>
              <div className="form-group">
                <label className="form-label">Batch</label>
                <select className="form-select" value={form.batch_id || ''} onChange={e => setForm({ ...form, batch_id: e.target.value })} required>
                  <option value="">-- Select Active Moulding Batch --</option>
                  {batches.map(b => (
                    <option key={b.id} value={b.id}>{b.batch_number} ({b.brick_type_name})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Worker</label>
                <select className="form-select" value={form.worker_id || ''} onChange={e => setForm({ ...form, worker_id: e.target.value })} required>
                  <option value="">-- Select Worker --</option>
                  {workers.map(w => (
                    <option key={w.id} value={w.id}>{w.full_name} ({w.code})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Bricks Moulded (Count)</label>
                <input type="number" className="form-input" placeholder="e.g. 1500" value={form.bricks_moulded || ''} onChange={e => setForm({ ...form, bricks_moulded: e.target.value })} required min="1" />
              </div>
            </>
          )}

          {activeTab === 'purchase' && (
            <>
              <div className="form-group">
                <label className="form-label">Supplier</label>
                <select className="form-select" value={form.supplier_id || ''} onChange={e => setForm({ ...form, supplier_id: e.target.value })} required>
                  <option value="">-- Select Supplier --</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Material</label>
                <select className="form-select" value={form.material_id || ''} onChange={e => setForm({ ...form, material_id: e.target.value })} required>
                  <option value="">-- Select Material --</option>
                  {materials.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.unit_code})</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Quantity</label>
                  <input type="number" step="0.001" className="form-input" placeholder="e.g. 10.5" value={form.quantity || ''} onChange={e => setForm({ ...form, quantity: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Unit Price (₹)</label>
                  <input type="number" step="0.01" className="form-input" placeholder="e.g. 1200" value={form.unit_price || ''} onChange={e => setForm({ ...form, unit_price: e.target.value })} required />
                </div>
              </div>
            </>
          )}

          {activeTab === 'sale' && (
            <>
              <div className="form-group">
                <label className="form-label">Customer</label>
                <select className="form-select" value={form.customer_id || ''} onChange={e => setForm({ ...form, customer_id: e.target.value })} required>
                  <option value="">-- Select Customer --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Brick Type</label>
                  <select className="form-select" value={form.brick_type_id || ''} onChange={e => setForm({ ...form, brick_type_id: e.target.value })} required>
                    <option value="">-- Type --</option>
                    {brickTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Brick Grade</label>
                  <select className="form-select" value={form.brick_grade_id || ''} onChange={e => setForm({ ...form, brick_grade_id: e.target.value })} required>
                    <option value="">-- Grade --</option>
                    {brickGrades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Quantity (Bricks)</label>
                  <input type="number" className="form-input" placeholder="e.g. 5000" value={form.quantity || ''} onChange={e => setForm({ ...form, quantity: e.target.value })} required min="1" />
                </div>
                <div className="form-group">
                  <label className="form-label">Unit Rate (₹ / Brick)</label>
                  <input type="number" step="0.01" className="form-input" placeholder="e.g. 8.50" value={form.unit_price || ''} onChange={e => setForm({ ...form, unit_price: e.target.value })} required />
                </div>
              </div>
            </>
          )}

          {activeTab === 'payment' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Direction</label>
                  <select className="form-select" value={form.direction || 'INCOMING'} onChange={e => setForm({ ...form, direction: e.target.value })}>
                    <option value="INCOMING">INCOMING (Received)</option>
                    <option value="OUTGOING">OUTGOING (Paid)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Party Type</label>
                  <select className="form-select" value={form.party_type || 'CUSTOMER'} onChange={e => setForm({ ...form, party_type: e.target.value })}>
                    <option value="CUSTOMER">Customer</option>
                    <option value="SUPPLIER">Supplier</option>
                    <option value="WORKER">Worker</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Amount (₹)</label>
                <input type="number" step="0.01" className="form-input" placeholder="e.g. 25000" value={form.amount || ''} onChange={e => setForm({ ...form, amount: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Payment Method</label>
                <select className="form-select" value={form.payment_method_id || ''} onChange={e => setForm({ ...form, payment_method_id: e.target.value })} required>
                  <option value="">-- Select Payment Method --</option>
                  {paymentMethods.map(pm => <option key={pm.id} value={pm.id}>{pm.name}</option>)}
                </select>
              </div>
            </>
          )}

          {activeTab === 'expense' && (
            <>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" value={form.category_id || ''} onChange={e => setForm({ ...form, category_id: e.target.value })} required>
                  <option value="">-- Select Category --</option>
                  {expenseCategories.map(ec => <option key={ec.id} value={ec.id}>{ec.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Amount (₹)</label>
                  <input type="number" step="0.01" className="form-input" placeholder="e.g. 4500" value={form.amount || ''} onChange={e => setForm({ ...form, amount: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Payment Method</label>
                  <select className="form-select" value={form.payment_method_id || ''} onChange={e => setForm({ ...form, payment_method_id: e.target.value })} required>
                    <option value="">-- Method --</option>
                    {paymentMethods.map(pm => <option key={pm.id} value={pm.id}>{pm.name}</option>)}
                  </select>
                </div>
              </div>
            </>
          )}

          {activeTab === 'trip' && (
            <>
              <div className="form-group">
                <label className="form-label">Vehicle</label>
                <select className="form-select" value={form.vehicle_id || ''} onChange={e => setForm({ ...form, vehicle_id: e.target.value })} required>
                  <option value="">-- Select Vehicle --</option>
                  {vehicles.map(v => <option key={v.id} value={v.id}>{v.registration_number} ({v.driver_name})</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Trip Cost (₹)</label>
                  <input type="number" step="0.01" className="form-input" placeholder="e.g. 1500" value={form.cost || ''} onChange={e => setForm({ ...form, cost: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Distance (KM)</label>
                  <input type="number" step="0.1" className="form-input" placeholder="e.g. 45" value={form.distance_km || ''} onChange={e => setForm({ ...form, distance_km: e.target.value })} />
                </div>
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">Notes (Optional)</label>
            <input type="text" className="form-input" placeholder="Additional details..." value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Submit Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
