'use client';

import React, { useState } from 'react';
import { Truck, Plus, X } from 'lucide-react';
import { useVehicles, useCreateVehicle } from '@/features/transport/hooks/useTransport';
import { useAuth } from '@/context/AuthContext';
import { DataTable, Column } from '@/components/ui/data-table/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import type { Vehicle } from '@/features/transport/types/transport.types';

export default function TransportPage() {
  const { profile } = useAuth();
  const orgId = profile?.organization_id ?? '';

  const { data: vehicles = [], isLoading } = useVehicles(orgId);
  const createVehicle = useCreateVehicle(orgId);

  // Modal
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [regNum, setRegNum] = useState('');
  const [driverName, setDriverName] = useState('');
  const [capacity, setCapacity] = useState('');

  const canWrite = profile?.role && ['owner', 'manager'].includes(profile.role);

  const handleCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    createVehicle.mutate(
      {
        registration_number: regNum,
        driver_name: driverName || null,
        capacity_details: capacity || null,
      },
      {
        onSuccess: () => {
          toast.success('Vehicle registered successfully');
          setShowAddVehicle(false);
          setRegNum('');
          setDriverName('');
          setCapacity('');
        },
        onError: (err: Error) => {
          toast.error(err.message || 'Failed to register vehicle');
        },
      }
    );
  };

  const vehicleColumns: Column<Vehicle>[] = [
    {
      accessorKey: 'registration_number',
      header: 'Registration #',
      cell: ({ row }) => (
        <span className="font-mono font-bold text-foreground">{row.original.registration_number}</span>
      ),
    },
    {
      accessorKey: 'driver_name',
      header: 'Assigned Driver',
      cell: ({ row }) => (
        <span className="text-muted-foreground text-xs">{row.original.driver_name || '—'}</span>
      ),
    },
    {
      accessorKey: 'capacity_details',
      header: 'Capacity Details',
      cell: ({ row }) => (
        <span className="text-muted-foreground text-xs">{row.original.capacity_details || '—'}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Truck className="h-6 w-6 text-primary" /> Transport & Fleet Vehicles
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Vehicle fleet management and driver registrations for material inward & dispatches
          </p>
        </div>
        {canWrite && (
          <Button onClick={() => setShowAddVehicle(true)}>
            <Plus className="h-4 w-4" /> Register Vehicle
          </Button>
        )}
      </div>

      {/* Content */}
      <DataTable
        columns={vehicleColumns}
        data={vehicles}
        searchPlaceholder="Search fleet vehicles..."
        showExport={false}
      />

      {/* Modal: Add Vehicle */}
      {showAddVehicle && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">Register Fleet Vehicle</h3>
              <button
                onClick={() => setShowAddVehicle(false)}
                className="text-muted-foreground hover:text-foreground rounded p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateVehicle} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                  Registration Number *
                </label>
                <Input
                  value={regNum}
                  onChange={(e) => setRegNum(e.target.value)}
                  placeholder="e.g. MH-12-AB-1234"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                  Driver Name
                </label>
                <Input
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  placeholder="Driver full name"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                  Capacity Details
                </label>
                <Input
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  placeholder="e.g. 5,000 Bricks / 10 Tons"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setShowAddVehicle(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createVehicle.isPending}>
                  {createVehicle.isPending ? 'Saving...' : 'Save Vehicle'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
