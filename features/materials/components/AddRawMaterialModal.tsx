"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useCreateRawMaterial } from "@/features/materials/hooks/useMaterials";

interface AddRawMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  orgId: string;
}

export function AddRawMaterialModal({
  isOpen,
  onClose,
  orgId,
}: AddRawMaterialModalProps) {
  const createMaterial = useCreateRawMaterial(orgId);

  const [matName, setMatName] = useState("");
  const [matUnit, setMatUnit] = useState("tons");
  const [matReorder, setMatReorder] = useState("");
  const [matDesc, setMatDesc] = useState("");

  if (!isOpen) return null;

  const handleCreateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    createMaterial.mutate(
      {
        name: matName,
        unit: matUnit,
        reorder_level: matReorder ? parseFloat(matReorder) : null,
        description: matDesc || null,
      },
      {
        onSuccess: () => {
          toast.success("Raw material added successfully");
          onClose();
          setMatName("");
          setMatReorder("");
          setMatDesc("");
        },
        onError: (err: Error) => {
          toast.error(err.message || "Failed to add raw material");
        },
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="text-base font-bold text-foreground">
            Add Raw Material
          </h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground rounded p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleCreateMaterial} className="space-y-3">
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
              Material Name *
            </label>
            <Input
              value={matName}
              onChange={(e) => setMatName(e.target.value)}
              placeholder="e.g. Coal / Clay / Sawdust"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                Unit *
              </label>
              <select
                value={matUnit}
                onChange={(e) => setMatUnit(e.target.value)}
                required
                className="w-full rounded border border-border bg-card px-3 py-2 text-xs text-foreground focus:ring-1 focus:ring-primary"
              >
                <option value="tons">Tons</option>
                <option value="kg">Kilograms (kg)</option>
                <option value="liters">Liters</option>
                <option value="units">Units / Bags</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                Reorder Threshold
              </label>
              <Input
                type="number"
                step="0.01"
                value={matReorder}
                onChange={(e) => setMatReorder(e.target.value)}
                placeholder="e.g. 10"
              />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
              Description
            </label>
            <Input
              value={matDesc}
              onChange={(e) => setMatDesc(e.target.value)}
              placeholder="e.g. High grade steam coal"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMaterial.isPending}>
              {createMaterial.isPending ? "Saving..." : "Save Material"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
