"use client";

import React, { ElementType } from "react";

export interface KPICardItem {
  id?: string;
  label: string;
  value: React.ReactNode;
  subtext?: React.ReactNode;
  icon?: ElementType;
  iconColor?: string;
  valueColor?: string;
}

interface KPICardProps {
  item: KPICardItem;
  className?: string;
}

export function KPICard({ item, className = "" }: KPICardProps) {
  const Icon = item.icon;
  return (
    <div className={`p-3 rounded-lg border border-border bg-card shadow-xs space-y-0.5 ${className}`}>
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
        {Icon && <Icon className={`h-3 w-3 ${item.iconColor || "text-primary"}`} />}
        {item.label}
      </span>
      <span className={`text-lg font-bold font-mono block tabular-nums ${item.valueColor || "text-foreground"}`}>
        {item.value}
      </span>
      {item.subtext && (
        <span className="text-[10px] text-muted-foreground block truncate">
          {item.subtext}
        </span>
      )}
    </div>
  );
}

interface KPIGridProps {
  items: KPICardItem[];
  columns?: 2 | 3 | 4 | 5;
  className?: string;
}

export function KPIGrid({ items, columns = 3, className = "" }: KPIGridProps) {
  const gridColClass =
    columns === 4
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      : columns === 5
        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5"
        : columns === 2
          ? "grid-cols-1 sm:grid-cols-2"
          : "grid-cols-1 sm:grid-cols-3";

  return (
    <div className={`grid ${gridColClass} gap-3 ${className}`}>
      {items.map((item, idx) => (
        <KPICard key={item.id || idx} item={item} />
      ))}
    </div>
  );
}
