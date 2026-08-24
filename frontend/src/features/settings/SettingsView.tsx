import React, { useState, useEffect } from 'react';
import { Settings, Layers, Package, Users, Truck, Plus } from 'lucide-react';
import { apiRequest } from '../../shared/api/client';
import { rupeesToPaise } from '../../shared/utils/formatters';

export const SettingsView: React.FC = () => {
  const [masterData, setMasterData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'ob' | 'master'>('ob');

  // Opening balance state
  const [obType, setObType] = useState<'STOCK' | 'MATERIAL' | 'CUSTOMER_RECEIVABLE' | 'SUPPLIER_PAYABLE'>('STOCK');
  const [obForm, setObForm] = useState<any>({});
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);

  useEffect(() => {
    loadSettingsData();
  }, []);

  async function loadSettingsData() {
    try {
      const [m, supp, cust, mat] = await Promise.all([
        apiRequest('/settings/master-data'),
        apiRequest('/suppliers'),
        apiRequest('/customers'),
        apiRequest('/materials'),
      ]);
      setMasterData(m);
      setSuppliers(supp);
      setCustomers(cust);
      setMaterials(mat);
    } catch (err: any) {
      console.error(err);
    }
  }

  const handleOpeningBalanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let details: any = {};
      if (obType === 'STOCK') {
        details = {
          brick_type_id: obForm.brick_type_id,
          brick_grade_id: obForm.brick_grade_id,
          quantity: parseInt(obForm.quantity, 10),
          unit_cost_paise: rupeesToPaise(parseFloat(obForm.unit_cost)),
        };
      } else if (obType === 'MATERIAL') {
        details = {
          material_id: obForm.material_id,
          quantity: parseFloat(obForm.quantity),
          unit_cost_paise: rupeesToPaise(parseFloat(obForm.unit_cost)),
        };
      } else if (obType === 'CUSTOMER_RECEIVABLE') {
        details = {
          customer_id: obForm.customer_id,
          amount_paise: rupeesToPaise(parseFloat(obForm.amount)),
        };
      } else if (obType === 'SUPPLIER_PAYABLE') {
        details = {
          supplier_id: obForm.supplier_id,
          amount_paise: rupeesToPaise(parseFloat(obForm.amount)),
        };
      }

      await apiRequest('/opening-balances', {
        method: 'POST',
        body: JSON.stringify({ type: obType, details }),
      });

      alert('Opening Balance recorded successfully!');
      setObForm({});
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Opening Balances & Settings</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Initial system setup, stock & party balance initialization, master lookup configuration</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
        <button className={`btn ${activeTab === 'ob' ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setActiveTab('ob')}>
          Opening Balance Setup Wizard
        </button>
        <button className={`btn ${activeTab === 'master' ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setActiveTab('master')}>
          Master Data Lookups
        </button>
      </div>

      {activeTab === 'ob' ? (
        <div className="glass-card" style={{ padding: '24px', maxWidth: '650px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px' }}>Record Initial Opening Balances</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '20px' }}>
            {[
              { id: 'STOCK', label: 'Finished Stock Lot' },
              { id: 'MATERIAL', label: 'Material Stock Lot' },
              { id: 'CUSTOMER_RECEIVABLE', label: 'Customer Receivable' },
              { id: 'SUPPLIER_PAYABLE', label: 'Supplier Payable' },
            ].map(t => (
              <button
                key={t.id}
                type="button"
                className={`btn ${obType === t.id ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                onClick={() => { setObType(t.id as any); setObForm({}); }}
              >
                {t.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleOpeningBalanceSubmit}>
            {obType === 'STOCK' && (
              <>
                <div className="form-group">
                  <label className="form-label">Brick Type</label>
                  <select className="form-select" value={obForm.brick_type_id || ''} onChange={e => setObForm({ ...obForm, brick_type_id: e.target.value })} required>
                    <option value="">-- Select Type --</option>
                    {masterData?.brick_types.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Brick Grade</label>
                  <select className="form-select" value={obForm.brick_grade_id || ''} onChange={e => setObForm({ ...obForm, brick_grade_id: e.target.value })} required>
                    <option value="">-- Select Grade --</option>
                    {masterData?.brick_grades.map((g: any) => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Quantity</label>
                    <input type="number" className="form-input" placeholder="e.g. 50000" value={obForm.quantity || ''} onChange={e => setObForm({ ...obForm, quantity: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Unit Cost (₹ / brick)</label>
                    <input type="number" step="0.01" className="form-input" placeholder="e.g. 5.50" value={obForm.unit_cost || ''} onChange={e => setObForm({ ...obForm, unit_cost: e.target.value })} required />
                  </div>
                </div>
              </>
            )}

            {obType === 'MATERIAL' && (
              <>
                <div className="form-group">
                  <label className="form-label">Material</label>
                  <select className="form-select" value={obForm.material_id || ''} onChange={e => setObForm({ ...obForm, material_id: e.target.value })} required>
                    <option value="">-- Select Material --</option>
                    {materials.map(m => <option key={m.id} value={m.id}>{m.name} ({m.unit_code})</option>)}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Quantity</label>
                    <input type="number" step="0.01" className="form-input" placeholder="e.g. 45.5" value={obForm.quantity || ''} onChange={e => setObForm({ ...obForm, quantity: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Unit Cost (₹)</label>
                    <input type="number" step="0.01" className="form-input" placeholder="e.g. 8500" value={obForm.unit_cost || ''} onChange={e => setObForm({ ...obForm, unit_cost: e.target.value })} required />
                  </div>
                </div>
              </>
            )}

            {obType === 'CUSTOMER_RECEIVABLE' && (
              <>
                <div className="form-group">
                  <label className="form-label">Customer</label>
                  <select className="form-select" value={obForm.customer_id || ''} onChange={e => setObForm({ ...obForm, customer_id: e.target.value })} required>
                    <option value="">-- Select Customer --</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Opening Receivable Amount (₹)</label>
                  <input type="number" step="0.01" className="form-input" placeholder="e.g. 125000" value={obForm.amount || ''} onChange={e => setObForm({ ...obForm, amount: e.target.value })} required />
                </div>
              </>
            )}

            {obType === 'SUPPLIER_PAYABLE' && (
              <>
                <div className="form-group">
                  <label className="form-label">Supplier</label>
                  <select className="form-select" value={obForm.supplier_id || ''} onChange={e => setObForm({ ...obForm, supplier_id: e.target.value })} required>
                    <option value="">-- Select Supplier --</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Opening Payable Amount (₹)</label>
                  <input type="number" step="0.01" className="form-input" placeholder="e.g. 75000" value={obForm.amount || ''} onChange={e => setObForm({ ...obForm, amount: e.target.value })} required />
                </div>
              </>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }}>
              Commit Opening Balance Entry
            </button>
          </form>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <div className="glass-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>Brick Types</h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {masterData?.brick_types.map((t: any) => (
                <li key={t.id} style={{ padding: '10px', background: 'var(--bg-surface-hover)', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}>
                  <strong>{t.code}</strong> - {t.name}
                </li>
              ))}
            </ul>
          </div>

          <div className="glass-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>Brick Grades</h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {masterData?.brick_grades.map((g: any) => (
                <li key={g.id} style={{ padding: '10px', background: 'var(--bg-surface-hover)', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}>
                  <strong>{g.code}</strong> - {g.name}
                </li>
              ))}
            </ul>
          </div>

          <div className="glass-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>Expense Categories</h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {masterData?.expense_categories.map((c: any) => (
                <li key={c.id} style={{ padding: '10px', background: 'var(--bg-surface-hover)', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}>
                  <strong>{c.code}</strong> - {c.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
