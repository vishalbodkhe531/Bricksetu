import React, { useState, useEffect } from 'react';
import { FileText, Download, Printer, Filter } from 'lucide-react';
import { apiRequest } from '../../shared/api/client';
import { formatINR } from '../../shared/utils/formatters';
import { exportToCSV } from '../../shared/utils/csvExporter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '../../shared/components/PageHeader';

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
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Reports & Audit Analytics"
        description="Filterable operational reports, batch costing, party ledgers, and printable statements"
        icon={<FileText className="size-5 sm:size-6" />}
        actions={
          <div className="flex items-center gap-2 no-print">
            <Button variant="outline" onClick={() => window.print()} className="border-slate-700 text-slate-200 hover:bg-slate-800 gap-1.5 h-10 px-3.5 text-xs sm:text-sm">
              <Printer className="size-4" /> Print Statement
            </Button>
            <Button onClick={handleExportCSV} className="bg-orange-500 hover:bg-orange-600 text-white font-bold gap-1.5 h-10 px-4 shadow-lg shadow-orange-500/20 text-xs sm:text-sm">
              <Download className="size-4" /> Export CSV
            </Button>
          </div>
        }
      />

      {/* Report Selector Grid */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-print">
        {[
          { id: 'production-damage', label: 'Production & Damage' },
          { id: 'stock-movement', label: 'Stock Movement' },
          { id: 'weekly-payments', label: 'Worker Weekly Wages' },
          { id: 'material-consumption', label: 'Material Usage' },
          { id: 'party-ledgers', label: 'Party Account Ledgers' },
          { id: 'transport-cost', label: 'Transport Costs' },
          { id: 'batch-costing', label: 'Batch Costing & Profit' },
        ].map(r => (
          <Button
            key={r.id}
            size="sm"
            variant={reportType === r.id ? "default" : "outline"}
            onClick={() => setReportType(r.id)}
            className={`whitespace-nowrap font-semibold text-xs h-9 ${
              reportType === r.id ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {r.label}
          </Button>
        ))}
      </div>

      {/* Filters Card */}
      <Card className="bg-slate-900/70 border-slate-800 backdrop-blur-xl shadow-md text-slate-100 p-4 no-print">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="size-4 text-orange-500" />
          <strong className="text-xs font-bold uppercase tracking-wider text-slate-300">Filter Parameters</strong>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className="space-y-1">
            <Label className="text-slate-400 text-xs">Start Date</Label>
            <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-slate-400 text-xs">End Date</Label>
            <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>

          {(reportType === 'production-damage' || reportType === 'material-consumption') && (
            <div className="space-y-1">
              <Label className="text-slate-400 text-xs">Batch</Label>
              <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm dark:bg-slate-900/80 dark:border-slate-700/60 dark:text-slate-100 focus:outline-none" value={filterBatch} onChange={e => setFilterBatch(e.target.value)}>
                <option value="">All Batches</option>
                {batches.map(b => <option key={b.id} value={b.id}>{b.batch_number}</option>)}
              </select>
            </div>
          )}

          {reportType === 'weekly-payments' && (
            <div className="space-y-1">
              <Label className="text-slate-400 text-xs">Worker</Label>
              <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm dark:bg-slate-900/80 dark:border-slate-700/60 dark:text-slate-100 focus:outline-none" value={filterWorker} onChange={e => setFilterWorker(e.target.value)}>
                <option value="">All Workers</option>
                {workers.map(w => <option key={w.id} value={w.id}>{w.full_name}</option>)}
              </select>
            </div>
          )}

          {reportType === 'party-ledgers' && (
            <>
              <div className="space-y-1">
                <Label className="text-slate-400 text-xs">Party Type</Label>
                <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm dark:bg-slate-900/80 dark:border-slate-700/60 dark:text-slate-100 focus:outline-none" value={filterPartyType} onChange={e => { setFilterPartyType(e.target.value); setFilterPartyId(''); }}>
                  <option value="CUSTOMER">Customer</option>
                  <option value="SUPPLIER">Supplier</option>
                  <option value="WORKER">Worker</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-slate-400 text-xs">Select Party</Label>
                <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm dark:bg-slate-900/80 dark:border-slate-700/60 dark:text-slate-100 focus:outline-none" value={filterPartyId} onChange={e => setFilterPartyId(e.target.value)}>
                  <option value="">-- Choose Party --</option>
                  {filterPartyType === 'CUSTOMER' && customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  {filterPartyType === 'SUPPLIER' && suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  {filterPartyType === 'WORKER' && workers.map(w => <option key={w.id} value={w.id}>{w.full_name}</option>)}
                </select>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Report Table Display */}
      <Card className="bg-slate-900/70 border-slate-800 backdrop-blur-xl shadow-md text-slate-100 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-bold text-white">
            {reportType === 'production-damage' && 'Daily & Monthly Production & Damage Report'}
            {reportType === 'stock-movement' && 'Finished Stock Movement Ledger'}
            {reportType === 'weekly-payments' && 'Worker Weekly Payment Settlements'}
            {reportType === 'material-consumption' && 'Raw Material Consumption & Costing'}
            {reportType === 'party-ledgers' && 'Party Ledger Statement'}
            {reportType === 'transport-cost' && 'Vehicle & Transport Trip Log'}
            {reportType === 'batch-costing' && 'Batch Unit Costing & Operating Profitability'}
          </h3>
          <span className="text-xs text-slate-400">Records: {data.length}</span>
        </div>

        <div className="rounded-lg border border-slate-800 overflow-hidden">
          <Table>
            {reportType === 'production-damage' && (
              <>
                <TableHeader className="bg-slate-950/60">
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Date</TableHead>
                    <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Batch</TableHead>
                    <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Brick Type</TableHead>
                    <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Stage</TableHead>
                    <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Input Qty</TableHead>
                    <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Good Qty</TableHead>
                    <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Damaged Qty</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((r, i) => (
                    <TableRow key={i} className="border-slate-800 hover:bg-slate-800/40">
                      <TableCell className="text-xs text-slate-400">{r.transition_date}</TableCell>
                      <TableCell className="font-bold text-slate-100 text-xs sm:text-sm">{r.batch_number}</TableCell>
                      <TableCell className="text-slate-200 font-medium text-xs sm:text-sm">{r.brick_type_name}</TableCell>
                      <TableCell className="text-slate-300 text-xs">{r.from_stage} &rarr; {r.to_stage}</TableCell>
                      <TableCell className="text-xs text-slate-300">{r.input_quantity?.toLocaleString()}</TableCell>
                      <TableCell className="text-xs text-emerald-400 font-medium">{r.output_good_quantity?.toLocaleString()}</TableCell>
                      <TableCell className="text-xs text-rose-400 font-bold">{r.damaged_quantity?.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </>
            )}

            {reportType === 'stock-movement' && (
              <>
                <TableHeader className="bg-slate-950/60">
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Date</TableHead>
                    <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Transaction</TableHead>
                    <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Type & Grade</TableHead>
                    <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Qty Change</TableHead>
                    <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Balance After</TableHead>
                    <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((r, i) => (
                    <TableRow key={i} className="border-slate-800 hover:bg-slate-800/40">
                      <TableCell className="text-xs text-slate-400">{r.transaction_date}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-blue-500/40 text-blue-400 bg-blue-500/10 text-[10px] font-bold">
                          {r.transaction_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-300 text-xs">{r.brick_type_name} ({r.brick_grade_name || '-'})</TableCell>
                      <TableCell className={`font-bold text-xs sm:text-sm ${r.quantity_change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {r.quantity_change > 0 ? `+${r.quantity_change?.toLocaleString()}` : r.quantity_change?.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-xs text-slate-200 font-semibold">{r.balance_after?.toLocaleString()}</TableCell>
                      <TableCell className="text-xs text-slate-400">{r.reason}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </>
            )}

            {reportType === 'weekly-payments' && (
              <>
                <TableHeader className="bg-slate-950/60">
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Settlement #</TableHead>
                    <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Worker</TableHead>
                    <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Period</TableHead>
                    <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Total Bricks</TableHead>
                    <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Gross Wages</TableHead>
                    <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Remaining Due</TableHead>
                    <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((r, i) => (
                    <TableRow key={i} className="border-slate-800 hover:bg-slate-800/40">
                      <TableCell className="font-bold text-slate-100 text-xs sm:text-sm">{r.settlement_number}</TableCell>
                      <TableCell className="text-slate-200 font-medium text-xs sm:text-sm">{r.worker_name}</TableCell>
                      <TableCell className="text-xs text-slate-400">{r.period_start_date} to {r.period_end_date}</TableCell>
                      <TableCell className="text-xs text-slate-300">{r.total_bricks?.toLocaleString()}</TableCell>
                      <TableCell className="text-xs font-semibold text-slate-200">{formatINR(r.gross_amount_paise)}</TableCell>
                      <TableCell className="font-bold text-rose-400 text-xs sm:text-sm">{formatINR(r.remaining_due_paise)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 bg-emerald-500/10 text-[10px] font-bold">
                          {r.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </>
            )}

            {reportType === 'material-consumption' && (
              <>
                <TableHeader className="bg-slate-950/60">
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Date</TableHead>
                    <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Material</TableHead>
                    <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Quantity</TableHead>
                    <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Batch</TableHead>
                    <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Total Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((r, i) => (
                    <TableRow key={i} className="border-slate-800 hover:bg-slate-800/40">
                      <TableCell className="text-xs text-slate-400">{r.consumption_date}</TableCell>
                      <TableCell className="text-slate-200 font-medium text-xs sm:text-sm">{r.material_name}</TableCell>
                      <TableCell className="text-xs text-slate-300">{r.quantity} {r.unit_code}</TableCell>
                      <TableCell className="text-xs text-slate-400">{r.batch_number || 'General Overhead'}</TableCell>
                      <TableCell className="font-bold text-white text-xs sm:text-sm">{formatINR(r.cost_paise)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </>
            )}

            {reportType === 'party-ledgers' && (
              <>
                <TableHeader className="bg-slate-950/60">
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Entry Date</TableHead>
                    <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Record Type</TableHead>
                    <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Description</TableHead>
                    <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Amount</TableHead>
                    <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((r, i) => (
                    <TableRow key={i} className="border-slate-800 hover:bg-slate-800/40">
                      <TableCell className="text-xs text-slate-400">{r.entry_date}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`${r.record_type === 'PAYMENT' ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10' : 'border-amber-500/40 text-amber-400 bg-amber-500/10'} text-[10px] font-bold`}
                        >
                          {r.record_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-slate-300">{r.description}</TableCell>
                      <TableCell className="font-bold text-white text-xs sm:text-sm">{formatINR(r.amount_paise)}</TableCell>
                      <TableCell className="text-xs text-slate-400">{r.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </>
            )}

            {reportType === 'transport-cost' && (
              <>
                <TableHeader className="bg-slate-950/60">
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Date</TableHead>
                    <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Vehicle</TableHead>
                    <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Driver</TableHead>
                    <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Route</TableHead>
                    <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Distance</TableHead>
                    <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((r, i) => (
                    <TableRow key={i} className="border-slate-800 hover:bg-slate-800/40">
                      <TableCell className="text-xs text-slate-400">{r.trip_date}</TableCell>
                      <TableCell className="font-bold text-slate-100 text-xs sm:text-sm">{r.registration_number}</TableCell>
                      <TableCell className="text-xs text-slate-300">{r.driver_name || '-'}</TableCell>
                      <TableCell className="text-xs text-slate-300">{r.origin || 'Yard'} &rarr; {r.destination || 'Site'}</TableCell>
                      <TableCell className="text-xs text-slate-400">{r.distance_km ? `${r.distance_km} KM` : '-'}</TableCell>
                      <TableCell className="font-bold text-white text-xs sm:text-sm">{formatINR(r.cost_paise)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </>
            )}

            {reportType === 'batch-costing' && (
              <>
                <TableHeader className="bg-slate-950/60">
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Batch #</TableHead>
                    <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Brick Type</TableHead>
                    <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Good Bricks</TableHead>
                    <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Moulding Cost</TableHead>
                    <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Material Cost</TableHead>
                    <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Total Cost</TableHead>
                    <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Cost / 1,000 Bricks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((r, i) => (
                    <TableRow key={i} className="border-slate-800 hover:bg-slate-800/40">
                      <TableCell className="font-bold text-slate-100 text-xs sm:text-sm">{r.batch_number}</TableCell>
                      <TableCell className="text-slate-200 font-medium text-xs sm:text-sm">{r.brick_type_name}</TableCell>
                      <TableCell className="text-xs text-slate-300">{r.fired_good_quantity?.toLocaleString()}</TableCell>
                      <TableCell className="text-xs text-slate-300">{formatINR(r.moulding_cost_paise)}</TableCell>
                      <TableCell className="text-xs text-slate-300">{formatINR(r.material_cost_paise)}</TableCell>
                      <TableCell className="font-bold text-white text-xs sm:text-sm">{formatINR(r.total_cost_paise)}</TableCell>
                      <TableCell className="font-extrabold text-emerald-400 text-xs sm:text-sm">{r.cost_per_1000_paise ? formatINR(r.cost_per_1000_paise) : 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </>
            )}
          </Table>
        </div>
      </Card>
    </div>
  );
};
