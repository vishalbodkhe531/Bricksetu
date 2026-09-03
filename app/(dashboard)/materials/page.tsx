'use client';

import React, { useState } from 'react';
import { Package, Plus, Truck, X } from 'lucide-react';
import {
  useRawMaterialsList,
  useCreateRawMaterial,
  useSuppliersList,
  useCreateSupplier,
} from '@/features/materials/hooks/useMaterials';
import { useAuth } from '@/context/AuthContext';
import { DataTable, Column } from '@/components/ui/data-table/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import type { RawMaterial, Supplier } from '@/features/materials/types/materials.types';

export default function MaterialsPage() {
  const { profile } = useAuth();
  const orgId = profile?.organization_id ?? '';

  const [activeTab, setActiveTab] = useState<'materials' | 'suppliers'>('materials');

  const { data: materials = [], isLoading: loadingMaterials } = useRawMaterialsList(orgId);
  const { data: suppliers = [], isLoading: loadingSuppliers } = useSuppliersList(orgId);

  const createMaterial = useCreateRawMaterial(orgId);
  const createSupplier = useCreateSupplier(orgId);

  // Modals
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [showAddSupplier, setShowAddSupplier] = useState(false);

  // Form State - Material
  const [matName, setMatName] = useState('');
  const [matUnit, setMatUnit] = useState('tons');
  const [matReorder, setMatReorder] = useState('');
  const [matDesc, setMatDesc] = useState('');

  // Form State - Supplier
  const [supName, setSupName] = useState('');
  const [supContact, setSupContact] = useState('');
  const [supPhone, setSupPhone] = useState('');
  const [supAddress, setSupAddress] = useState('');
  const [supGst, setSupGst] = useState('');

  const canWrite = profile?.role && ['owner', 'manager'].includes(profile.role);

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
          toast.success('Raw material added successfully');
          setShowAddMaterial(false);
          setMatName('');
          setMatReorder('');
          setMatDesc('');
        },
        onError: (err: Error) => {
          toast.error(err.message || 'Failed to add raw material');
        },
      }
    );
  };

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    createSupplier.mutate(
      {
        name: supName,
        contact_person: supContact || null,
        phone: supPhone || null,
        address: supAddress || null,
        gst_number: supGst || null,
      },
      {
        onSuccess: () => {
          toast.success('Supplier registered successfully');
          setShowAddSupplier(false);
          setSupName('');
          setSupContact('');
          setSupPhone('');
          setSupAddress('');
          setSupGst('');
        },
        onError: (err: Error) => {
          toast.error(err.message || 'Failed to register supplier');
        },
      }
    );
  };

  const materialColumns: Column<RawMaterial>[] = [
    {
      accessorKey: 'name',
      header: 'Material Name',
      cell: ({ row }) => (
        <div className="font-semibold text-foreground">{row.original.name}</div>
      ),
    },
    {
      accessorKey: 'unit',
      header: 'Unit of Measure',
      cell: ({ row }) => (
        <Badge variant="outline" className="font-mono text-[10px] uppercase">
          {row.original.unit}
        </Badge>
      ),
    },
    {
      accessorKey: 'reorder_level',
      header: 'Reorder Level',
      align: 'right',
      cell: ({ row }) => (
        <span className="font-mono text-muted-foreground text-xs">
          {row.original.reorder_level != null ? row.original.reorder_level.toLocaleString() : '—'}
        </span>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => (
        <span className="text-muted-foreground text-xs truncate max-w-[200px] block">
          {row.original.description || '—'}
        </span>
      ),
    },
  ];

  const supplierColumns: Column<Supplier>[] = [
    {
      accessorKey: 'name',
      header: 'Supplier Name',
      cell: ({ row }) => (
        <div className="font-semibold text-foreground">{row.original.name}</div>
      ),
    },
    {
      accessorKey: 'contact_person',
      header: 'Contact Person',
      cell: ({ row }) => (
        <span className="text-muted-foreground text-xs">{row.original.contact_person || '—'}</span>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">{row.original.phone || '—'}</span>
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
            <Package className="h-6 w-6 text-primary" /> Raw Materials & Suppliers
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage coal, clay, sand, diesel, and registered supplier contacts
          </p>
        </div>
        {canWrite && (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setShowAddSupplier(true)}>
              <Truck className="h-4 w-4" /> Add Supplier
            </Button>
            <Button onClick={() => setShowAddMaterial(true)}>
              <Plus className="h-4 w-4" /> Add Material
            </Button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {(['materials', 'suppliers'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'materials' ? 'Raw Materials' : 'Suppliers Directory'}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'materials' ? (
        <DataTable
          columns={materialColumns}
          data={materials}
          searchPlaceholder="Search materials..."
          showExport={false}
        />
      ) : (
        <DataTable
          columns={supplierColumns}
          data={suppliers}
          searchPlaceholder="Search suppliers..."
          showExport={false}
        />
      )}

      {/* Modal: Add Material */}
      {showAddMaterial && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">Add Raw Material</h3>
              <button
                onClick={() => setShowAddMaterial(false)}
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
                <Button type="button" variant="outline" onClick={() => setShowAddMaterial(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMaterial.isPending}>
                  {createMaterial.isPending ? 'Saving...' : 'Save Material'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Supplier */}
      {showAddSupplier && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">Register Supplier</h3>
              <button
                onClick={() => setShowAddSupplier(false)}
                className="text-muted-foreground hover:text-foreground rounded p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateSupplier} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                  Supplier Name *
                </label>
                <Input
                  value={supName}
                  onChange={(e) => setSupName(e.target.value)}
                  placeholder="e.g. Royal Coal Traders"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                    Contact Person
                  </label>
                  <Input
                    value={supContact}
                    onChange={(e) => setSupContact(e.target.value)}
                    placeholder="Manager Name"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                    Phone
                  </label>
                  <Input
                    value={supPhone}
                    onChange={(e) => setSupPhone(e.target.value)}
                    placeholder="Phone number"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                    Address
                  </label>
                  <Input
                    value={supAddress}
                    onChange={(e) => setSupAddress(e.target.value)}
                    placeholder="City / Depot"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                    GSTIN
                  </label>
                  <Input
                    value={supGst}
                    onChange={(e) => setSupGst(e.target.value)}
                    placeholder="GST Number"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setShowAddSupplier(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createSupplier.isPending}>
                  {createSupplier.isPending ? 'Saving...' : 'Save Supplier'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
