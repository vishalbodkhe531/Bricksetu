"use client";

import React from "react";
import { MaterialDetail } from "../types/materials.types";
import { Boxes, ShoppingCart, IndianRupee, AlertTriangle, Truck, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MaterialOverviewTabProps {
  material: MaterialDetail;
}

export function MaterialOverviewTab({ material }: MaterialOverviewTabProps) {
  const isLowStock =
    material.reorder_level != null &&
    material.available_stock <= material.reorder_level;

  const totalSpend = material.recent_purchases.reduce(
    (sum, p) => sum + p.total_amount,
    0
  );

  return (
    <div className="space-y-4">
      {/* 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Available Stock */}
        <div className="p-3.5 rounded-xl border border-border bg-card shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase">Available Stock</span>
            <Boxes className="h-4 w-4 text-primary" />
          </div>
          <div className="text-lg font-bold text-foreground font-mono">
            {material.available_stock.toLocaleString()}{" "}
            <span className="text-xs font-normal text-muted-foreground uppercase">{material.unit}</span>
          </div>
          <p className="text-[10px] text-muted-foreground">
            {material.lots_summary.active_lots} active lot(s) in inventory
          </p>
        </div>

        {/* Card 2: Total Purchased Qty */}
        <div className="p-3.5 rounded-xl border border-border bg-card shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase">Total Purchased</span>
            <ShoppingCart className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-lg font-bold text-foreground font-mono">
            {material.total_quantity_purchased.toLocaleString()}{" "}
            <span className="text-xs font-normal text-muted-foreground uppercase">{material.unit}</span>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Across {material.total_purchases} purchase record(s)
          </p>
        </div>

        {/* Card 3: Total Spend */}
        <div className="p-3.5 rounded-xl border border-border bg-card shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase">Total Spend</span>
            <IndianRupee className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-lg font-bold text-foreground font-mono">
            ₹{totalSpend.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
          </div>
          <p className="text-[10px] text-muted-foreground">Recent purchase spend</p>
        </div>

        {/* Card 4: Reorder Threshold */}
        <div className={`p-3.5 rounded-xl border shadow-xs space-y-1 ${
          isLowStock ? "border-destructive/50 bg-destructive/5" : "border-border bg-card"
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase">Reorder Level</span>
            <AlertTriangle className={`h-4 w-4 ${isLowStock ? "text-destructive" : "text-amber-500"}`} />
          </div>
          <div className="text-lg font-bold text-foreground font-mono">
            {material.reorder_level != null ? material.reorder_level.toLocaleString() : "—"}{" "}
            <span className="text-xs font-normal text-muted-foreground uppercase">{material.unit}</span>
          </div>
          <p className="text-[10px] text-muted-foreground">
            {isLowStock ? "Stock below threshold! Reorder needed." : "Stock level optimal"}
          </p>
        </div>
      </div>

      {/* Linked Suppliers Section */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-foreground flex items-center gap-2 border-b border-border pb-2">
          <Truck className="h-4 w-4 text-primary" /> Associated Supplier Directory / पुरवठादार माहिती
        </h3>
        {material.suppliers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {material.suppliers.map((supplier) => (
              <div
                key={supplier.id}
                className="p-3 rounded-lg border border-border bg-muted/20 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-foreground">{supplier.name}</span>
                  <Badge variant="outline" className="text-[10px]">Registered</Badge>
                </div>
                {supplier.contact_person && (
                  <p className="text-[11px] text-muted-foreground">
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
                    Address: {supplier.address}
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

      {/* Recent Activity Dual Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Mini Purchases Table */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-foreground flex items-center gap-2 border-b border-border pb-2">
            <ShoppingCart className="h-4 w-4 text-blue-500" /> Recent Purchases / खरेदी नोंदी
          </h3>
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
                      <td className="py-2 font-medium truncate max-w-[120px]">{p.supplier_name}</td>
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
            <p className="text-xs text-muted-foreground py-2 italic">No purchase history found.</p>
          )}
        </div>

        {/* Mini Consumption Table */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-foreground flex items-center gap-2 border-b border-border pb-2">
            <Flame className="h-4 w-4 text-amber-500" /> Recent Usage Logs / वापर नोंद
          </h3>
          {material.recent_consumption.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border text-[10px] font-bold text-muted-foreground uppercase">
                  <tr>
                    <th className="py-1.5">Date</th>
                    <th className="py-1.5">Bhatti / Batch</th>
                    <th className="py-1.5 text-right">Qty Used</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {material.recent_consumption.slice(0, 5).map((c) => (
                    <tr key={c.id}>
                      <td className="py-2 font-mono text-[11px]">{c.consumption_date}</td>
                      <td className="py-2 font-medium">{c.batch_name || "General Usage"}</td>
                      <td className="py-2 text-right font-mono font-semibold text-amber-600">
                        {c.quantity} {material.unit}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground py-2 italic">No material usage logged yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
