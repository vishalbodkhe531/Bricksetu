import React, { useState, useEffect } from 'react';
import { 
  Flame, Layers, ShoppingCart, TrendingUp, AlertTriangle, 
  ArrowUpRight, ArrowDownRight, Wallet, Users, Plus, Package 
} from 'lucide-react';
import { apiRequest } from '../../shared/api/client';
import { formatINR } from '../../shared/utils/formatters';

interface DashboardViewProps {
  onOpenQuickEntry: () => void;
  onNavigate: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onOpenQuickEntry, onNavigate }) => {
  const [loading, setLoading] = useState(true);
  const [stockSummary, setStockSummary] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [profitData, setProfitData] = useState<any>(null);
  const [batches, setBatches] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    setLoading(true);
    try {
      const [stk, mat, cust, supp, wrk, prof, btc] = await Promise.all([
        apiRequest('/stock/summary'),
        apiRequest('/materials'),
        apiRequest('/customers'),
        apiRequest('/suppliers'),
        apiRequest('/workers'),
        apiRequest('/reports/operating-profit'),
        apiRequest('/batches'),
      ]);
      setStockSummary(stk);
      setMaterials(mat);
      setCustomers(cust);
      setSuppliers(supp);
      setWorkers(wrk);
      setProfitData(prof);
      setBatches(btc);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Calculate Aggregates
  const totalFinishedBricks = stockSummary.reduce((acc, r) => acc + parseInt(r.total_available_quantity, 10), 0);
  const totalReceivablesPaise = customers.reduce((acc, c) => acc + BigInt(c.receivable_balance_paise), 0n);
  const totalPayablesPaise = suppliers.reduce((acc, s) => acc + BigInt(s.payable_balance_paise), 0n);
  const lowStockMaterials = materials.filter(m => parseFloat(m.current_stock) <= parseFloat(m.reorder_level));
  const activeBatches = batches.filter(b => b.status === 'IN_PROGRESS');

  return (
    <div>
      {/* Header & Quick Action Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Kiln Operational Dashboard</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Real-time production, stock, ledgers, and profit summary</p>
        </div>
        <button className="btn btn-primary" onClick={onOpenQuickEntry}>
          <Plus size={18} /> Quick Daily Entry
        </button>
      </div>

      {/* Low Stock Alerts Banner */}
      {lowStockMaterials.length > 0 && (
        <div style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 'var(--radius-md)', padding: '14px 18px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <AlertTriangle size={20} color="var(--accent-amber)" />
          <div style={{ flex: 1 }}>
            <strong style={{ color: '#fbbf24', fontSize: '0.9rem' }}>Low Material Stock Warning!</strong>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
              {lowStockMaterials.map(m => `${m.name} (${m.current_stock} ${m.unit_code} remaining)`).join(', ')}
            </p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('materials')}>View Materials</button>
        </div>
      )}

      {/* Key Metric Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        
        {/* Finished Brick Stock */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>Finished Stock</span>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(249,115,22,0.15)', color: 'var(--accent-orange)' }}>
              <Layers size={20} />
            </div>
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '8px 0 4px' }}>{totalFinishedBricks.toLocaleString()}</h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>Good Finished Bricks</span>
        </div>

        {/* Sales Revenue */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>Sales Revenue</span>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(16,185,129,0.15)', color: 'var(--accent-emerald)' }}>
              <ShoppingCart size={20} />
            </div>
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '8px 0 4px' }}>{formatINR(profitData?.total_sales_revenue_paise)}</h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Gross Revenue</span>
        </div>

        {/* Customer Receivables */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>Receivables</span>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(59,130,246,0.15)', color: 'var(--accent-blue)' }}>
              <ArrowUpRight size={20} />
            </div>
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '8px 0 4px' }}>{formatINR(totalReceivablesPaise.toString())}</h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-blue)', fontWeight: 600 }}>Due from Customers</span>
        </div>

        {/* Supplier Payables */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>Supplier Payables</span>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(244,63,94,0.15)', color: 'var(--accent-rose)' }}>
              <ArrowDownRight size={20} />
            </div>
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '8px 0 4px' }}>{formatINR(totalPayablesPaise.toString())}</h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-rose)', fontWeight: 600 }}>Material Payables</span>
        </div>

        {/* Operating Profit */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>Operating Profit</span>
            <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(139,92,246,0.15)', color: 'var(--accent-purple)' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '8px 0 4px' }}>{formatINR(profitData?.operating_profit_paise)}</h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Revenue - COGS - Expenses</span>
        </div>

      </div>

      {/* Secondary Dashboard Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        
        {/* Active Production Batches */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Active Production Batches</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('production')}>View All</button>
          </div>
          {activeBatches.length === 0 ? (
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>No active batches in progress.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {activeBatches.map(b => (
                <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg-surface-hover)', borderRadius: 'var(--radius-md)' }}>
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{b.batch_number}</strong>
                    <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>{b.brick_type_name}</p>
                  </div>
                  <span className={`badge ${b.stage === 'MOULDING' ? 'badge-amber' : b.stage === 'DRYING' ? 'badge-blue' : 'badge-purple'}`}>
                    {b.stage}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Finished Stock Grade Breakdown */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Stock by Grade & Type</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('inventory')}>Ledger</button>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Brick Type</th>
                  <th>Grade</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {stockSummary.map((s, idx) => (
                  <tr key={idx}>
                    <td>{s.brick_type_name}</td>
                    <td><span className="badge badge-emerald">{s.brick_grade_name}</span></td>
                    <td><strong>{parseInt(s.total_available_quantity, 10).toLocaleString()}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
