"use client";

import React, { useState } from "react";
import { Boxes, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table/data-table";
import { usePermissions } from "@/features/auth/hooks/usePermissions";
import { AddTransactionModal } from "@/features/inventory/components/AddTransactionModal";
import {
  summaryColumns,
  transactionColumns,
} from "@/features/inventory/components/columns/inventory-columns";
import {
  useInventoryTransactions,
  useRawMaterials,
  useStockSummary,
} from "@/features/inventory/hooks/useInventory";

export default function InventoryPage() {
  const { profile, canManageInventory: canWrite } = usePermissions();
  const orgId = profile?.organization_id ?? "";

  const [activeTab, setActiveTab] = useState<"summary" | "transactions">(
    "summary",
  );

  const { data: summary = [] } = useStockSummary(orgId);
  const { data: transactions = [] } = useInventoryTransactions(orgId);
  const { data: rawMaterials = [] } = useRawMaterials(orgId);

  // Modal
  const [showAddTransaction, setShowAddTransaction] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Boxes className="h-6 w-6 text-primary" /> Inventory & Raw Materials
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Real-time finished brick stock, raw material supplies (coal, clay),
            and inventory log
          </p>
        </div>
        {canWrite && (
          <Button onClick={() => setShowAddTransaction(true)}>
            <Plus className="h-4 w-4" /> Record Transaction
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {(["summary", "transactions"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "summary" ? "Stock Summary" : "Transactions Log"}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "summary" ? (
        <DataTable
          columns={summaryColumns}
          data={summary}
          searchPlaceholder="Search inventory summary..."
          showExport={false}
        />
      ) : (
        <DataTable
          columns={transactionColumns}
          data={transactions}
          searchPlaceholder="Search transactions log..."
          showExport={false}
        />
      )}

      {/* Modal: New Inventory Transaction */}
      <AddTransactionModal
        isOpen={showAddTransaction}
        onClose={() => setShowAddTransaction(false)}
        orgId={orgId}
        rawMaterials={rawMaterials}
      />
    </div>
  );
}
