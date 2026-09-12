"use client";

import React, { useState } from "react";
import { Plus, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table/data-table";
import { usePermissions } from "@/features/auth/hooks/usePermissions";
import { AddPaymentModal } from "@/features/payments/components/AddPaymentModal";
import { paymentColumns } from "@/features/payments/components/columns/payment-columns";
import { usePayments } from "@/features/payments/hooks/usePayments";
import { useCustomers } from "@/features/sales/hooks/useSales";

export default function PaymentsPage() {
  const { profile, canManagePayments: canWrite } = usePermissions();
  const orgId = profile?.organization_id ?? "";

  const { data: payments = [] } = usePayments(orgId);
  const { data: customers = [] } = useCustomers(orgId);

  // Modal State
  const [showAddPayment, setShowAddPayment] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Receipt className="h-6 w-6 text-primary" /> Financial Payments &
            Receipts
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Customer cash receipts, bank transfers, UPI transactions, and
            payment allocations
          </p>
        </div>
        {canWrite && (
          <Button onClick={() => setShowAddPayment(true)}>
            <Plus className="h-4 w-4" /> Record New Payment
          </Button>
        )}
      </div>

      {/* Table */}
      <DataTable
        columns={paymentColumns}
        data={payments}
        searchPlaceholder="Search payment transactions..."
        exportFileName="payments.csv"
      />

      {/* Modal: Record Payment */}
      <AddPaymentModal
        isOpen={showAddPayment}
        onClose={() => setShowAddPayment(false)}
        orgId={orgId}
        customers={customers}
      />
    </div>
  );
}
