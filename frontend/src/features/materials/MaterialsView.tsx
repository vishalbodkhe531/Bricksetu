import React, { useState, useEffect } from 'react';
import { Package, Plus, AlertTriangle, Truck } from 'lucide-react';
import { apiRequest } from '../../shared/api/client';
import { formatINR } from '../../shared/utils/formatters';

export const MaterialsView: React.FC = () => {
  const [materials, setMaterials] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'materials' | 'suppliers' | 'purchases'>('materials');

  const [isNewSupplierOpen, setIsNewSupplierOpen] = useState(false);
  const [supplierForm, setSupplierForm] = useState<any>({});

  useEffect(() => {
    loadMaterialsData();
  }, []);

  async function loadMaterialsData() {
    try {
      const [m, s, p] = await Promise.all([
        apiRequest('/materials'),
        apiRequest('/suppliers'),
        apiRequest('/purchases'),
      ]);
      setMaterials(m);
      setSuppliers(s);
      setPurchases(p);
    } catch (err: any) {
      console.error(err);
    }
  }

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/suppliers', {
        method: 'POST',
        body: JSON.stringify(supplierForm),
      });
      setIsNewSupplierOpen(false);
      loadMaterialsData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Materials & Suppliers</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Raw materials inventory (coal, soil, wood), suppliers, and FIFO purchase lots</p>
        </div>
        <button className="btn btn-secondary" onClick={() => setIsNewSupplierOpen(true)}>
          <Plus size={18} /> Add Supplier
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
        <button className={`btn ${activeTab === 'materials' ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setActiveTab('materials')}>
          <Package size={14} /> Raw Materials Catalogue ({materials.length})
        </button>
        <button className={`btn ${activeTab === 'suppliers' ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setActiveTab('suppliers')}>
          <Truck size={14} /> Suppliers ({suppliers.length})
        </button>
        <button className={`btn ${activeTab === 'purchases' ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setActiveTab('purchases')}>
          Purchase Log ({purchases.length})
        </button>
      </div>

      {activeTab === 'materials' && (
        <div className="glass-card" style={{ padding: '20px' }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Material Name</th>
                  <th>Unit</th>
                  <th>Current Stock</th>
                  <th>Reorder Level</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {materials.map((m) => {
                  const isLow = parseFloat(m.current_stock) <= parseFloat(m.reorder_level);
                  return (
                    <tr key={m.id}>
                      <td><strong>{m.code}</strong></td>
                      <td>{m.name}</td>
                      <td>{m.unit_code}</td>
                      <td><strong style={{ color: isLow ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>{m.current_stock}</strong></td>
                      <td>{m.reorder_level}</td>
                      <td>
                        {isLow ? (
                          <span className="badge badge-rose"><AlertTriangle size={12} /> LOW STOCK</span>
                        ) : (
                          <span className="badge badge-emerald">HEALTHY</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'suppliers' && (
        <div className="glass-card" style={{ padding: '20px' }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Supplier Name</th>
                  <th>Contact Person</th>
                  <th>Phone</th>
                  <th>Payable Balance</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((s) => (
                  <tr key={s.id}>
                    <td><strong>{s.code}</strong></td>
                    <td>{s.name}</td>
                    <td>{s.contact_person || '-'}</td>
                    <td>{s.phone || '-'}</td>
                    <td><strong style={{ color: 'var(--accent-rose)' }}>{formatINR(s.payable_balance_paise)}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'purchases' && (
        <div className="glass-card" style={{ padding: '20px' }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Purchase #</th>
                  <th>Date</th>
                  <th>Supplier</th>
                  <th>Material</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total Amount</th>
                  <th>Payment Status</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((p) => (
                  <tr key={p.id}>
                    <td><strong>{p.purchase_number}</strong></td>
                    <td>{p.purchase_date}</td>
                    <td>{p.supplier_name}</td>
                    <td>{p.material_name}</td>
                    <td>{p.quantity} {p.unit_code}</td>
                    <td>{formatINR(p.unit_price_paise)}</td>
                    <td><strong>{formatINR(p.total_amount_paise)}</strong></td>
                    <td>
                      <span className={`badge ${p.payment_status === 'PAID' ? 'badge-emerald' : p.payment_status === 'PARTIALLY_PAID' ? 'badge-blue' : 'badge-amber'}`}>
                        {p.payment_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Supplier Modal */}
      {isNewSupplierOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px' }}>Add Supplier Profile</h3>
            <form onSubmit={handleCreateSupplier}>
              <div className="form-group">
                <label className="form-label">Supplier Code</label>
                <input type="text" className="form-input" placeholder="e.g. SUP-003" value={supplierForm.code || ''} onChange={e => setSupplierForm({ ...supplierForm, code: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Supplier Name</label>
                <input type="text" className="form-input" placeholder="e.g. Bharat Coal Traders" value={supplierForm.name || ''} onChange={e => setSupplierForm({ ...supplierForm, name: e.target.value })} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Contact Person</label>
                  <input type="text" className="form-input" value={supplierForm.contact_person || ''} onChange={e => setSupplierForm({ ...supplierForm, contact_person: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input type="text" className="form-input" value={supplierForm.phone || ''} onChange={e => setSupplierForm({ ...supplierForm, phone: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsNewSupplierOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Supplier</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
