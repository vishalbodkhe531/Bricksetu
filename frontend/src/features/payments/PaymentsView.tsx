import React, { useState, useEffect } from 'react';
import { Wallet, DollarSign, ArrowUpRight, ArrowDownRight, Layers } from 'lucide-react';
import { apiRequest } from '../../shared/api/client';
import { formatINR } from '../../shared/utils/formatters';

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
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Payments & Operating Expenses</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Incoming/outgoing money transfers, charge allocations, and expense logging</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
        <button className={`btn ${activeTab === 'payments' ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setActiveTab('payments')}>
          <Wallet size={14} /> Payments Register ({payments.length})
        </button>
        <button className={`btn ${activeTab === 'expenses' ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setActiveTab('expenses')}>
          <DollarSign size={14} /> Operating Expenses ({expenses.length})
        </button>
      </div>

      {activeTab === 'payments' && (
        <div className="glass-card" style={{ padding: '20px' }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Payment #</th>
                  <th>Date</th>
                  <th>Direction</th>
                  <th>Party</th>
                  <th>Amount</th>
                  <th>Allocated</th>
                  <th>Method</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => {
                  const unallocatedPaise = BigInt(p.amount_paise) - BigInt(p.allocated_amount_paise);
                  return (
                    <tr key={p.id}>
                      <td><strong>{p.payment_number}</strong></td>
                      <td>{p.payment_date}</td>
                      <td>
                        <span className={`badge ${p.direction === 'INCOMING' ? 'badge-emerald' : 'badge-rose'}`}>
                          {p.direction === 'INCOMING' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />} {p.direction}
                        </span>
                      </td>
                      <td>{p.party_name} ({p.party_type})</td>
                      <td><strong>{formatINR(p.amount_paise)}</strong></td>
                      <td>{formatINR(p.allocated_amount_paise)}</td>
                      <td>{p.payment_method_name}</td>
                      <td>
                        {unallocatedPaise > 0n && p.party_id && (
                          <button className="btn btn-secondary btn-sm" onClick={() => openAllocationModal(p)}>
                            Allocate ({formatINR(unallocatedPaise.toString())})
                          </button>
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

      {activeTab === 'expenses' && (
        <div className="glass-card" style={{ padding: '20px' }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Payee Name</th>
                  <th>Batch</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((e) => (
                  <tr key={e.id}>
                    <td>{e.expense_date}</td>
                    <td><span className="badge badge-purple">{e.category_name}</span></td>
                    <td>{e.payee_name || '-'}</td>
                    <td>{e.batch_number || 'General Overhead'}</td>
                    <td><strong>{formatINR(e.amount_paise)}</strong></td>
                    <td>{e.payment_method_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment Allocation Modal */}
      {isAllocateOpen && selectedPayment && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px' }}>Allocate Payment {selectedPayment.payment_number}</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Unallocated Amount: <strong>{formatINR((BigInt(selectedPayment.amount_paise) - BigInt(selectedPayment.allocated_amount_paise)).toString())}</strong>
            </p>

            <form onSubmit={handleAllocationSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '10px' }}>Open Unpaid Charges</h4>
                {unpaidCharges.length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No open unpaid charges found for this party.</p>
                ) : (
                  unpaidCharges.map(chg => (
                    <div key={chg.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-surface-hover)', padding: '10px 14px', borderRadius: 'var(--radius-md)', marginBottom: '8px' }}>
                      <div>
                        <strong style={{ fontSize: '0.85rem' }}>{chg.description}</strong>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Date: {chg.charge_date} | Due: {formatINR(chg.remaining_unpaid_paise)}</p>
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        className="form-input"
                        style={{ width: '120px' }}
                        placeholder="0.00"
                        value={allocationsForm[chg.id] || ''}
                        onChange={e => setAllocationsForm({ ...allocationsForm, [chg.id]: e.target.value })}
                      />
                    </div>
                  ))
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsAllocateOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={unpaidCharges.length === 0}>Save Allocation</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
