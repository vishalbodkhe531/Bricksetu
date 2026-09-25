"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Inbox,
  Loader2,
  Search,
} from "lucide-react";
import React, { useState } from "react";

export interface Column<T> {
  id?: string;
  header: string;
  accessorKey?: keyof T | string;
  cell?: (info: { row: { original: T } }) => React.ReactNode;
  align?: "left" | "center" | "right";
  className?: string;
}

interface DataTableProps<T extends Record<string, any>> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  searchKey?: keyof T | string;
  searchPlaceholder?: string;
  exportFileName?: string;
  showExport?: boolean;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  searchKey,
  searchPlaceholder = "Search records...",
  exportFileName = "export.csv",
  showExport = true,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const filteredData = React.useMemo(() => {
    if (!searchQuery.trim()) return data;
    const query = searchQuery.toLowerCase();
    return data.filter((item) =>
      Object.values(item).some(
        (val) =>
          val !== null &&
          val !== undefined &&
          String(val).toLowerCase().includes(query),
      ),
    );
  }, [data, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage]);

  const exportCSV = () => {
    if (!data || data.length === 0) return;
    const headers = columns.map((col) => col.header).join(",");
    const rows = filteredData.map((row) =>
      columns
        .map((col) => {
          const val = col.accessorKey ? row[col.accessorKey as keyof T] : "";
          return typeof val === "object"
            ? `"${JSON.stringify(val)}"`
            : `"${val ?? ""}"`;
        })
        .join(","),
    );

    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", exportFileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Search & Export Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={searchPlaceholder}
            className="pl-9"
          />
        </div>
        {showExport && (
          <Button
            variant="secondary"
            onClick={exportCSV}
            className="w-full sm:w-auto shrink-0"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </Button>
        )}
      </div>

      {/* Table Container with hairline border & subtle elevation */}
      <div className="rounded-lg border border-border bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs min-w-max">
            <thead className="border-b border-border bg-muted/60 text-[11px] font-bold uppercase tracking-wider text-muted-foreground select-none">
              <tr>
                {columns.map((col, idx) => {
                  const alignClass =
                    col.align === "right"
                      ? "text-right"
                      : col.align === "center"
                        ? "text-center"
                        : "text-left";
                  return (
                    <th
                      key={idx}
                      className={`px-4 py-2.5 whitespace-nowrap ${alignClass} ${col.className || ""}`}
                    >
                      {col.header}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                Array.from({ length: 5 }).map((_, rIdx) => (
                  <tr key={rIdx} className="animate-pulse">
                    {columns.map((col, cIdx) => {
                      const alignClass =
                        col.align === "right"
                          ? "text-right"
                          : col.align === "center"
                            ? "text-center"
                            : "text-left";
                      return (
                        <td
                          key={cIdx}
                          className={`px-4 py-3 align-middle whitespace-nowrap ${alignClass} ${col.className || ""}`}
                        >
                          <div
                            className={`h-3.5 bg-muted/80 rounded-md animate-pulse inline-block ${
                              cIdx === 0 ? "w-24" : cIdx === 1 ? "w-36" : cIdx % 2 === 0 ? "w-20" : "w-28"
                            }`}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : paginatedData.length > 0 ? (
                paginatedData.map((row, rIdx) => (
                  <tr
                    key={rIdx}
                    className="hover:bg-muted/40 transition-colors group cursor-default"
                  >
                    {columns.map((col, cIdx) => {
                      const alignClass =
                        col.align === "right"
                          ? "text-right"
                          : col.align === "center"
                            ? "text-center"
                            : "text-left";
                      return (
                        <td
                          key={cIdx}
                          className={`px-4 py-2.5 align-middle whitespace-nowrap ${alignClass} ${col.className || ""}`}
                        >
                          {col.cell
                            ? col.cell({
                                row: {
                                  original: row,
                                  index: rIdx,
                                  totalRows: paginatedData.length,
                                } as any,
                              })
                            : col.accessorKey
                              ? String(row[col.accessorKey as keyof T] ?? "")
                              : null}
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="h-36 text-center text-xs text-muted-foreground"
                  >
                    <div className="flex flex-col items-center justify-center gap-1 py-6">
                      <Inbox className="h-8 w-8 text-muted-foreground/50 stroke-1" />
                      <p className="font-semibold text-foreground">
                        No records found
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Try adjusting your search filter or add a new entry.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border px-4 py-3 text-xs text-muted-foreground">
          <div>
            {loading ? (
              <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" /> Loading records...
              </span>
            ) : (
              <>
                Showing{" "}
                <span className="font-semibold text-foreground">
                  {paginatedData.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-foreground">
                  {filteredData.length}
                </span>{" "}
                records
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={loading || currentPage === 1}
              className="h-8 w-8 disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Previous Page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium text-[11px] text-foreground px-1">
              Page {loading ? "1" : currentPage} of {loading ? "1" : totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={loading || currentPage === totalPages}
              className="h-8 w-8 disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Next Page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
