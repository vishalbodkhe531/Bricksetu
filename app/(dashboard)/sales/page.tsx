"use client";

import React, { useState } from "react";
import { Plus, ShoppingCart, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table/data-table";
import { usePermissions } from "@/features/auth/hooks/usePermissions";
import { useBrickTypes } from "@/features/production/hooks/useProduction";
import { AddCustomerModal } from "@/features/sales/components/AddCustomerModal";
import { AddSalesOrderModal } from "@/features/sales/components/AddSalesOrderModal";
import {
  customerColumns,
  saleColumns,
} from "@/features/sales/components/columns/sales-columns";
import {
  useCustomers,
  useSalesOrders,
} from "@/features/sales/hooks/useSales";

export default function SalesPage() {
  const { profile, canManageSales: canWrite } = usePermissions();
  const orgId = profile?.organization_id ?? "";

  const [activeTab, setActiveTab] = useState<"sales" | "customers">("sales");

  const { data: salesOrders = [] } = useSalesOrders(orgId);
  const { data: customers = [] } = useCustomers(orgId);
  const { data: brickTypes = [] } = useBrickTypes(orgId);

  // Modals
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showAddOrder, setShowAddOrder] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-primary" /> Sales & Customer
            Orders
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Customer directory, sales dispatches, line item details, and
            receivables
          </p>
        </div>
        {canWrite && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowAddCustomer(true)}
            >
              <Users className="h-4 w-4" /> Add Customer
            </Button>
            <Button onClick={() => setShowAddOrder(true)}>
              <Plus className="h-4 w-4" /> New Sales Order
            </Button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {(["sales", "customers"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "sales" ? "Sales Orders" : "Customers Directory"}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "sales" ? (
        <DataTable
          columns={saleColumns}
          data={salesOrders}
          searchPlaceholder="Search sales orders..."
          showExport={false}
        />
      ) : (
        <DataTable
          columns={customerColumns}
          data={customers}
          searchPlaceholder="Search customers..."
          showExport={false}
        />
      )}

      {/* Modal: Add Customer */}
      <AddCustomerModal
        isOpen={showAddCustomer}
        onClose={() => setShowAddCustomer(false)}
        orgId={orgId}
      />

      {/* Modal: New Sales Order */}
      <AddSalesOrderModal
        isOpen={showAddOrder}
        onClose={() => setShowAddOrder(false)}
        orgId={orgId}
        customers={customers}
        brickTypes={brickTypes}
      />
    </div>
  );
}
