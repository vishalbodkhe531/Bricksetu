'use client';

import React, { useState } from 'react';
import { ShoppingCart, Plus, Users, X } from 'lucide-react';
import {
  useCustomers,
  useCreateCustomer,
  useSalesOrders,
  useCreateSalesOrder,
} from '@/features/sales/hooks/useSales';
import { useBrickTypes } from '@/features/production/hooks/useProduction';
import { useAuth } from '@/context/AuthContext';
import { DataTable, Column } from '@/components/ui/data-table/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import type { Customer, SalesOrder } from '@/features/sales/types/sales.types';

export default function SalesPage() {
  const { profile } = useAuth();
  const orgId = profile?.organization_id ?? '';

  const [activeTab, setActiveTab] = useState<'sales' | 'customers'>('sales');

  const { data: salesOrders = [], isLoading: loadingOrders } = useSalesOrders(orgId);
  const { data: customers = [], isLoading: loadingCustomers } = useCustomers(orgId);
  const { data: brickTypes = [] } = useBrickTypes(orgId);

  const createCustomer = useCreateCustomer(orgId);
  const createOrder = useCreateSalesOrder(orgId);

  // Modals
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showAddOrder, setShowAddOrder] = useState(false);

  // New Customer Form
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custAddress, setCustAddress] = useState('');
  const [custGst, setCustGst] = useState('');

  // New Order Form
  const [orderCustomerId, setOrderCustomerId] = useState('');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [orderItems, setOrderItems] = useState<Array<{ brick_type_id: string; quantity: number; rate_per_unit: number }>>([
    { brick_type_id: '', quantity: 1000, rate_per_unit: 7.5 },
  ]);

  const canWrite = profile?.role && ['owner', 'manager', 'sales_rep'].includes(profile.role);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    createCustomer.mutate(
      {
        name: custName,
        phone: custPhone || null,
        address: custAddress || null,
        gst_number: custGst || null,
      },
      {
        onSuccess: () => {
          toast.success('Customer registered successfully');
          setShowAddCustomer(false);
          setCustName('');
          setCustPhone('');
          setCustAddress('');
          setCustGst('');
        },
        onError: (err: Error) => {
          toast.error(err.message || 'Failed to create customer');
        },
      }
    );
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderCustomerId) {
      toast.error('Please select a customer');
      return;
    }
    if (orderItems.some((item) => !item.brick_type_id)) {
      toast.error('Please select a brick type for all items');
      return;
    }

    createOrder.mutate(
      {
        customer_id: orderCustomerId,
        order_date: orderDate,
        delivery_date: deliveryDate || null,
        status: 'pending',
        items: orderItems,
      },
      {
        onSuccess: () => {
          toast.success('Sales order created successfully');
          setShowAddOrder(false);
          setOrderCustomerId('');
          setOrderItems([{ brick_type_id: '', quantity: 1000, rate_per_unit: 7.5 }]);
        },
        onError: (err: Error) => {
          toast.error(err.message || 'Failed to create sales order');
        },
      }
    );
  };

  const saleColumns: Column<SalesOrder>[] = [
    {
      accessorKey: 'order_date',
      header: 'Order Date',
      cell: ({ row }) => (
        <span className="text-muted-foreground font-mono text-[11px]">{row.original.order_date}</span>
      ),
    },
    {
      accessorKey: 'customer',
      header: 'Customer',
      cell: ({ row }) => (
        <div className="font-semibold text-foreground">
          {row.original.customer?.name ?? row.original.customer_id}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      align: 'center',
      cell: ({ row }) => (
        <Badge
          variant={
            row.original.status === 'delivered'
              ? 'success'
              : row.original.status === 'partial'
              ? 'warning'
              : 'secondary'
          }
          className="capitalize font-mono text-[10px]"
        >
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: 'total_amount',
      header: 'Total Amount',
      align: 'right',
      cell: ({ row }) => (
        <span className="font-mono font-bold text-foreground">
          ₹{Number(row.original.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
  ];

  const customerColumns: Column<Customer>[] = [
    {
      accessorKey: 'name',
      header: 'Customer Name',
      cell: ({ row }) => (
        <div className="font-semibold text-foreground">{row.original.name}</div>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }) => (
        <span className="text-muted-foreground font-mono text-[11px]">{row.original.phone || '—'}</span>
      ),
    },
    {
      accessorKey: 'address',
      header: 'Address',
      cell: ({ row }) => (
        <span className="text-muted-foreground text-xs truncate max-w-[200px] block">
          {row.original.address || '—'}
        </span>
      ),
    },
    {
      accessorKey: 'gst_number',
      header: 'GSTIN',
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">{row.original.gst_number || '—'}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-primary" /> Sales & Customer Orders
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Customer directory, sales dispatches, line item details, and receivables
          </p>
        </div>
        {canWrite && (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setShowAddCustomer(true)}>
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
        {(['sales', 'customers'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'sales' ? 'Sales Orders' : 'Customers Directory'}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'sales' ? (
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
      {showAddCustomer && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">Register New Customer</h3>
              <button
                onClick={() => setShowAddCustomer(false)}
                className="text-muted-foreground hover:text-foreground rounded p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateCustomer} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                  Customer Name *
                </label>
                <Input
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  placeholder="e.g. Acme Builders"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                    Phone
                  </label>
                  <Input
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                    placeholder="Mobile number"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                    GSTIN
                  </label>
                  <Input
                    value={custGst}
                    onChange={(e) => setCustGst(e.target.value)}
                    placeholder="GST Number"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                  Address / Site
                </label>
                <Input
                  value={custAddress}
                  onChange={(e) => setCustAddress(e.target.value)}
                  placeholder="Delivery address"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setShowAddCustomer(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createCustomer.isPending}>
                  {createCustomer.isPending ? 'Saving...' : 'Save Customer'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Sales Order */}
      {showAddOrder && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">Create Sales Order</h3>
              <button
                onClick={() => setShowAddOrder(false)}
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
                        newItems[idx].quantity = parseInt(e.target.value, 10) || 0;
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
                        newItems[idx].rate_per_unit = parseFloat(e.target.value) || 0;
                        setOrderItems(newItems);
                      }}
                      required
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setShowAddOrder(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createOrder.isPending}>
                  {createOrder.isPending ? 'Saving...' : 'Save Sales Order'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
