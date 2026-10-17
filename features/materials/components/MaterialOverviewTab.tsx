"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  Calendar,
  CheckCircle2,
  Flame,
  IndianRupee,
  ShoppingCart,
  Truck
} from "lucide-react";
import { MaterialDetail } from "../types/materials.types";
import { MaterialTabType } from "./MaterialDetailTabs";

interface MaterialOverviewTabProps {
  material: MaterialDetail;
  onSelectTab?: (tab: MaterialTabType) => void;
}

export function MaterialOverviewTab({
  material,
  onSelectTab,
}: MaterialOverviewTabProps) {
  const isLowStock =
    material.reorder_level != null &&
    material.available_stock <= material.reorder_level;

  const totalSpend = material.recent_purchases.reduce(
    (sum, p) => sum + p.total_amount,
    0
  );

  const batchSummaries = material.batch_consumption_summary || [];

  const totalConsumedQty = batchSummaries.reduce(
    (sum, b) => sum + b.total_quantity,
    0
  );

  const bhattisCount = batchSummaries.length;

  return (
    <div className="space-y-4">
      {/* 5 KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Card 1: Available Stock */}
        <div className="p-3.5 rounded-xl border border-border bg-card shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase">
              Available Stock
            </span>
            <Boxes className="h-4 w-4 text-primary" />
          </div>
          <div className="text-lg font-bold text-foreground font-mono">
            {material.available_stock.toLocaleString()}{" "}
            <span className="text-xs font-normal text-muted-foreground uppercase">
              {material.unit}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground">
            {material.lots_summary.active_lots} active lot(s) in inventory
          </p>
        </div>

        {/* Card 2: Total Purchased Qty */}
        <div className="p-3.5 rounded-xl border border-border bg-card shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase">
              Total Purchased
            </span>
            <ShoppingCart className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-lg font-bold text-foreground font-mono">
            {material.total_quantity_purchased.toLocaleString()}{" "}
            <span className="text-xs font-normal text-muted-foreground uppercase">
              {material.unit}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Across {material.total_purchases} purchase record(s)
          </p>
        </div>

        {/* Card 3: Bhatti Usage */}
        <div className="p-3.5 rounded-xl border border-border bg-card shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase">
              Total Used
            </span>
            <Flame className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-lg font-bold text-foreground font-mono">
            {totalConsumedQty.toLocaleString()}{" "}
            <span className="text-xs font-normal text-muted-foreground uppercase">
              {material.unit}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground">
            In {bhattisCount} bhatti session(s)
          </p>
        </div>

        {/* Card 4: Total Spend */}
        <div className="p-3.5 rounded-xl border border-border bg-card shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase">
              Total Spend
            </span>
            <IndianRupee className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-lg font-bold text-foreground font-mono">
            ₹{totalSpend.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
          </div>
          <p className="text-[10px] text-muted-foreground">Recent purchase spend</p>
        </div>

        {/* Card 5: Reorder Threshold */}
        <div
          className={`p-3.5 rounded-xl border shadow-xs space-y-1 col-span-2 sm:col-span-1 ${
            isLowStock
              ? "border-destructive/50 bg-destructive/5"
              : "border-border bg-card"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase">
              Reorder Level
            </span>
            <AlertTriangle
              className={`h-4 w-4 ${
                isLowStock ? "text-destructive" : "text-amber-500"
              }`}
            />
          </div>
          <div className="text-lg font-bold text-foreground font-mono">
            {material.reorder_level != null
              ? material.reorder_level.toLocaleString()
              : "—"}{" "}
            <span className="text-xs font-normal text-muted-foreground uppercase">
              {material.unit}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground truncate">
            {isLowStock
              ? "Stock below threshold! Reorder needed."
              : "Stock level optimal"}
          </p>
        </div>
      </div>

      {/* Bhatti-wise Material Consumption Section (Aggregated per Bhatti session) */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
          <div>
            <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
              <Flame className="h-4 w-4 text-amber-500" />
              Bhatti-wise Material Usage / भट्टी निहाय वापर (Aggregated)
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Consolidated consumption per bhatti session. Multiple imports & refill loads for the same bhatti are grouped here.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Badge variant="outline" className="text-[10px] font-mono">
              {bhattisCount} Bhatti Session{bhattisCount === 1 ? "" : "s"}
            </Badge>
            {onSelectTab && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSelectTab("consumption")}
                className="h-7 px-2 text-[11px] font-semibold text-primary gap-1 cursor-pointer"
              >
                View Detailed Logs
                <ArrowRight className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {batchSummaries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {batchSummaries.map((b) => {
              const isSingleEntry = b.entry_count === 1;
              const hasDateRange =
                b.first_consumption_date !== b.last_consumption_date;

              return (
                <div
                  key={b.batch_id || b.batch_name}
                  className="p-3.5 rounded-xl border border-border bg-muted/15 shadow-2xs hover:border-amber-500/40 hover:bg-card transition-all flex flex-col justify-between space-y-3"
                >
                  {/* Top: Batch Title & Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                        <Flame className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-foreground tracking-tight block">
                          {b.batch_name}
                        </span>
                        {b.batch_stage && (
                          <span className="text-[10px] text-muted-foreground uppercase font-mono">
                            Stage: {b.batch_stage}
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      {b.batch_status === "IN_PROGRESS" ? (
                        <Badge
                          variant="outline"
                          className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 text-[10px] py-0 px-1.5 flex items-center gap-1"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                          Active
                        </Badge>
                      ) : b.batch_status === "COMPLETED" ? (
                        <Badge
                          variant="outline"
                          className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-[10px] py-0 px-1.5 flex items-center gap-1"
                        >
                          <CheckCircle2 className="h-2.5 w-2.5" />
                          Completed
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                          {b.batch_status}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Middle: Aggregated Quantity & Value */}
                  <div className="space-y-2">
                    <div className="p-2.5 rounded-lg bg-card border border-border flex items-center justify-between">
                      <span className="text-[11px] font-medium text-muted-foreground">
                        Total Consumed
                      </span>
                      <span className="font-mono text-sm font-bold text-amber-600 dark:text-amber-400">
                        {b.total_quantity.toLocaleString()} {material.unit}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] px-1">
                      <span className="text-muted-foreground">Cost Value:</span>
                      <span className="font-mono font-semibold text-foreground">
                        {b.total_cost > 0
                          ? `₹${b.total_cost.toLocaleString("en-IN", {
                              maximumFractionDigits: 2,
                            })}`
                          : "—"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] px-1">
                      <span className="text-muted-foreground">Import Logs:</span>
                      {isSingleEntry ? (
                        <Badge
                          variant="outline"
                          className="text-[10px] font-mono py-0 text-muted-foreground"
                        >
                          1 Single Entry
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="text-[10px] font-semibold py-0 bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-300/30"
                        >
                          ⚡ {b.entry_count} Refill Records
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Bottom: Date Range & Action */}
                  <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[10px] text-muted-foreground">
                    <div className="flex items-center gap-1 font-mono">
                      <Calendar className="h-3 w-3 shrink-0" />
                      <span>
                        {hasDateRange
                          ? `${b.first_consumption_date} → ${b.last_consumption_date}`
                          : b.first_consumption_date}
                      </span>
                    </div>
                    {onSelectTab && (
                      <button
                        type="button"
                        onClick={() => onSelectTab("consumption")}
                        className="text-[10px] font-semibold text-primary hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        Ledger <ArrowRight className="h-2.5 w-2.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 text-center border border-dashed border-border rounded-xl bg-muted/10 space-y-1.5">
            <Flame className="h-7 w-7 text-muted-foreground/50 mx-auto" />
            <p className="text-xs font-semibold text-foreground">
              No Bhatti Consumption Recorded Yet
            </p>
            <p className="text-[11px] text-muted-foreground max-w-md mx-auto">
              When this material (e.g. coal/fuel) is logged during bhatti firing or production, the consolidated usage per bhatti will automatically be summarized here.
            </p>
          </div>
        )}
      </div>

      {/* Dual Section: Purchases & Associated Suppliers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Mini Purchases Table */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-blue-500" /> Recent Purchases / खरेदी नोंदी
            </h3>
            {onSelectTab && material.recent_purchases.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSelectTab("purchases")}
                className="h-6 px-1.5 text-[10px] font-semibold text-primary gap-1 cursor-pointer"
              >
                All Purchases <ArrowRight className="h-2.5 w-2.5" />
              </Button>
            )}
          </div>
          {material.recent_purchases.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border text-[10px] font-bold text-muted-foreground uppercase">
                  <tr>
                    <th className="py-1.5">Date</th>
                    <th className="py-1.5">Supplier</th>
                    <th className="py-1.5 text-right">Qty</th>
                    <th className="py-1.5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {material.recent_purchases.slice(0, 5).map((p) => (
                    <tr key={p.id}>
                      <td className="py-2 font-mono text-[11px]">{p.purchase_date}</td>
                      <td className="py-2 font-medium truncate max-w-[120px]">
                        {p.supplier_name}
                      </td>
                      <td className="py-2 text-right font-mono font-semibold">
                        {p.quantity} {material.unit}
                      </td>
                      <td className="py-2 text-right font-mono font-semibold text-emerald-600">
                        ₹{p.total_amount.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground py-2 italic">
              No purchase history found.
            </p>
          )}
        </div>

        {/* Linked Suppliers Section */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-foreground flex items-center gap-2 border-b border-border pb-2">
            <Truck className="h-4 w-4 text-primary" /> Associated Supplier Directory / पुरवठादार माहिती
          </h3>
          {material.suppliers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {material.suppliers.map((supplier) => (
                <div
                  key={supplier.id}
                  className="p-3 rounded-lg border border-border bg-muted/20 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-foreground truncate max-w-[120px]">
                      {supplier.name}
                    </span>
                    <Badge variant="outline" className="text-[9px] py-0 px-1 font-mono">
                      Active
                    </Badge>
                  </div>
                  {supplier.contact_person && (
                    <p className="text-[11px] text-muted-foreground truncate">
                      Contact: <strong className="text-foreground">{supplier.contact_person}</strong>
                    </p>
                  )}
                  {supplier.phone && (
                    <p className="text-[11px] text-muted-foreground font-mono">
                      Phone: {supplier.phone}
                    </p>
                  )}
                  {supplier.address && (
                    <p className="text-[11px] text-muted-foreground truncate">
                      {supplier.address}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground py-2 italic">
              No supplier is directly linked to this material yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

