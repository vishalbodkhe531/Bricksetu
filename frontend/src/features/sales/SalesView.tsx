import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Users } from 'lucide-react';
import { apiRequest } from '../../shared/api/client';
import { formatINR } from '../../shared/utils/formatters';

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
      loadSalesData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Customers & Brick Sales</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Customer accounts, sales orders, automatic FIFO stock deduction, and receivables</p>
        </div>
        <button className="btn btn-secondary" onClick={() => setIsNewCustomerOpen(true)}>
          <Plus size={18} /> Add Customer
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
        <button className={`btn ${activeTab === 'sales' ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setActiveTab('sales')}>
          <ShoppingCart size={14} /> Brick Sales Register ({sales.length})
        </button>
        <button className={`btn ${activeTab === 'customers' ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setActiveTab('customers')}>
          <Users size={14} /> Customer Accounts ({customers.length})
        </button>
      </div>

      {activeTab === 'sales' && (
        <div className="glass-card" style={{ padding: '20px' }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Sale #</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Brick Type & Grade</th>
                  <th>Quantity</th>
                  <th>Unit Rate</th>
                  <th>Total Amount</th>
                  <th>Payment Status</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((s) => (
                  <tr key={s.id}>
                    <td><strong>{s.sale_number}</strong></td>
                    <td>{s.sale_date}</td>
                    <td>{s.customer_name}</td>
                    <td>{s.brick_type_name} ({s.brick_grade_name})</td>
                    <td>{s.quantity.toLocaleString()}</td>
                    <td>{formatINR(s.unit_price_paise)} / brick</td>
                    <td><strong>{formatINR(s.total_amount_paise)}</strong></td>
                    <td>
                      <span className={`badge ${s.payment_status === 'PAID' ? 'badge-emerald' : s.payment_status === 'PARTIALLY_PAID' ? 'badge-blue' : 'badge-amber'}`}>
                        {s.payment_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'customers' && (
        <div className="glass-card" style={{ padding: '20px' }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Customer Name</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Outstanding Receivables</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td><strong>{c.code}</strong></td>
                    <td>{c.name}</td>
                    <td>{c.phone || '-'}</td>
                    <td>{c.address || '-'}</td>
                    <td><strong style={{ color: 'var(--accent-blue)' }}>{formatINR(c.receivable_balance_paise)}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {isNewCustomerOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px' }}>Add Customer Profile</h3>
            <form onSubmit={handleCreateCustomer}>
              <div className="form-group">
                <label className="form-label">Customer Code</label>
                <input type="text" className="form-input" placeholder="e.g. CUST-005" value={customerForm.code || ''} onChange={e => setCustomerForm({ ...customerForm, code: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Customer Name</label>
                <input type="text" className="form-input" placeholder="e.g. Acme Builders" value={customerForm.name || ''} onChange={e => setCustomerForm({ ...customerForm, name: e.target.value })} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input type="text" className="form-input" value={customerForm.phone || ''} onChange={e => setCustomerForm({ ...customerForm, phone: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input type="text" className="form-input" value={customerForm.address || ''} onChange={e => setCustomerForm({ ...customerForm, address: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsNewCustomerOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Customer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
