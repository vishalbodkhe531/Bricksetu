import React, { useState, useEffect } from 'react';
import { FileText, Download, Printer, Filter } from 'lucide-react';
import { apiRequest } from '../../shared/api/client';
import { formatINR } from '../../shared/utils/formatters';
import { exportToCSV } from '../../shared/utils/csvExporter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormSelect } from '@/components/ui/form-select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '../../shared/components/PageHeader';
import { EmptyState } from '../../shared/components/EmptyState';

export const ReportsView: React.FC = () => {
  const [reportType, setReportType] = useState<string>('production-damage');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [batches, setBatches] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);

  const [filterBatch, setFilterBatch] = useState('');
  const [filterWorker, setFilterWorker] = useState('');
  const [filterPartyType, setFilterPartyType] = useState('CUSTOMER');
  const [filterPartyId, setFilterPartyId] = useState('');

  useEffect(() => { loadLookupData(); }, []);
  useEffect(() => { fetchReportData(); }, [reportType, startDate, endDate, filterBatch, filterWorker, filterPartyType, filterPartyId]);

  async function loadLookupData() {
    try {
      const [b, w, c, s] = await Promise.all([apiRequest('/batches'), apiRequest('/workers'), apiRequest('/customers'), apiRequest('/suppliers')]);
      setBatches(b); setWorkers(w); setCustomers(c); setSuppliers(s);
    } catch (err: any) { console.error(err); }
  }

  async function fetchReportData() {
    setLoading(true);
    try {
      let queryStr = `?start_date=${startDate}&end_date=${endDate}`;
      if (reportType === 'production-damage') {
        if (filterBatch) queryStr += `&batch_id=${filterBatch}`;
        setData(await apiRequest(`/reports/production-damage${queryStr}`));
      } else if (reportType === 'stock-movement') {
        setData(await apiRequest(`/reports/stock-movement${queryStr}`));
      } else if (reportType === 'weekly-payments') {
        if (filterWorker) queryStr += `&worker_id=${filterWorker}`;
        setData(await apiRequest(`/reports/weekly-payments${queryStr}`));
      } else if (reportType === 'material-consumption') {
        if (filterBatch) queryStr += `&batch_id=${filterBatch}`;
        setData(await apiRequest(`/reports/material-consumption${queryStr}`));
      } else if (reportType === 'party-ledgers') {
        if (filterPartyId) { setData(await apiRequest(`/reports/party-ledgers?party_type=${filterPartyType}&party_id=${filterPartyId}`)); }
        else { setData([]); }
      } else if (reportType === 'transport-cost') {
        setData(await apiRequest(`/reports/transport-cost${queryStr}`));
      } else if (reportType === 'batch-costing') {
        setData(await apiRequest(`/reports/batch-costing`));
      }
    } catch (err: any) { console.error(err); } finally { setLoading(false); }
  }

  const handleExportCSV = () => {
    if (data.length === 0) return;
    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    if (reportType === 'production-damage') { headers = ['Date', 'Batch', 'Brick Type', 'From Stage', 'To Stage', 'Input Qty', 'Good Qty', 'Damaged Qty']; rows = data.map(r => [r.transition_date, r.batch_number, r.brick_type_name, r.from_stage, r.to_stage, r.input_quantity, r.output_good_quantity, r.damaged_quantity]); }
    else if (reportType === 'stock-movement') { headers = ['Date', 'Transaction', 'Brick Type', 'Grade', 'Change', 'Balance After', 'Reason']; rows = data.map(r => [r.transaction_date, r.transaction_type, r.brick_type_name, r.brick_grade_name || '-', r.quantity_change, r.balance_after, r.reason]); }
    else if (reportType === 'weekly-payments') { headers = ['Settlement #', 'Worker', 'Start Date', 'End Date', 'Total Bricks', 'Gross Wages (₹)', 'Due (₹)', 'Status']; rows = data.map(r => [r.settlement_number, r.worker_name, r.period_start_date, r.period_end_date, r.total_bricks, Number(r.gross_amount_paise)/100, Number(r.remaining_due_paise)/100, r.status]); }
    else if (reportType === 'material-consumption') { headers = ['Date', 'Material', 'Quantity', 'Batch', 'Cost (₹)', 'Notes']; rows = data.map(r => [r.consumption_date, r.material_name, `${r.quantity} ${r.unit_code}`, r.batch_number || 'General', Number(r.cost_paise)/100, r.notes || '']); }
    else if (reportType === 'party-ledgers') { headers = ['Entry Date', 'Record Type', 'Description', 'Amount (₹)', 'Status']; rows = data.map(r => [r.entry_date, r.record_type, r.description, Number(r.amount_paise)/100, r.status]); }
    else if (reportType === 'transport-cost') { headers = ['Date', 'Vehicle', 'Driver', 'Origin/Destination', 'Distance KM', 'Cost (₹)']; rows = data.map(r => [r.trip_date, r.registration_number, r.driver_name || '-', `${r.origin} to ${r.destination}`, r.distance_km || 0, Number(r.cost_paise)/100]); }
    else if (reportType === 'batch-costing') { headers = ['Batch #', 'Brick Type', 'Fired Good Qty', 'Moulding Wages (₹)', 'Material Cost (₹)', 'Expenses (₹)', 'Total Cost (₹)', 'Cost / 1,000 (₹)']; rows = data.map(r => [r.batch_number, r.brick_type_name, r.fired_good_quantity, Number(r.moulding_cost_paise)/100, Number(r.material_cost_paise)/100, Number(r.expense_cost_paise)/100, Number(r.total_cost_paise)/100, r.cost_per_1000_paise ? Number(r.cost_per_1000_paise)/100 : 0]); }
    exportToCSV(reportType, headers, rows);
  };

  const reportTabs = [
    { id: 'production-damage', label: 'Production & Damage' },
    { id: 'stock-movement', label: 'Stock Movement' },
    { id: 'weekly-payments', label: 'Worker Wages' },
    { id: 'material-consumption', label: 'Material Usage' },
    { id: 'party-ledgers', label: 'Party Ledgers' },
    { id: 'transport-cost', label: 'Transport Costs' },
    { id: 'batch-costing', label: 'Batch Costing' },
  ];

  const thClass = "text-muted-foreground font-semibold uppercase text-[11px] tracking-wide";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Audit Analytics"
        description="Filterable operational reports, batch costing, party ledgers, and printable statements"
        icon={<FileText className="size-5 sm:size-6" />}
        actions={
          <div className="flex flex-wrap items-center gap-2 no-print">
            <Button variant="outline" onClick={() => window.print()} className="border-border text-foreground hover:bg-muted gap-1.5 h-10 px-3.5 text-xs sm:text-sm cursor-pointer"><Printer className="size-4" /> Print</Button>
            <Button onClick={handleExportCSV} className="bg-orange-500 hover:bg-orange-600 text-white font-bold gap-1.5 h-10 px-4 shadow-md shadow-orange-500/20 text-xs sm:text-sm border-0 cursor-pointer"><Download className="size-4" /> Export CSV</Button>
          </div>
        }
      />

      <Tabs value={reportType} onValueChange={setReportType} className="no-print">
        <TabsList className="bg-muted p-1 rounded-xl flex flex-wrap h-auto overflow-x-auto">
          {reportTabs.map(r => (
            <TabsTrigger key={r.id} value={r.id} className="text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer">
              {r.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Filters */}
      <Card className="bg-card border-border shadow-xs text-card-foreground p-4 no-print">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Filter className="size-4 text-orange-500" />
          <strong className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Filter Parameters</strong>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className="space-y-1"><Label className="text-muted-foreground text-xs font-semibold">Start Date</Label><Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-muted/30 border-border" /></div>
          <div className="space-y-1"><Label className="text-muted-foreground text-xs font-semibold">End Date</Label><Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-muted/30 border-border" /></div>
          {(reportType === 'production-damage' || reportType === 'material-consumption') && (
            <div className="space-y-1"><Label className="text-muted-foreground text-xs font-semibold">Batch</Label>
              <FormSelect value={filterBatch} onChange={e => setFilterBatch(e.target.value)}>
                <option value="">All Batches</option>
                {batches.map(b => <option key={b.id} value={b.id}>{b.batch_number}</option>)}
              </FormSelect>
            </div>
          )}
          {reportType === 'weekly-payments' && (
            <div className="space-y-1"><Label className="text-muted-foreground text-xs font-semibold">Worker</Label>
              <FormSelect value={filterWorker} onChange={e => setFilterWorker(e.target.value)}>
                <option value="">All Workers</option>
                {workers.map(w => <option key={w.id} value={w.id}>{w.full_name}</option>)}
              </FormSelect>
            </div>
          )}
          {reportType === 'party-ledgers' && (
            <>
              <div className="space-y-1"><Label className="text-muted-foreground text-xs font-semibold">Party Type</Label>
                <FormSelect value={filterPartyType} onChange={e => { setFilterPartyType(e.target.value); setFilterPartyId(''); }}>
                  <option value="CUSTOMER">Customer</option><option value="SUPPLIER">Supplier</option><option value="WORKER">Worker</option>
                </FormSelect>
              </div>
              <div className="space-y-1"><Label className="text-muted-foreground text-xs font-semibold">Select Party</Label>
                <FormSelect value={filterPartyId} onChange={e => setFilterPartyId(e.target.value)}>
                  <option value="">-- Choose --</option>
                  {filterPartyType === 'CUSTOMER' && customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  {filterPartyType === 'SUPPLIER' && suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  {filterPartyType === 'WORKER' && workers.map(w => <option key={w.id} value={w.id}>{w.full_name}</option>)}
                </FormSelect>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Report Data Table */}
      <Card className="bg-card border-border shadow-xs text-card-foreground p-4 sm:p-5">
        {loading ? (
          <p className="text-xs text-muted-foreground text-center py-8 font-medium">Generating audit report...</p>
        ) : (
          <div className="rounded-lg border border-border overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="border-border hover:bg-transparent">
                  {reportType === 'production-damage' && (
                    <><TableHead className={thClass}>Date</TableHead><TableHead className={thClass}>Batch</TableHead><TableHead className={thClass}>Brick Type</TableHead><TableHead className={thClass}>From Stage</TableHead><TableHead className={thClass}>To Stage</TableHead><TableHead className={thClass}>Input Qty</TableHead><TableHead className={thClass}>Good Qty</TableHead><TableHead className={thClass}>Damaged Qty</TableHead></>
                  )}
                  {reportType === 'stock-movement' && (
                    <><TableHead className={thClass}>Date</TableHead><TableHead className={thClass}>Transaction</TableHead><TableHead className={thClass}>Brick Type</TableHead><TableHead className={thClass}>Grade</TableHead><TableHead className={thClass}>Qty Change</TableHead><TableHead className={thClass}>Balance After</TableHead><TableHead className={thClass}>Reason / Ref</TableHead></>
                  )}
                  {reportType === 'weekly-payments' && (
                    <><TableHead className={thClass}>Settlement #</TableHead><TableHead className={thClass}>Worker</TableHead><TableHead className={thClass}>Period</TableHead><TableHead className={thClass}>Total Bricks</TableHead><TableHead className={thClass}>Gross Wages</TableHead><TableHead className={thClass}>Net Due</TableHead><TableHead className={thClass}>Status</TableHead></>
                  )}
                  {reportType === 'material-consumption' && (
                    <><TableHead className={thClass}>Date</TableHead><TableHead className={thClass}>Material</TableHead><TableHead className={thClass}>Quantity</TableHead><TableHead className={thClass}>Batch</TableHead><TableHead className={thClass}>Cost</TableHead><TableHead className={thClass}>Notes</TableHead></>
                  )}
                  {reportType === 'party-ledgers' && (
                    <><TableHead className={thClass}>Date</TableHead><TableHead className={thClass}>Record Type</TableHead><TableHead className={thClass}>Description</TableHead><TableHead className={thClass}>Amount</TableHead><TableHead className={thClass}>Status</TableHead></>
                  )}
                  {reportType === 'transport-cost' && (
                    <><TableHead className={thClass}>Date</TableHead><TableHead className={thClass}>Vehicle</TableHead><TableHead className={thClass}>Driver</TableHead><TableHead className={thClass}>Route</TableHead><TableHead className={thClass}>Distance</TableHead><TableHead className={thClass}>Trip Cost</TableHead></>
                  )}
                  {reportType === 'batch-costing' && (
                    <><TableHead className={thClass}>Batch #</TableHead><TableHead className={thClass}>Brick Type</TableHead><TableHead className={thClass}>Good Qty</TableHead><TableHead className={thClass}>Wages</TableHead><TableHead className={thClass}>Materials</TableHead><TableHead className={thClass}>Expenses</TableHead><TableHead className={thClass}>Total Cost</TableHead><TableHead className={thClass}>Cost / 1k</TableHead></>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.length === 0 ? (
                  <TableRow><TableCell colSpan={8}><EmptyState title="No report data found" description="Adjust your date range or filter criteria above." /></TableCell></TableRow>
                ) : data.map((r, i) => (
                  <TableRow key={i} className="border-border hover:bg-muted/40">
                    {reportType === 'production-damage' && (
                      <><TableCell className="text-sm text-muted-foreground">{r.transition_date}</TableCell><TableCell className="font-semibold text-foreground text-sm">{r.batch_number}</TableCell><TableCell className="text-sm text-foreground">{r.brick_type_name}</TableCell><TableCell><Badge variant="outline" className="border-orange-500/30 text-orange-600 bg-orange-500/10 text-[10px] font-bold dark:text-orange-400">{r.from_stage}</Badge></TableCell><TableCell><Badge variant="outline" className="border-emerald-500/30 text-emerald-600 bg-emerald-500/10 text-[10px] font-bold dark:text-emerald-400">{r.to_stage}</Badge></TableCell><TableCell className="text-sm text-foreground">{r.input_quantity?.toLocaleString()}</TableCell><TableCell className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{r.output_good_quantity?.toLocaleString()}</TableCell><TableCell className="text-sm font-bold text-rose-600 dark:text-rose-400">{r.damaged_quantity?.toLocaleString()}</TableCell></>
                    )}
                    {reportType === 'stock-movement' && (
                      <><TableCell className="text-sm text-muted-foreground">{r.transaction_date}</TableCell><TableCell><Badge variant="outline" className="border-blue-500/30 text-blue-600 bg-blue-500/10 text-[10px] font-bold dark:text-blue-400">{r.transaction_type}</Badge></TableCell><TableCell className="text-foreground text-sm font-medium">{r.brick_type_name}</TableCell><TableCell className="text-sm text-muted-foreground">{r.brick_grade_name || '-'}</TableCell><TableCell className={`font-bold text-sm ${r.quantity_change >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>{r.quantity_change > 0 ? `+${r.quantity_change.toLocaleString()}` : r.quantity_change.toLocaleString()}</TableCell><TableCell className="text-sm text-foreground font-semibold">{r.balance_after?.toLocaleString()}</TableCell><TableCell className="text-sm text-muted-foreground">{r.reason || '-'}</TableCell></>
                    )}
                    {reportType === 'weekly-payments' && (
                      <><TableCell className="font-semibold text-foreground text-sm">{r.settlement_number}</TableCell><TableCell className="text-foreground text-sm font-medium">{r.worker_name}</TableCell><TableCell className="text-sm text-muted-foreground">{r.period_start_date} to {r.period_end_date}</TableCell><TableCell className="text-sm font-semibold text-foreground">{r.total_bricks?.toLocaleString()}</TableCell><TableCell className="text-sm text-foreground">{formatINR(r.gross_amount_paise)}</TableCell><TableCell className="font-bold text-rose-600 dark:text-rose-400 text-sm">{formatINR(r.remaining_due_paise)}</TableCell><TableCell><Badge variant="outline" className="border-emerald-500/30 text-emerald-600 bg-emerald-500/10 text-[10px] font-bold dark:text-emerald-400">{r.status}</Badge></TableCell></>
                    )}
                    {reportType === 'material-consumption' && (
                      <><TableCell className="text-sm text-muted-foreground">{r.consumption_date}</TableCell><TableCell className="font-semibold text-foreground text-sm">{r.material_name}</TableCell><TableCell className="text-sm text-foreground font-semibold">{r.quantity} {r.unit_code}</TableCell><TableCell className="text-sm text-muted-foreground">{r.batch_number || 'General'}</TableCell><TableCell className="font-bold text-foreground text-sm">{formatINR(r.cost_paise)}</TableCell><TableCell className="text-sm text-muted-foreground">{r.notes || '-'}</TableCell></>
                    )}
                    {reportType === 'party-ledgers' && (
                      <><TableCell className="text-sm text-muted-foreground">{r.entry_date}</TableCell><TableCell><Badge variant="outline" className="border-purple-500/30 text-purple-600 bg-purple-500/10 text-[10px] font-bold dark:text-purple-400">{r.record_type}</Badge></TableCell><TableCell className="text-foreground text-sm font-medium">{r.description}</TableCell><TableCell className="font-bold text-foreground text-sm">{formatINR(r.amount_paise)}</TableCell><TableCell><Badge variant="outline" className="border-emerald-500/30 text-emerald-600 bg-emerald-500/10 text-[10px] font-bold dark:text-emerald-400">{r.status}</Badge></TableCell></>
                    )}
                    {reportType === 'transport-cost' && (
                      <><TableCell className="text-sm text-muted-foreground">{r.trip_date}</TableCell><TableCell className="font-semibold text-foreground text-sm">{r.registration_number}</TableCell><TableCell className="text-sm text-foreground font-medium">{r.driver_name || '-'}</TableCell><TableCell className="text-sm text-foreground">{r.origin} → {r.destination}</TableCell><TableCell className="text-sm text-muted-foreground">{r.distance_km ? `${r.distance_km} km` : '-'}</TableCell><TableCell className="font-bold text-foreground text-sm">{formatINR(r.cost_paise)}</TableCell></>
                    )}
                    {reportType === 'batch-costing' && (
                      <><TableCell className="font-semibold text-foreground text-sm">{r.batch_number}</TableCell><TableCell className="text-foreground text-sm font-medium">{r.brick_type_name}</TableCell><TableCell className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{r.fired_good_quantity?.toLocaleString()}</TableCell><TableCell className="text-sm text-foreground">{formatINR(r.moulding_cost_paise)}</TableCell><TableCell className="text-sm text-foreground">{formatINR(r.material_cost_paise)}</TableCell><TableCell className="text-sm text-foreground">{formatINR(r.expense_cost_paise)}</TableCell><TableCell className="font-bold text-foreground text-sm">{formatINR(r.total_cost_paise)}</TableCell><TableCell className="font-bold text-orange-600 dark:text-orange-400 text-sm">{r.cost_per_1000_paise ? formatINR(r.cost_per_1000_paise) : '-'}</TableCell></>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
};
