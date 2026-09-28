"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Package,
  Scale,
  Truck,
  Layers,
  Edit,
  ShoppingCart,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { MaterialDetail } from "../types/materials.types";
import type { MaterialTabType } from "./MaterialDetailTabs";

interface MaterialIdentityHeaderProps {
  material: MaterialDetail;
  canWrite: boolean;
  activeTab: MaterialTabType;
  onSelectTab: (tab: MaterialTabType) => void;
}

export function MaterialIdentityHeader({
  material,
  canWrite,
  activeTab,
  onSelectTab,
}: MaterialIdentityHeaderProps) {
  const isLowStock =
    material.reorder_level != null &&
    material.available_stock <= material.reorder_level;

  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-xs relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Avatar & Identity info */}
        <div className="flex items-center gap-3">
          <Link href="/materials">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-xs">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold border border-primary/20">
            <Package className="h-5 w-5 text-primary" />
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base font-bold tracking-tight text-foreground">
                {material.name}
              </h1>
              <Badge variant="outline" className="font-mono text-[10px] uppercase">
                {material.code}
              </Badge>
              <Badge
                variant={material.is_active ? "success" : "secondary"}
                className="text-[10px] py-0 px-1.5"
              >
                {material.is_active ? "Active" : "Inactive"}
              </Badge>
              {isLowStock && (
                <Badge variant="destructive" className="text-[10px] py-0 px-1.5 animate-pulse">
                  Low Stock
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1 font-medium">
                <Scale className="h-3 w-3 text-primary" /> Unit:{" "}
                <strong className="text-foreground uppercase font-mono">{material.unit}</strong>
              </span>
              <span className="flex items-center gap-1">
                <Truck className="h-3 w-3 text-primary" /> Supplier:{" "}
                <strong className="text-foreground">
                  {material.primary_supplier_name || "Not linked"}
                </strong>
              </span>
              <span className="flex items-center gap-1 font-mono">
                <Layers className="h-3 w-3 text-primary" /> Stock:{" "}
                <strong className="text-foreground">
                  {material.available_stock.toLocaleString()} {material.unit}
                </strong>
              </span>
            </div>
          </div>
        </div>

        {/* Right Action buttons */}
        {canWrite && (
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              disabled
              title="Record Purchase coming soon"
              className="rounded-full h-8 px-3 text-[11px] font-semibold gap-1.5 opacity-60"
            >
              <ShoppingCart className="h-3.5 w-3.5" /> Record Purchase
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
