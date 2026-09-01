'use client';

import React, { useState } from 'react';
import { BarChart3, Filter } from 'lucide-react';
import { useReport } from '@/features/reports/hooks/useReports';
import type { ReportType } from '@/features/reports/api/reports.api';
import { DataTable, Column } from '@/components/ui/data-table/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ReportsPage() {
  const [selectedReportType, setSelectedReportType] = useState<ReportType>('production-summary');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Fetch report data using TanStack Query hook
  const { data: reportData = [], isLoading, refetch } = useReport<any[]>(
    selectedReportType,
    {
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    }
  );

  // Dynamic Column Generators
  const getColumns = (): Column<any>[] => {
    switch (selectedReportType) {
      case 'production-summary':
        return [
          {
            accessorKey: 'production_date',
            header: 'Date',
            cell: ({ row }) => (
              <span className="text-muted-foreground font-mono text-[11px]">
                {row.original.production_date}
              </span>
            ),
          },
          {
            accessorKey: 'brick_type_name',
            header: 'Brick Type',
            cell: ({ row }) => (
              <span className="font-semibold text-foreground">{row.original.brick_type_name}</span>
            ),
          },
          {
            accessorKey: 'worker_name',
            header: 'Worker',
            cell: ({ row }) => (
              <span className="text-muted-foreground text-xs">{row.original.worker_name ?? '—'}</span>
            ),
          },
          {
            accessorKey: 'bricks_moulded',
            header: 'Bricks Moulded',
            align: 'right',
            cell: ({ row }) => (
              <span className="font-mono font-bold text-foreground">
                {Number(row.original.bricks_moulded).toLocaleString()}
              </span>
            ),
          },
        ];

      case 'worker-settlements':
        return [
          {
            accessorKey: 'worker_name',
            header: 'Worker Name',
            cell: ({ row }) => (
              <span className="font-semibold text-foreground">{row.original.worker_name}</span>
            ),
          },
          {
            accessorKey: 'period_start',
            header: 'Period',
            cell: ({ row }) => (
              <span className="text-muted-foreground font-mono text-[11px]">
                {row.original.period_start} → {row.original.period_end}
              </span>
            ),
          },
          {
            accessorKey: 'gross_wage',
            header: 'Gross Wage',
            align: 'right',
            cell: ({ row }) => (
              <span className="font-mono font-semibold">₹{Number(row.original.gross_wage).toFixed(2)}</span>
            ),
          },
          {
            accessorKey: 'advances_deducted',
            header: 'Advances',
            align: 'right',
            cell: ({ row }) => (
              <span className="font-mono text-amber-600">₹{Number(row.original.advances_deducted).toFixed(2)}</span>
            ),
          },
          {
            accessorKey: 'net_payable',
            header: 'Net Payable',
            align: 'right',
            cell: ({ row }) => (
              <span className="font-mono font-bold text-emerald-600">₹{Number(row.original.net_payable).toFixed(2)}</span>
            ),
          },
        ];

      case 'inventory-stock':
        return [
          {
            accessorKey: 'item_name',
            header: 'Item Name',
            cell: ({ row }) => (
              <span className="font-semibold text-foreground">{row.original.item_name}</span>
            ),
          },
          {
            accessorKey: 'item_type',
            header: 'Item Type',
            cell: ({ row }) => (
              <span className="font-mono text-xs text-muted-foreground">{row.original.item_type}</span>
            ),
          },
          {
            accessorKey: 'stock',
            header: 'Current Stock',
            align: 'right',
            cell: ({ row }) => (
              <span className="font-mono font-bold">{Number(row.original.stock).toLocaleString()}</span>
            ),
          },
        ];

      case 'sales-summary':
        return [
          {
            accessorKey: 'order_date',
            header: 'Order Date',
            cell: ({ row }) => (
              <span className="text-muted-foreground font-mono text-[11px]">{row.original.order_date}</span>
            ),
          },
          {
            accessorKey: 'customer_name',
            header: 'Customer',
            cell: ({ row }) => (
              <span className="font-semibold text-foreground">{row.original.customer_name}</span>
            ),
          },
          {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => (
              <span className="capitalize font-mono text-xs">{row.original.status}</span>
            ),
          },
          {
            accessorKey: 'total_amount',
            header: 'Total Amount',
            align: 'right',
            cell: ({ row }) => (
              <span className="font-mono font-bold">₹{Number(row.original.total_amount).toLocaleString('en-IN')}</span>
            ),
          },
        ];

      case 'payment-summary':
        return [
          {
            accessorKey: 'payment_date',
            header: 'Payment Date',
            cell: ({ row }) => (
              <span className="text-muted-foreground font-mono text-[11px]">{row.original.payment_date}</span>
            ),
          },
          {
            accessorKey: 'customer_name',
            header: 'Customer',
            cell: ({ row }) => (
              <span className="font-semibold text-foreground">{row.original.customer_name}</span>
            ),
          },
          {
            accessorKey: 'payment_mode',
            header: 'Mode',
            cell: ({ row }) => (
              <span className="uppercase font-mono text-xs">{row.original.payment_mode || '—'}</span>
            ),
          },
          {
            accessorKey: 'amount',
            header: 'Amount',
            align: 'right',
            cell: ({ row }) => (
              <span className="font-mono font-bold text-emerald-600">₹{Number(row.original.amount).toLocaleString('en-IN')}</span>
            ),
          },
        ];

      default:
        return [];
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" /> Reports & Financial Analytics
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Comprehensive kiln performance, worker settlements, inventory stock, and payment summaries
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
              Select Report Type
            </label>
            <select
              value={selectedReportType}
              onChange={(e) => setSelectedReportType(e.target.value as ReportType)}
              className="rounded border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground focus:ring-1 focus:ring-primary"
            >
              <option value="production-summary">Production Output Summary</option>
              <option value="worker-settlements">Worker Settlement Ledger</option>
              <option value="inventory-stock">Inventory Stock Status</option>
              <option value="sales-summary">Sales Orders Breakdown</option>
              <option value="payment-summary">Payment Receipts Summary</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
              Start Date
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-8 text-xs"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
              End Date
            </label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-8 text-xs"
            />
          </div>
        </div>

        <Button
          onClick={() => refetch()}
          size="sm"
          className="self-end gap-1.5"
        >
          <Filter className="h-3.5 w-3.5" /> Refresh Report
        </Button>
      </div>

      {/* Render Data Table */}
      <DataTable
        columns={getColumns()}
        data={Array.isArray(reportData) ? reportData : []}
        searchPlaceholder="Filter report records..."
        showExport={false}
      />
    </div>
  );
}
