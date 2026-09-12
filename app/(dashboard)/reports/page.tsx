"use client";

import React, { useState } from "react";
import { BarChart3, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table/data-table";
import { Input } from "@/components/ui/input";
import type { ReportType } from "@/features/reports/api/reports.api";
import { getReportColumns } from "@/features/reports/components/columns/report-columns";
import { useReport } from "@/features/reports/hooks/useReports";

export default function ReportsPage() {
  const [selectedReportType, setSelectedReportType] =
    useState<ReportType>("production-summary");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Fetch report data using TanStack Query hook
  const { data: reportData = [], refetch } = useReport<any[]>(
    selectedReportType,
    {
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    },
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" /> Reports & Financial
          Analytics
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Comprehensive kiln performance, worker settlements, inventory stock,
          and payment summaries
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
              onChange={(e) =>
                setSelectedReportType(e.target.value as ReportType)
              }
              className="rounded border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground focus:ring-1 focus:ring-primary"
            >
              <option value="production-summary">
                Production Output Summary
              </option>
              <option value="worker-settlements">
                Worker Settlement Ledger
              </option>
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
        columns={getReportColumns(selectedReportType)}
        data={Array.isArray(reportData) ? reportData : []}
        searchPlaceholder="Filter report records..."
        showExport={false}
      />
    </div>
  );
}
