"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useCreateSalesOrder } from "@/features/sales/hooks/useSales";
import type { Customer } from "@/features/sales/types/sales.types";

interface AddSalesOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  orgId: string;
  customers: Customer[];
  brickTypes: any[];
}

export function AddSalesOrderModal({
  isOpen,
  onClose,
  orgId,
  customers,
  brickTypes,
}: AddSalesOrderModalProps) {
  const createOrder = useCreateSalesOrder(orgId);

  const [orderCustomerId, setOrderCustomerId] = useState("");
  const [orderDate, setOrderDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [deliveryDate, setDeliveryDate] = useState("");
  const [orderItems, setOrderItems] = useState<
    Array<{ brick_type_id: string; quantity: number; rate_per_unit: number }>
  >([{ brick_type_id: "", quantity: 1000, rate_per_unit: 7.5 }]);

  if (!isOpen) return null;

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderCustomerId) {
      toast.error("Please select a customer");
      return;
    }
    if (orderItems.some((item) => !item.brick_type_id)) {
      toast.error("Please select a brick type for all items");
      return;
    }

    createOrder.mutate(
      {
        customer_id: orderCustomerId,
        order_date: orderDate,
        delivery_date: deliveryDate || null,
        status: "pending",
        items: orderItems,
      },
      {
        onSuccess: () => {
          toast.success("Sales order created successfully");
          onClose();
          setOrderCustomerId("");
          setOrderItems([
            { brick_type_id: "", quantity: 1000, rate_per_unit: 7.5 },
          ]);
        },
        onError: (err: Error) => {
          toast.error(err.message || "Failed to create sales order");
        },
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="text-base font-bold text-foreground">
            Create Sales Order
          </h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground rounded p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleCreateOrder} className="space-y-4">
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
              Customer *
            </label>
            <select
              value={orderCustomerId}
              onChange={(e) => setOrderCustomerId(e.target.value)}
              required
              className="w-full rounded border border-border bg-card px-3 py-2 text-xs text-foreground focus:ring-1 focus:ring-primary"
            >
              <option value="">-- Choose Customer --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                Order Date *
              </label>
              <Input
                type="date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                Delivery Date
              </label>
              <Input
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-muted-foreground block">
              Order Items
            </label>
            {orderItems.map((item, idx) => (
              <div key={idx} className="grid grid-cols-3 gap-2 items-center">
                <select
                  value={item.brick_type_id}
                  onChange={(e) => {
                    const newItems = [...orderItems];
                    newItems[idx].brick_type_id = e.target.value;
                    setOrderItems(newItems);
                  }}
                  required
                  className="rounded border border-border bg-card px-2 py-1 text-xs text-foreground"
                >
                  <option value="">-- Brick Type --</option>
                  {brickTypes.map((bt) => (
                    <option key={bt.id} value={bt.id}>
                      {bt.name}
                    </option>
                  ))}
                </select>
                <Input
                  type="number"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => {
                    const newItems = [...orderItems];
                    newItems[idx].quantity =
                      parseInt(e.target.value, 10) || 0;
                    setOrderItems(newItems);
                  }}
                  required
                />
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Rate/unit"
                  value={item.rate_per_unit}
                  onChange={(e) => {
                    const newItems = [...orderItems];
                    newItems[idx].rate_per_unit =
                      parseFloat(e.target.value) || 0;
                    setOrderItems(newItems);
                  }}
                  required
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createOrder.isPending}>
              {createOrder.isPending ? "Saving..." : "Save Sales Order"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
