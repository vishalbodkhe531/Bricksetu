import React, { useState, useEffect } from 'react';
import { Layers, Plus, History, AlertCircle } from 'lucide-react';
import { apiRequest } from '../../shared/api/client';

export const InventoryView: React.FC = () => {
  const [stockSummary, setStockSummary] = useState<any[]>([]);
  const [lots, setLots] = useState<any[]>([]);
  const [ledger, setLedger] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'lots' | 'ledger'>('lots');

  // Adjustment Modal
  const [isAdjOpen, setIsAdjOpen] = useState(false);
  const [adjForm, setAdjForm] = useState<any>({
    adjustment_type: 'CORRECTION',
    adjustment_date: new Date().toISOString().slice(0, 10),
  });

  useEffect(() => {
    loadInventoryData();
  }, []);

  async function loadInventoryData() {
    try {
      const [stk, lts, ldg] = await Promise.all([
        apiRequest('/stock/summary'),
        apiRequest('/stock/lots'),
        apiRequest('/stock/ledger'),
      ]);
      setStockSummary(stk);
      setLots(lts);
      setLedger(ldg);
    } catch (err: any) {
      console.error(err);
    }
  }

  const handleAdjustmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjForm.reason || adjForm.reason.trim().length === 0) {
      alert('Adjustment reason is mandatory.');
      return;
    }

    try {
      await apiRequest('/stock/adjustments', {
        method: 'POST',
        body: JSON.stringify({
          finished_lot_id: adjForm.finished_lot_id,
          adjustment_type: adjForm.adjustment_type,
          quantity_change: parseInt(adjForm.quantity_change, 10),
          reason: adjForm.reason,
          adjustment_date: adjForm.adjustment_date,
        }),
      });
      setIsAdjOpen(false);
      loadInventoryData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Finished Stock & Inventory Ledger</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>FIFO stock lot tracking, audit trail, and manual adjustments</p>
        </div>
        <button className="btn btn-secondary" onClick={() => setIsAdjOpen(true)}>
          <Plus size={18} /> Manual Stock Adjustment
        </button>
      </div>

      {/* Summary Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {stockSummary.map((s, idx) => (
          <div key={idx} className="glass-card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{s.brick_type_name}</span>
              <span className="badge badge-emerald">{s.brick_grade_name}</span>
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '10px 0 0', color: 'var(--accent-orange)' }}>
              {parseInt(s.total_available_quantity, 10).toLocaleString()}
            </h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Available Finished Stock</span>
          </div>
        ))}
      </div>

      {/* Tab Controls */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
        <button className={`btn ${activeTab === 'lots' ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setActiveTab('lots')}>
          <Layers size={14} /> Stock Lots ({lots.length})
        </button>
        <button className={`btn ${activeTab === 'ledger' ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setActiveTab('ledger')}>
          <History size={14} /> Stock Ledger Audit Trail
        </button>
      </div>

      {/* Stock Lots Table */}
      {activeTab === 'lots' ? (
        <div className="glass-card" style={{ padding: '20px' }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Lot Number</th>
                  <th>Brick Type</th>
                  <th>Grade</th>
                  <th>Batch</th>
                  <th>Initial Qty</th>
                  <th>Available Stock</th>
                </tr>
              </thead>
              <tbody>
                {lots.map((l) => (
                  <tr key={l.id}>
                    <td><strong>{l.lot_number}</strong></td>
                    <td>{l.brick_type_name}</td>
                    <td><span className="badge badge-emerald">{l.brick_grade_name}</span></td>
                    <td>{l.batch_number || 'Opening Balance'}</td>
                    <td>{l.initial_quantity.toLocaleString()}</td>
                    <td><strong style={{ color: l.available_quantity > 0 ? 'var(--accent-emerald)' : 'var(--text-muted)' }}>{l.available_quantity.toLocaleString()}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Stock Ledger Audit Trail */
        <div className="glass-card" style={{ padding: '20px' }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Transaction</th>
                  <th>Type & Grade</th>
                  <th>Qty Change</th>
                  <th>Balance After</th>
                  <th>Reason / Notes</th>
                </tr>
              </thead>
              <tbody>
                {ledger.map((sl) => (
                  <tr key={sl.id}>
                    <td>{sl.transaction_date}</td>
                    <td><span className="badge badge-blue">{sl.transaction_type}</span></td>
                    <td>{sl.brick_type_name} ({sl.brick_grade_name || '-'})</td>
                    <td style={{ color: sl.quantity_change >= 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)', fontWeight: 700 }}>
                      {sl.quantity_change > 0 ? `+${sl.quantity_change.toLocaleString()}` : sl.quantity_change.toLocaleString()}
                    </td>
                    <td>{sl.balance_after.toLocaleString()}</td>
                    <td>{sl.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Manual Stock Adjustment Modal */}
      {isAdjOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px' }}>Manual Stock Adjustment</h3>
            <form onSubmit={handleAdjustmentSubmit}>
              <div className="form-group">
                <label className="form-label">Stock Lot</label>
                <select className="form-select" value={adjForm.finished_lot_id || ''} onChange={e => setAdjForm({ ...adjForm, finished_lot_id: e.target.value })} required>
                  <option value="">-- Select Finished Stock Lot --</option>
                  {lots.map(l => (
                    <option key={l.id} value={l.id}>{l.lot_number} - {l.brick_type_name} ({l.brick_grade_name}) [Avail: {l.available_quantity}]</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Adjustment Type</label>
                <select className="form-select" value={adjForm.adjustment_type || 'CORRECTION'} onChange={e => setAdjForm({ ...adjForm, adjustment_type: e.target.value })}>
                  <option value="CORRECTION">Physical Stock Correction</option>
                  <option value="BREAKAGE">Yard Breakage / Loss</option>
                  <option value="SAMPLE">Sample / Testing Consumption</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Quantity Change (+ to add, - to reduce)</label>
                <input type="number" className="form-input" placeholder="e.g. -500 or +200" value={adjForm.quantity_change || ''} onChange={e => setAdjForm({ ...adjForm, quantity_change: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Mandatory Audit Reason</label>
                <input type="text" className="form-input" placeholder="Explain reason for manual adjustment..." value={adjForm.reason || ''} onChange={e => setAdjForm({ ...adjForm, reason: e.target.value })} required />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsAdjOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Post Adjustment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
