"use client";

import React from "react";
import { Building } from "lucide-react";

interface OrganizationCardProps {
  organization?: {
    name?: string;
    slug?: string;
  } | null;
}

export function OrganizationCard({ organization }: OrganizationCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-3 shadow-xs">
      <div className="flex items-center gap-2 text-sm font-bold text-foreground">
        <Building className="h-4 w-4 text-primary" /> Organization Information
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div>
          <span className="text-muted-foreground block text-[11px]">
            Organization Name
          </span>
          <span className="font-semibold text-foreground text-sm">
            {organization?.name ?? "BrickSetu Unit"}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground block text-[11px]">
            Organization Slug
          </span>
          <span className="font-mono text-muted-foreground text-sm">
            {organization?.slug ?? "—"}
          </span>
        </div>
      </div>
    </div>
  );
}
