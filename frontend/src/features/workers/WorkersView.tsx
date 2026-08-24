import React, { useState, useEffect } from 'react';
import { Users, Plus, Calendar, DollarSign, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { apiRequest } from '../../shared/api/client';
import { formatINR } from '../../shared/utils/formatters';

export const WorkersView: React.FC = () => {
  const [workers, setWorkers] = useState<any[]>([]);
  const [settlements, setSettlements] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'workers' | 'settlements'>('workers');

  // Modals
  const [isNewWorkerOpen, setIsNewWorkerOpen] = useState(false);
  const [isGenerateSettlementOpen, setIsGenerateSettlementOpen] = useState(false);
  const [unsettledWork, setUnsettledWork] = useState<any>(null);

  // Forms
  const [workerForm, setWorkerForm] = useState<any>({
    payment_type: 'PIECE_RATE',
    joining_date: new Date().toISOString().slice(0, 10),
  });

  const [settleForm, setSettleForm] = useState<any>({
    period_start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    period_end_date: new Date().toISOString().slice(0, 10),
  });

  useEffect(() => {
    loadWorkerData();
  }, []);

  async function loadWorkerData() {
    try {
      const [wrk, stl] = await Promise.all([
        apiRequest('/workers'),
        apiRequest('/settlements'),
      ]);
      setWorkers(wrk);
      setSettlements(stl);
    } catch (err: any) {
      console.error(err);
    }
  }

  const handleCreateWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/workers', {
        method: 'POST',
        body: JSON.stringify({
          code: workerForm.code,
          full_name: workerForm.full_name,
          phone: workerForm.phone,
          address: workerForm.address,
          joining_date: workerForm.joining_date,
          initial_rate_per_1000_paise: Math.round(parseFloat(workerForm.initial_rate || '0') * 100),
        }),
      });
      setIsNewWorkerOpen(false);
      loadWorkerData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCheckUnsettled = async () => {
    if (!settleForm.worker_id) return;
    try {
      const data = await apiRequest(`/settlements/unsettled-work?worker_id=${settleForm.worker_id}&start_date=${settleForm.period_start_date}&end_date=${settleForm.period_end_date}`);
      setUnsettledWork(data);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleGenerateSettlement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/settlements/generate', {
        method: 'POST',
        body: JSON.stringify({
          worker_id: settleForm.worker_id,
          period_start_date: settleForm.period_start_date,
          period_end_date: settleForm.period_end_date,
          notes: settleForm.notes,
        }),
      });
      setIsGenerateSettlementOpen(false);
      setUnsettledWork(null);
      loadWorkerData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleApproveSettlement = async (id: string) => {
    try {
      await apiRequest(`/settlements/${id}/approve`, { method: 'POST' });
      loadWorkerData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleVoidSettlement = async (id: string) => {
    const reason = prompt('Enter mandatory void reason:');
    if (!reason) return;

    try {
      await apiRequest(`/settlements/${id}/void`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
      loadWorkerData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Workers & Weekly Settlements</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Worker directory, dated piece-rates, moulding logs, and settlement approvals</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={() => setIsNewWorkerOpen(true)}>
            <Plus size={18} /> Add Worker
          </button>
          <button className="btn btn-primary" onClick={() => setIsGenerateSettlementOpen(true)}>
            <Calendar size={18} /> Generate Settlement
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
        <button className={`btn ${activeTab === 'workers' ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setActiveTab('workers')}>
          <Users size={14} /> Worker Roster ({workers.length})
        </button>
        <button className={`btn ${activeTab === 'settlements' ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setActiveTab('settlements')}>
          <DollarSign size={14} /> Settlements Ledger ({settlements.length})
        </button>
      </div>

      {activeTab === 'workers' ? (
        <div className="glass-card" style={{ padding: '20px' }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Full Name</th>
                  <th>Phone</th>
                  <th>Payment Type</th>
                  <th>Current Piece Rate / 1,000</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {workers.map((w) => (
                  <tr key={w.id}>
                    <td><strong>{w.code}</strong></td>
                    <td>{w.full_name}</td>
                    <td>{w.phone || '-'}</td>
                    <td><span className="badge badge-blue">{w.payment_type}</span></td>
                    <td><strong style={{ color: 'var(--accent-orange)' }}>{w.current_rate_paise ? formatINR(w.current_rate_paise) : 'N/A'}</strong></td>
                    <td><span className="badge badge-emerald">ACTIVE</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: '20px' }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Settlement #</th>
                  <th>Worker</th>
                  <th>Period</th>
                  <th>Total Bricks</th>
                  <th>Gross Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {settlements.map((s) => (
                  <tr key={s.id}>
                    <td><strong>{s.settlement_number}</strong></td>
                    <td>{s.worker_name}</td>
                    <td>{s.period_start_date} to {s.period_end_date}</td>
                    <td>{s.total_bricks.toLocaleString()}</td>
                    <td><strong>{formatINR(s.gross_amount_paise)}</strong></td>
                    <td>
                      <span className={`badge ${s.status === 'DRAFT' ? 'badge-amber' : s.status === 'APPROVED' ? 'badge-blue' : s.status === 'PAID' ? 'badge-emerald' : 'badge-rose'}`}>
                        {s.status}
                      </span>
                    </td>
                    <td>
                      {s.status === 'DRAFT' && (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button className="btn btn-primary btn-sm" onClick={() => handleApproveSettlement(s.id)}>
                            <CheckCircle2 size={14} /> Approve
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleVoidSettlement(s.id)}>
                            <XCircle size={14} /> Void
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Worker Modal */}
      {isNewWorkerOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px' }}>Add Worker Profile</h3>
            <form onSubmit={handleCreateWorker}>
              <div className="form-group">
                <label className="form-label">Worker Code</label>
                <input type="text" className="form-input" placeholder="e.g. WRK-005" value={workerForm.code || ''} onChange={e => setWorkerForm({ ...workerForm, code: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input type="text" className="form-input" placeholder="e.g. Ramesh Kumar" value={workerForm.full_name || ''} onChange={e => setWorkerForm({ ...workerForm, full_name: e.target.value })} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input type="text" className="form-input" placeholder="9876543210" value={workerForm.phone || ''} onChange={e => setWorkerForm({ ...workerForm, phone: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Joining Date</label>
                  <input type="date" className="form-input" value={workerForm.joining_date || ''} onChange={e => setWorkerForm({ ...workerForm, joining_date: e.target.value })} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Initial Piece Rate (₹ per 1,000 bricks)</label>
                <input type="number" step="0.01" className="form-input" placeholder="e.g. 450.00" value={workerForm.initial_rate || ''} onChange={e => setWorkerForm({ ...workerForm, initial_rate: e.target.value })} required />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsNewWorkerOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Worker</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generate Settlement Modal */}
      {isGenerateSettlementOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px' }}>Generate Weekly Settlement</h3>
            <form onSubmit={handleGenerateSettlement}>
              <div className="form-group">
                <label className="form-label">Select Worker</label>
                <select className="form-select" value={settleForm.worker_id || ''} onChange={e => setSettleForm({ ...settleForm, worker_id: e.target.value })} required>
                  <option value="">-- Choose Worker --</option>
                  {workers.map(w => <option key={w.id} value={w.id}>{w.full_name} ({w.code})</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Period Start Date</label>
                  <input type="date" className="form-input" value={settleForm.period_start_date || ''} onChange={e => setSettleForm({ ...settleForm, period_start_date: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Period End Date</label>
                  <input type="date" className="form-input" value={settleForm.period_end_date || ''} onChange={e => setSettleForm({ ...settleForm, period_end_date: e.target.value })} required />
                </div>
              </div>

              <button type="button" className="btn btn-secondary btn-sm" onClick={handleCheckUnsettled} style={{ marginBottom: '16px' }}>
                Calculate Unsettled Moulding Logs
              </button>

              {unsettledWork && (
                <div style={{ background: 'var(--bg-surface-hover)', padding: '14px', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Un-settled Work Records Found: <strong>{unsettledWork.logs.length} days</strong></p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Bricks Moulded: <strong>{unsettledWork.total_bricks.toLocaleString()}</strong></p>
                  <p style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent-orange)', marginTop: '4px' }}>Gross Piece Rate Wages: {formatINR(unsettledWork.gross_amount_paise)}</p>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsGenerateSettlementOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={!unsettledWork}>Generate Draft Settlement</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
