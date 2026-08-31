'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, Download, Filter, FileText, TrendingUp, DollarSign } from 'lucide-react';
import { getReportDataAction } from '@/features/reports/actions';
import { DataTable } from '@/components/ui/data-table/data-table';
import { toast } from 'sonner';

export default function ReportsPage() {
  const [reportType, setReportType] = useState<string>('batch-costing');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReport();
  }, [reportType]);

  async function fetchReport() {
    setLoading(true);
    const res = await getReportDataAction(reportType, { start_date: startDate, end_date: endDate });
    if (res.success) {
      setReportData(res.data);
    } else {
      toast.error(res.error || 'Failed to fetch report');
    }
    setLoading(false);
  }

  // Dynamic Column Generators
  const getColumns = (): any[] => {
    if (reportType === 'batch-costing') {
      return [
        { accessorKey: 'batch_number', header: 'Batch #', cell: ({ row }: any) => <span className="font-mono font-bold text-foreground">{row.original.batch_number}</span> },
        { accessorKey: 'brick_type_name', header: 'Brick Type', cell: ({ row }: any) => <span>{row.original.brick_type_name}</span> },
        { accessorKey: 'fired_good_quantity', header: 'Fired Good Qty', cell: ({ row }: any) => <span className="font-semibold">{parseInt(row.original.fired_good_quantity || '0', 10).toLocaleString()}</span> },
        { accessorKey: 'moulding_cost_paise', header: 'Moulding Labor', cell: ({ row }: any) => <span>₹{(parseInt(row.original.moulding_cost_paise || '0', 10) / 100).toFixed(2)}</span> },
        { accessorKey: 'material_cost_paise', header: 'Materials', cell: ({ row }: any) => <span>₹{(parseInt(row.original.material_cost_paise || '0', 10) / 100).toFixed(2)}</span> },
        { accessorKey: 'total_cost_paise', header: 'Total Batch Cost', cell: ({ row }: any) => <span className="font-bold text-primary">₹{(parseInt(row.original.total_cost_paise || '0', 10) / 100).toFixed(2)}</span> },
        { accessorKey: 'cost_per_1000_paise', header: 'Cost / 1K Bricks', cell: ({ row }: any) => <span className="font-bold text-emerald-600 dark:text-emerald-400">{row.original.cost_per_1000_paise ? `₹${(parseInt(row.original.cost_per_1000_paise, 10) / 100).toFixed(2)}` : 'N/A'}</span> },
      ];
    }

    if (reportType === 'production-damage') {
      return [
        { accessorKey: 'transition_date', header: 'Date', cell: ({ row }: any) => <span className="text-muted-foreground">{row.original.transition_date}</span> },
        { accessorKey: 'batch_number', header: 'Batch #', cell: ({ row }: any) => <span className="font-mono font-bold">{row.original.batch_number}</span> },
        { accessorKey: 'brick_type_name', header: 'Brick Type', cell: ({ row }: any) => <span>{row.original.brick_type_name}</span> },
        { accessorKey: 'from_stage', header: 'From → To Stage', cell: ({ row }: any) => <span className="text-xs font-semibold">{row.original.from_stage} → {row.original.to_stage}</span> },
        { accessorKey: 'input_quantity', header: 'Input Qty', cell: ({ row }: any) => <span>{parseInt(row.original.input_quantity || '0', 10).toLocaleString()}</span> },
        { accessorKey: 'output_good_quantity', header: 'Good Qty', cell: ({ row }: any) => <span className="font-bold text-emerald-600 dark:text-emerald-400">{parseInt(row.original.output_good_quantity || '0', 10).toLocaleString()}</span> },
        { accessorKey: 'damaged_quantity', header: 'Damaged Qty', cell: ({ row }: any) => <span className="font-bold text-destructive">{parseInt(row.original.damaged_quantity || '0', 10).toLocaleString()}</span> },
      ];
    }

    if (reportType === 'stock-movement') {
      return [
        { accessorKey: 'transaction_date', header: 'Date', cell: ({ row }: any) => <span className="text-muted-foreground">{row.original.transaction_date}</span> },
        { accessorKey: 'transaction_type', header: 'Type', cell: ({ row }: any) => <span className="font-mono font-bold text-xs">{row.original.transaction_type}</span> },
        { accessorKey: 'brick_type_name', header: 'Item', cell: ({ row }: any) => <span>{row.original.brick_type_name} ({row.original.brick_grade_name || 'N/A'})</span> },
        { accessorKey: 'quantity_change', header: 'Qty Change', cell: ({ row }: any) => <span className="font-bold">{row.original.quantity_change > 0 ? `+${row.original.quantity_change}` : row.original.quantity_change}</span> },
        { accessorKey: 'balance_after', header: 'Balance After', cell: ({ row }: any) => <span className="font-bold text-foreground">{parseInt(row.original.balance_after || '0', 10).toLocaleString()}</span> },
      ];
    }

    return [];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" /> Reports & Financial Analytics
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Comprehensive kiln performance, unit costing per 1,000 bricks, and operating P&L analysis
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Select Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="rounded border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground focus:ring-1 focus:ring-primary"
            >
              <option value="batch-costing">Batch Unit Costing Breakdown</option>
              <option value="production-damage">Daily Production & Damage Report</option>
              <option value="stock-movement">Stock Movement Ledger</option>
              <option value="weekly-payments">Weekly Worker Settlements</option>
              <option value="material-consumption">Material Consumption Audit</option>
              <option value="operating-profit">Operating P&L Summary</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded border border-border bg-card px-3 py-1.5 text-xs text-foreground"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded border border-border bg-card px-3 py-1.5 text-xs text-foreground"
            />
          </div>
        </div>

        <button
          onClick={fetchReport}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 shadow-xs self-end"
        >
          <Filter className="h-4 w-4" /> Apply Filters
        </button>
      </div>

      {/* Render Operating Profit Widget if selected */}
      {reportType === 'operating-profit' && reportData && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 bg-card border border-border rounded-xl space-y-1">
            <span className="text-xs font-bold text-muted-foreground uppercase">Total Sales Revenue</span>
            <div className="text-2xl font-extrabold text-foreground">
              ₹{(parseInt(reportData.total_sales_revenue_paise || '0', 10) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="p-5 bg-card border border-border rounded-xl space-y-1">
            <span className="text-xs font-bold text-muted-foreground uppercase">Cost of Goods Sold (COGS)</span>
            <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
              ₹{(parseInt(reportData.total_cogs_paise || '0', 10) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="p-5 bg-card border border-border rounded-xl space-y-1">
            <span className="text-xs font-bold text-muted-foreground uppercase">Operating Profit</span>
            <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              ₹{(parseInt(reportData.operating_profit_paise || '0', 10) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      )}

      {/* Render Data Table for Tabular Reports */}
      {reportType !== 'operating-profit' && Array.isArray(reportData) && (
        <DataTable columns={getColumns()} data={reportData} searchPlaceholder="Filter report records..." exportFileName={`${reportType}_report.csv`} />
      )}
    </div>
  );
}
