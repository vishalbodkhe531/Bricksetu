"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import type { ProductionBatch } from "@/features/production/types/production.types";

interface BatchDetailModalProps {
  batch: ProductionBatch | null;
  onClose: () => void;
}

export function BatchDetailModal({ batch, onClose }: BatchDetailModalProps) {
  if (!batch) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl">
        <div className="flex justify-between items-center border-b border-border pb-3">
          <h3 className="text-base font-bold text-foreground">Batch Details</h3>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-1 border-b border-border">
            <span className="text-muted-foreground">Production Date:</span>
            <span className="font-mono font-semibold">
              {batch.production_date}
            </span>
          </div>
          <div className="flex justify-between py-1 border-b border-border">
            <span className="text-muted-foreground">Brick Type:</span>
            <span className="font-semibold">
              {batch.brick_type?.name ?? "Standard"}
            </span>
          </div>
          <div className="flex justify-between py-1 border-b border-border">
            <span className="text-muted-foreground">Worker:</span>
            <span>{batch.worker_name ?? "Unassigned"}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-border">
            <span className="text-muted-foreground">Bricks Moulded:</span>
            <span className="font-mono font-bold text-primary">
              {batch.bricks_moulded.toLocaleString()}
            </span>
          </div>
          {batch.notes && (
            <div className="pt-2">
              <span className="text-muted-foreground text-xs block mb-1">
                Notes:
              </span>
              <p className="text-xs bg-muted/40 p-2 rounded border border-border">
                {batch.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
