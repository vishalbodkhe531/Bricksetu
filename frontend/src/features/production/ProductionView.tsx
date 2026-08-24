import React, { useState, useEffect } from 'react';
import { Flame, Plus, ArrowRight, Layers, DollarSign, CheckCircle2 } from 'lucide-react';
import { apiRequest } from '../../shared/api/client';
import { formatINR } from '../../shared/utils/formatters';

export const ProductionView: React.FC = () => {
  const [batches, setBatches] = useState<any[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isNewBatchOpen, setIsNewBatchOpen] = useState(false);
  const [isTransitionOpen, setIsTransitionOpen] = useState(false);
  const [brickTypes, setBrickTypes] = useState<any[]>([]);
  const [brickGrades, setBrickGrades] = useState<any[]>([]);

  // Forms
  const [batchForm, setBatchForm] = useState<any>({
    start_date: new Date().toISOString().slice(0, 10),
  });

  const [transitionForm, setTransitionForm] = useState<any>({
    transition_date: new Date().toISOString().slice(0, 10),
    grades: {},
  });

  useEffect(() => {
    loadBatches();
    loadMasterData();
  }, []);

  async function loadBatches() {
    setLoading(true);
    try {
      const data = await apiRequest('/batches');
      setBatches(data);
      if (data.length > 0 && !selectedBatch) {
        loadBatchDetail(data[0].id);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function loadMasterData() {
    try {
      const master = await apiRequest('/settings/master-data');
      setBrickTypes(master.brick_types);
      setBrickGrades(master.brick_grades);
    } catch (err: any) {
      console.error(err);
    }
  }

  async function loadBatchDetail(id: string) {
    try {
      const detail = await apiRequest(`/batches/${id}`);
      setSelectedBatch(detail);
    } catch (err: any) {
      console.error(err);
    }
  }

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/batches', {
        method: 'POST',
        body: JSON.stringify(batchForm),
      });
      setIsNewBatchOpen(false);
      loadBatches();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleTransition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatch) return;

    try {
      let gradeAllocations = null;
      if (transitionForm.to_stage === 'UNLOADING') {
        gradeAllocations = Object.entries(transitionForm.grades).map(([grade_id, qty]) => ({
          grade_id,
          quantity: parseInt(qty as string, 10),
        }));
      }

      await apiRequest(`/batches/${selectedBatch.id}/transitions`, {
        method: 'POST',
        body: JSON.stringify({
          to_stage: transitionForm.to_stage,
          transition_date: transitionForm.transition_date,
          input_quantity: parseInt(transitionForm.input_quantity, 10),
          output_good_quantity: transitionForm.output_good_quantity ? parseInt(transitionForm.output_good_quantity, 10) : 0,
          damaged_quantity: transitionForm.damaged_quantity ? parseInt(transitionForm.damaged_quantity, 10) : 0,
          grade_allocations: gradeAllocations,
          notes: transitionForm.notes,
        }),
      });

      setIsTransitionOpen(false);
      loadBatches();
      loadBatchDetail(selectedBatch.id);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Batches & Production Stages</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Track raw moulding, drying, firing, unloading, and lot costing</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsNewBatchOpen(true)}>
          <Plus size={18} /> New Batch
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
        {/* Batches List Sidebar */}
        <div className="glass-card" style={{ padding: '16px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>Production Batches</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {batches.map((b) => {
              const selected = selectedBatch?.id === b.id;
              return (
                <div
                  key={b.id}
                  onClick={() => loadBatchDetail(b.id)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: selected ? 'var(--accent-orange-glow)' : 'var(--bg-surface-hover)',
                    border: selected ? '1px solid var(--accent-orange)' : '1px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>{b.batch_number}</strong>
                    <span className={`badge ${b.stage === 'MOULDING' ? 'badge-amber' : b.stage === 'DRYING' ? 'badge-blue' : b.stage === 'FIRING' ? 'badge-purple' : 'badge-emerald'}`}>
                      {b.stage}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span>{b.brick_type_name}</span>
                    <span>Moulded: {parseInt(b.raw_moulded_quantity, 10).toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Batch Details & Costing Sheet */}
        {selectedBatch ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Batch {selectedBatch.batch_number}</h2>
                    <span className="badge badge-amber">{selectedBatch.stage} STAGE</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>Brick Type: {selectedBatch.brick_type_name}</p>
                </div>
                {selectedBatch.status === 'IN_PROGRESS' && (
                  <button className="btn btn-secondary btn-sm" onClick={() => {
                    let nextStage = 'DRYING';
                    if (selectedBatch.stage === 'DRYING') nextStage = 'FIRING';
                    else if (selectedBatch.stage === 'FIRING') nextStage = 'UNLOADING';
                    setTransitionForm({ ...transitionForm, to_stage: nextStage });
                    setIsTransitionOpen(true);
                  }}>
                    Transition Stage <ArrowRight size={14} />
                  </button>
                )}
              </div>

              {/* Progress Counters */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', background: 'var(--bg-surface)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '20px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Moulded</span>
                  <p style={{ fontSize: '1.2rem', fontWeight: 800 }}>{selectedBatch.raw_moulded_quantity.toLocaleString()}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Drying Good</span>
                  <p style={{ fontSize: '1.2rem', fontWeight: 800 }}>{selectedBatch.dry_good_quantity.toLocaleString()}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Fired Good</span>
                  <p style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>{selectedBatch.fired_good_quantity.toLocaleString()}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Damaged</span>
                  <p style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-rose)' }}>{selectedBatch.damaged_quantity.toLocaleString()}</p>
                </div>
              </div>

              {/* Cost Breakdown Sheet */}
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>Batch Financial & Cost Breakdown</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
                <div style={{ padding: '12px', background: 'var(--bg-surface-hover)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Worker Moulding Wages</span>
                  <p style={{ fontSize: '1.1rem', fontWeight: 700 }}>{formatINR(selectedBatch.cost_breakdown.moulding_cost_paise)}</p>
                </div>
                <div style={{ padding: '12px', background: 'var(--bg-surface-hover)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Materials (Coal/Soil)</span>
                  <p style={{ fontSize: '1.1rem', fontWeight: 700 }}>{formatINR(selectedBatch.cost_breakdown.material_cost_paise)}</p>
                </div>
                <div style={{ padding: '12px', background: 'var(--bg-surface-hover)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Expenses & Transport</span>
                  <p style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                    {formatINR((BigInt(selectedBatch.cost_breakdown.expense_cost_paise) + BigInt(selectedBatch.cost_breakdown.transport_cost_paise)).toString())}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--accent-orange-glow)', border: '1px solid rgba(249,115,22,0.3)', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--accent-orange)', fontWeight: 700 }}>TOTAL BATCH PRODUCTION COST</span>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{formatINR(selectedBatch.cost_breakdown.total_cost_paise)}</h2>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>UNIT COST / 1,000 BRICKS</span>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                    {selectedBatch.cost_breakdown.cost_per_1000_paise ? formatINR(selectedBatch.cost_breakdown.cost_per_1000_paise) : 'N/A'}
                  </h2>
                </div>
              </div>
            </div>

            {/* Stage Transition History Timeline */}
            <div className="glass-card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>Stage Transition History</h3>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Transition</th>
                      <th>Input Qty</th>
                      <th>Good Qty</th>
                      <th>Damaged</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedBatch.stage_transitions.map((t: any) => (
                      <tr key={t.id}>
                        <td>{t.transition_date}</td>
                        <td><strong>{t.from_stage} &rarr; {t.to_stage}</strong></td>
                        <td>{t.input_quantity.toLocaleString()}</td>
                        <td>{t.output_good_quantity.toLocaleString()}</td>
                        <td style={{ color: 'var(--accent-rose)' }}>{t.damaged_quantity.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* New Batch Modal */}
      {isNewBatchOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px' }}>Create Production Batch</h3>
            <form onSubmit={handleCreateBatch}>
              <div className="form-group">
                <label className="form-label">Batch Number</label>
                <input type="text" className="form-input" placeholder="e.g. BATCH-2026-001" value={batchForm.batch_number || ''} onChange={e => setBatchForm({ ...batchForm, batch_number: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Brick Type</label>
                <select className="form-select" value={batchForm.brick_type_id || ''} onChange={e => setBatchForm({ ...batchForm, brick_type_id: e.target.value })} required>
                  <option value="">-- Select Brick Type --</option>
                  {brickTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Target Quantity</label>
                <input type="number" className="form-input" placeholder="e.g. 100000" value={batchForm.target_quantity || ''} onChange={e => setBatchForm({ ...batchForm, target_quantity: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input type="date" className="form-input" value={batchForm.start_date || ''} onChange={e => setBatchForm({ ...batchForm, start_date: e.target.value })} required />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsNewBatchOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Batch</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stage Transition Modal */}
      {isTransitionOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px' }}>
              Transition Batch to {transitionForm.to_stage}
            </h3>
            <form onSubmit={handleTransition}>
              <div className="form-group">
                <label className="form-label">Transition Date</label>
                <input type="date" className="form-input" value={transitionForm.transition_date || ''} onChange={e => setTransitionForm({ ...transitionForm, transition_date: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Input Quantity to Stage</label>
                <input type="number" className="form-input" value={transitionForm.input_quantity || ''} onChange={e => setTransitionForm({ ...transitionForm, input_quantity: e.target.value })} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Good Output Quantity</label>
                  <input type="number" className="form-input" value={transitionForm.output_good_quantity || ''} onChange={e => setTransitionForm({ ...transitionForm, output_good_quantity: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Damaged / Wastage Quantity</label>
                  <input type="number" className="form-input" value={transitionForm.damaged_quantity || ''} onChange={e => setTransitionForm({ ...transitionForm, damaged_quantity: e.target.value })} required />
                </div>
              </div>

              {/* If UNLOADING (Final Unloading to Finished Stock Lot), allocate by Grade */}
              {transitionForm.to_stage === 'UNLOADING' && (
                <div style={{ background: 'var(--bg-surface-hover)', padding: '14px', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '10px' }}>Grade Allocation for Stock Lots</h4>
                  {brickGrades.map(g => (
                    <div key={g.id} className="form-group" style={{ marginBottom: '8px' }}>
                      <label className="form-label">{g.name} Quantity</label>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="0"
                        value={transitionForm.grades?.[g.id] || ''}
                        onChange={e => setTransitionForm({
                          ...transitionForm,
                          grades: { ...transitionForm.grades, [g.id]: e.target.value },
                        })}
                      />
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsTransitionOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Complete Transition</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
