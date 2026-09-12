"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useCreateInventoryTransaction } from "@/features/inventory/hooks/useInventory";

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  orgId: string;
  rawMaterials: any[];
}

export function AddTransactionModal({
  isOpen,
  onClose,
  orgId,
  rawMaterials,
}: AddTransactionModalProps) {
  const createTx = useCreateInventoryTransaction(orgId);

  const [itemType, setItemType] = useState<"raw_material" | "finished_goods">(
    "raw_material",
  );
  const [itemId, setItemId] = useState("");
  const [txType, setTxType] = useState<"in" | "out">("in");
  const [quantity, setQuantity] = useState("");
  const [txDate, setTxDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  if (!isOpen) return null;

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    createTx.mutate(
      {
        item_type: itemType,
        item_id: itemId,
        transaction_type: txType,
        quantity: parseFloat(quantity),
        transaction_date: txDate,
      },
      {
        onSuccess: () => {
          toast.success("Inventory transaction recorded successfully");
          onClose();
          setItemId("");
          setQuantity("");
        },
        onError: (err: Error) => {
          toast.error(err.message || "Failed to record inventory transaction");
        },
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="text-base font-bold text-foreground">
            Record Inventory Transaction
          </h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground rounded p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleCreateTransaction} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                Item Type *
              </label>
              <select
                value={itemType}
                onChange={(e) => setItemType(e.target.value as any)}
                required
                className="w-full rounded border border-border bg-card px-3 py-2 text-xs text-foreground focus:ring-1 focus:ring-primary"
              >
                <option value="raw_material">Raw Material</option>
                <option value="finished_goods">Finished Goods</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                Transaction Type *
              </label>
              <select
                value={txType}
                onChange={(e) => setTxType(e.target.value as any)}
                required
                className="w-full rounded border border-border bg-card px-3 py-2 text-xs text-foreground focus:ring-1 focus:ring-primary"
              >
                <option value="in">IN (Addition)</option>
                <option value="out">OUT (Deduction)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
              Item *
            </label>
            {itemType === "raw_material" ? (
              <select
                value={itemId}
                onChange={(e) => setItemId(e.target.value)}
                required
                className="w-full rounded border border-border bg-card px-3 py-2 text-xs text-foreground focus:ring-1 focus:ring-primary"
              >
                <option value="">-- Select Raw Material --</option>
                {rawMaterials.map((rm) => (
                  <option key={rm.id} value={rm.id}>
                    {rm.name} ({rm.unit})
                  </option>
                ))}
              </select>
            ) : (
              <Input
                value={itemId}
                onChange={(e) => setItemId(e.target.value)}
                placeholder="Enter Brick Type ID"
                required
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                Date *
              </label>
              <Input
                type="date"
                value={txDate}
                onChange={(e) => setTxDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                Quantity *
              </label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 50"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createTx.isPending}>
              {createTx.isPending ? "Saving..." : "Save Entry"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
