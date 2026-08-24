import React, { useState, useEffect } from 'react';
import { FileText, Download, Printer, Filter } from 'lucide-react';
import { apiRequest } from '../../shared/api/client';
import { formatINR } from '../../shared/utils/formatters';
import { exportToCSV } from '../../shared/utils/csvExporter';

export const ReportsView: React.FC = () => {
  const [reportType, setReportType] = useState<string>('production-damage');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [batches, setBatches] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);

  const [filterBatch, setFilterBatch] = useState('');
  const [filterWorker, setFilterWorker] = useState('');
  const [filterPartyType, setFilterPartyType] = useState('CUSTOMER');
  const [filterPartyId, setFilterPartyId] = useState('');

  useEffect(() => {
    loadLookupData();
  }, []);

  useEffect(() => {
    fetchReportData();
  }, [reportType, startDate, endDate, filterBatch, filterWorker, filterPartyType, filterPartyId]);

  async function loadLookupData() {
    try {
      const [b, w, c, s, v] = await Promise.all([
        apiRequest('/batches'),
        apiRequest('/workers'),
        apiRequest('/customers'),
        apiRequest('/suppliers'),
        apiRequest('/transport/vehicles'),
      ]);
      setBatches(b);
      setWorkers(w);
      setCustomers(c);
      setSuppliers(s);
      setVehicles(v);
    } catch (err: any) {
      console.error(err);
    }
  }

  async function fetchReportData() {
    setLoading(true);
    try {
      let queryStr = `?start_date=${startDate}&end_date=${endDate}`;

      if (reportType === 'production-damage') {
        if (filterBatch) queryStr += `&batch_id=${filterBatch}`;
        const res = await apiRequest(`/reports/production-damage${queryStr}`);
        setData(res);
      } else if (reportType === 'stock-movement') {
        const res = await apiRequest(`/reports/stock-movement${queryStr}`);
        setData(res);
      } else if (reportType === 'weekly-payments') {
        if (filterWorker) queryStr += `&worker_id=${filterWorker}`;
        const res = await apiRequest(`/reports/weekly-payments${queryStr}`);
        setData(res);
      } else if (reportType === 'material-consumption') {
        if (filterBatch) queryStr += `&batch_id=${filterBatch}`;
        const res = await apiRequest(`/reports/material-consumption${queryStr}`);
        setData(res);
      } else if (reportType === 'party-ledgers') {
        if (filterPartyId) {
          const res = await apiRequest(`/reports/party-ledgers?party_type=${filterPartyType}&party_id=${filterPartyId}`);
          setData(res);
        } else {
          setData([]);
        }
      } else if (reportType === 'transport-cost') {
        const res = await apiRequest(`/reports/transport-cost${queryStr}`);
        setData(res);
      } else if (reportType === 'batch-costing') {
        const res = await apiRequest(`/reports/batch-costing`);
        setData(res);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleExportCSV = () => {
    if (data.length === 0) return;
    let headers: string[] = [];
    let rows: (string | number)[][] = [];

    if (reportType === 'production-damage') {
      headers = ['Date', 'Batch', 'Brick Type', 'From Stage', 'To Stage', 'Input Qty', 'Good Qty', 'Damaged Qty'];
      rows = data.map(r => [r.transition_date, r.batch_number, r.brick_type_name, r.from_stage, r.to_stage, r.input_quantity, r.output_good_quantity, r.damaged_quantity]);
    } else if (reportType === 'stock-movement') {
      headers = ['Date', 'Transaction', 'Brick Type', 'Grade', 'Change', 'Balance After', 'Reason'];
      rows = data.map(r => [r.transaction_date, r.transaction_type, r.brick_type_name, r.brick_grade_name || '-', r.quantity_change, r.balance_after, r.reason]);
    } else if (reportType === 'weekly-payments') {
      headers = ['Settlement #', 'Worker', 'Start Date', 'End Date', 'Total Bricks', 'Gross Wages (₹)', 'Due (₹)', 'Status'];
      rows = data.map(r => [r.settlement_number, r.worker_name, r.period_start_date, r.period_end_date, r.total_bricks, Number(r.gross_amount_paise)/100, Number(r.remaining_due_paise)/100, r.status]);
    } else if (reportType === 'material-consumption') {
      headers = ['Date', 'Material', 'Quantity', 'Batch', 'Cost (₹)', 'Notes'];
      rows = data.map(r => [r.consumption_date, r.material_name, `${r.quantity} ${r.unit_code}`, r.batch_number || 'General', Number(r.cost_paise)/100, r.notes || '']);
    } else if (reportType === 'party-ledgers') {
      headers = ['Entry Date', 'Record Type', 'Description', 'Amount (₹)', 'Status'];
      rows = data.map(r => [r.entry_date, r.record_type, r.description, Number(r.amount_paise)/100, r.status]);
    } else if (reportType === 'transport-cost') {
      headers = ['Date', 'Vehicle', 'Driver', 'Origin/Destination', 'Distance KM', 'Cost (₹)'];
      rows = data.map(r => [r.trip_date, r.registration_number, r.driver_name || '-', `${r.origin} to ${r.destination}`, r.distance_km || 0, Number(r.cost_paise)/100]);
    } else if (reportType === 'batch-costing') {
      headers = ['Batch #', 'Brick Type', 'Fired Good Qty', 'Moulding Wages (₹)', 'Material Cost (₹)', 'Expenses (₹)', 'Total Cost (₹)', 'Cost / 1,000 (₹)'];
      rows = data.map(r => [r.batch_number, r.brick_type_name, r.fired_good_quantity, Number(r.moulding_cost_paise)/100, Number(r.material_cost_paise)/100, Number(r.expense_cost_paise)/100, Number(r.total_cost_paise)/100, r.cost_per_1000_paise ? Number(r.cost_per_1000_paise)/100 : 0]);
    }

    exportToCSV(reportType, headers, rows);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Reports & Audit Analytics</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Filterable operational reports, batch costing, party ledgers, and printable statements</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }} className="no-print">
          <button className="btn btn-secondary" onClick={() => window.print()}>
            <Printer size={18} /> Print Statement
          </button>
          <button className="btn btn-primary" onClick={handleExportCSV}>
            <Download size={18} /> Export CSV
          </button>
        </div>
      </div>

      {/* Report Selector Grid */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '20px' }} className="no-print">
        {[
          { id: 'production-damage', label: 'Production & Damage' },
          { id: 'stock-movement', label: 'Stock Movement' },
          { id: 'weekly-payments', label: 'Worker Weekly Wages' },
          { id: 'material-consumption', label: 'Material Usage' },
          { id: 'party-ledgers', label: 'Party Account Ledgers' },
          { id: 'transport-cost', label: 'Transport Costs' },
          { id: 'batch-costing', label: 'Batch Costing & Profit' },
        ].map(r => (
          <button
            key={r.id}
            className={`btn ${reportType === r.id ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setReportType(r.id)}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Filters Card */}
      <div className="glass-card no-print" style={{ padding: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Filter size={16} color="var(--accent-orange)" />
          <strong style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Filter Parameters</strong>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Start Date</label>
            <input type="date" className="form-input" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">End Date</label>
            <input type="date" className="form-input" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>

          {(reportType === 'production-damage' || reportType === 'material-consumption') && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Batch</label>
              <select className="form-select" value={filterBatch} onChange={e => setFilterBatch(e.target.value)}>
                <option value="">All Batches</option>
                {batches.map(b => <option key={b.id} value={b.id}>{b.batch_number}</option>)}
              </select>
            </div>
          )}

          {reportType === 'weekly-payments' && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Worker</label>
              <select className="form-select" value={filterWorker} onChange={e => setFilterWorker(e.target.value)}>
                <option value="">All Workers</option>
                {workers.map(w => <option key={w.id} value={w.id}>{w.full_name}</option>)}
              </select>
            </div>
          )}

          {reportType === 'party-ledgers' && (
            <>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Party Type</label>
                <select className="form-select" value={filterPartyType} onChange={e => { setFilterPartyType(e.target.value); setFilterPartyId(''); }}>
                  <option value="CUSTOMER">Customer</option>
                  <option value="SUPPLIER">Supplier</option>
                  <option value="WORKER">Worker</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Select Party</label>
                <select className="form-select" value={filterPartyId} onChange={e => setFilterPartyId(e.target.value)}>
                  <option value="">-- Choose Party --</option>
                  {filterPartyType === 'CUSTOMER' && customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  {filterPartyType === 'SUPPLIER' && suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  {filterPartyType === 'WORKER' && workers.map(w => <option key={w.id} value={w.id}>{w.full_name}</option>)}
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Report Table Display */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>
            {reportType === 'production-damage' && 'Daily & Monthly Production & Damage Report'}
            {reportType === 'stock-movement' && 'Finished Stock Movement Ledger'}
            {reportType === 'weekly-payments' && 'Worker Weekly Payment Settlements'}
            {reportType === 'material-consumption' && 'Raw Material Consumption & Costing'}
            {reportType === 'party-ledgers' && 'Party Ledger Statement'}
            {reportType === 'transport-cost' && 'Vehicle & Transport Trip Log'}
            {reportType === 'batch-costing' && 'Batch Unit Costing & Operating Profitability'}
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Records: {data.length}</span>
        </div>

        <div className="table-container">
          <table className="data-table">
            {reportType === 'production-damage' && (
              <>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Batch</th>
                    <th>Brick Type</th>
                    <th>Stage</th>
                    <th>Input Qty</th>
                    <th>Good Qty</th>
                    <th>Damaged Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((r, i) => (
                    <tr key={i}>
                      <td>{r.transition_date}</td>
                      <td><strong>{r.batch_number}</strong></td>
                      <td>{r.brick_type_name}</td>
                      <td>{r.from_stage} &rarr; {r.to_stage}</td>
                      <td>{r.input_quantity.toLocaleString()}</td>
                      <td>{r.output_good_quantity.toLocaleString()}</td>
                      <td style={{ color: 'var(--accent-rose)', fontWeight: 700 }}>{r.damaged_quantity.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </>
            )}

            {reportType === 'stock-movement' && (
              <>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Transaction</th>
                    <th>Type & Grade</th>
                    <th>Qty Change</th>
                    <th>Balance After</th>
                    <th>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((r, i) => (
                    <tr key={i}>
                      <td>{r.transaction_date}</td>
                      <td><span className="badge badge-blue">{r.transaction_type}</span></td>
                      <td>{r.brick_type_name} ({r.brick_grade_name || '-'})</td>
                      <td style={{ color: r.quantity_change >= 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)', fontWeight: 700 }}>
                        {r.quantity_change > 0 ? `+${r.quantity_change.toLocaleString()}` : r.quantity_change.toLocaleString()}
                      </td>
                      <td>{r.balance_after.toLocaleString()}</td>
                      <td>{r.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </>
            )}

            {reportType === 'weekly-payments' && (
              <>
                <thead>
                  <tr>
                    <th>Settlement #</th>
                    <th>Worker</th>
                    <th>Period</th>
                    <th>Total Bricks</th>
                    <th>Gross Wages</th>
                    <th>Remaining Due</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((r, i) => (
                    <tr key={i}>
                      <td><strong>{r.settlement_number}</strong></td>
                      <td>{r.worker_name}</td>
                      <td>{r.period_start_date} to {r.period_end_date}</td>
                      <td>{r.total_bricks.toLocaleString()}</td>
                      <td>{formatINR(r.gross_amount_paise)}</td>
                      <td><strong style={{ color: 'var(--accent-rose)' }}>{formatINR(r.remaining_due_paise)}</strong></td>
                      <td><span className="badge badge-emerald">{r.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </>
            )}

            {reportType === 'material-consumption' && (
              <>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Material</th>
                    <th>Quantity</th>
                    <th>Batch</th>
                    <th>Total Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((r, i) => (
                    <tr key={i}>
                      <td>{r.consumption_date}</td>
                      <td>{r.material_name}</td>
                      <td>{r.quantity} {r.unit_code}</td>
                      <td>{r.batch_number || 'General Overhead'}</td>
                      <td><strong>{formatINR(r.cost_paise)}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </>
            )}

            {reportType === 'party-ledgers' && (
              <>
                <thead>
                  <tr>
                    <th>Entry Date</th>
                    <th>Record Type</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((r, i) => (
                    <tr key={i}>
                      <td>{r.entry_date}</td>
                      <td><span className={`badge ${r.record_type === 'PAYMENT' ? 'badge-emerald' : 'badge-amber'}`}>{r.record_type}</span></td>
                      <td>{r.description}</td>
                      <td><strong>{formatINR(r.amount_paise)}</strong></td>
                      <td>{r.status}</td>
                    </tr>
                  ))}
                </tbody>
              </>
            )}

            {reportType === 'transport-cost' && (
              <>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Vehicle</th>
                    <th>Driver</th>
                    <th>Route</th>
                    <th>Distance</th>
                    <th>Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((r, i) => (
                    <tr key={i}>
                      <td>{r.trip_date}</td>
                      <td><strong>{r.registration_number}</strong></td>
                      <td>{r.driver_name || '-'}</td>
                      <td>{r.origin || 'Yard'} &rarr; {r.destination || 'Site'}</td>
                      <td>{r.distance_km ? `${r.distance_km} KM` : '-'}</td>
                      <td><strong>{formatINR(r.cost_paise)}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </>
            )}

            {reportType === 'batch-costing' && (
              <>
                <thead>
                  <tr>
                    <th>Batch #</th>
                    <th>Brick Type</th>
                    <th>Good Bricks</th>
                    <th>Moulding Cost</th>
                    <th>Material Cost</th>
                    <th>Total Cost</th>
                    <th>Cost / 1,000 Bricks</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((r, i) => (
                    <tr key={i}>
                      <td><strong>{r.batch_number}</strong></td>
                      <td>{r.brick_type_name}</td>
                      <td>{r.fired_good_quantity.toLocaleString()}</td>
                      <td>{formatINR(r.moulding_cost_paise)}</td>
                      <td>{formatINR(r.material_cost_paise)}</td>
                      <td><strong>{formatINR(r.total_cost_paise)}</strong></td>
                      <td><strong style={{ color: 'var(--accent-emerald)' }}>{r.cost_per_1000_paise ? formatINR(r.cost_per_1000_paise) : 'N/A'}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};
