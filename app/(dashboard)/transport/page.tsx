'use client';

import React, { useState, useEffect } from 'react';
import { Truck, Plus, Route, AlertCircle } from 'lucide-react';
import {
  getVehiclesAction,
  createVehicleAction,
  getTripsAction,
  logTripAction,
} from '@/features/transport/actions';
import { getBatchesAction } from '@/features/production/actions';
import { getSalesAction } from '@/features/sales/actions';
import { DataTable } from '@/components/ui/data-table/data-table';
import { toast } from 'sonner';

export default function TransportPage() {
  const [activeTab, setActiveTab] = useState<'trips' | 'vehicles'>('trips');
  const [trips, setTrips] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showLogTrip, setShowLogTrip] = useState(false);
  const [showAddVehicle, setShowAddVehicle] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [tRes, vRes, bRes, sRes] = await Promise.all([
      getTripsAction(),
      getVehiclesAction(),
      getBatchesAction(),
      getSalesAction(),
    ]);
    if (tRes.success) setTrips(tRes.data || []);
    if (vRes.success) setVehicles(vRes.data || []);
    if (bRes.success) setBatches(bRes.data || []);
    if (sRes.success) setSales(sRes.data || []);
    setLoading(false);
  }

  const handleLogTrip = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const res = await logTripAction(formData);
    if (res.success) {
      toast.success('Transport trip logged!');
      setShowLogTrip(false);
      loadData();
    } else {
      toast.error(res.error || 'Failed to log trip');
    }
  };

  const handleCreateVehicle = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const res = await createVehicleAction(formData);
    if (res.success) {
      toast.success('Vehicle registered');
      setShowAddVehicle(false);
      loadData();
    } else {
      toast.error(res.error || 'Failed to register vehicle');
    }
  };

  const tripColumns: any[] = [
    {
      accessorKey: 'trip_date',
      header: 'Date',
      cell: ({ row }: any) => <span className="text-muted-foreground">{row.original.trip_date}</span>,
    },
    {
      accessorKey: 'registration_number',
      header: 'Vehicle',
      cell: ({ row }: any) => (
        <div>
          <div className="font-mono font-bold text-foreground">{row.original.registration_number}</div>
          <div className="text-[11px] text-muted-foreground">{row.original.driver_name || 'No driver'}</div>
        </div>
      ),
    },
    {
      accessorKey: 'origin',
      header: 'Route',
      cell: ({ row }: any) => (
        <span className="text-xs font-medium">
          {row.original.origin || 'Kiln'} → {row.original.destination || 'Site'}
        </span>
      ),
    },
    {
      accessorKey: 'batch_number',
      header: 'Associated Batch / Sale',
      cell: ({ row }: any) => (
        <span className="text-xs font-mono text-muted-foreground">
          {row.original.batch_number || row.original.sale_number || 'General Transport'}
        </span>
      ),
    },
    {
      accessorKey: 'cost_paise',
      header: 'Trip Cost',
      cell: ({ row }: any) => (
        <span className="font-bold text-foreground">
          ₹{(parseInt(row.original.cost_paise || '0', 10) / 100).toFixed(2)}
        </span>
      ),
    },
  ];

  const vehicleColumns: any[] = [
    {
      accessorKey: 'registration_number',
      header: 'Registration #',
      cell: ({ row }: any) => <span className="font-mono font-bold text-foreground">{row.original.registration_number}</span>,
    },
    {
      accessorKey: 'driver_name',
      header: 'Assigned Driver',
      cell: ({ row }: any) => <span className="text-muted-foreground">{row.original.driver_name || '—'}</span>,
    },
    {
      accessorKey: 'capacity_details',
      header: 'Capacity Specs',
      cell: ({ row }: any) => <span className="text-muted-foreground">{row.original.capacity_details || '—'}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Truck className="h-6 w-6 text-primary" /> Transport & Fleet Trips
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Vehicle fleet management, trip logs for raw material inward and customer brick dispatch delivery
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddVehicle(true)}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-xs font-bold text-foreground hover:bg-accent shadow-xs"
          >
            <Truck className="h-4 w-4" /> Register Vehicle
          </button>
          <button
            onClick={() => setShowLogTrip(true)}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 shadow-xs"
          >
            <Route className="h-4 w-4" /> Log Transport Trip
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border gap-2">
        <button
          onClick={() => setActiveTab('trips')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'trips'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Trip Logs ({trips.length})
        </button>
        <button
          onClick={() => setActiveTab('vehicles')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'vehicles'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Fleet Vehicles ({vehicles.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'trips' && (
        <DataTable columns={tripColumns} data={trips} searchPlaceholder="Search trip records..." exportFileName="transport_trips.csv" />
      )}
      {activeTab === 'vehicles' && (
        <DataTable columns={vehicleColumns} data={vehicles} searchPlaceholder="Search fleet vehicles..." exportFileName="vehicles.csv" />
      )}

      {/* Modal: Log Trip */}
      {showLogTrip && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-foreground">Log Transport Trip</h3>
            <form onSubmit={handleLogTrip} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground">Select Vehicle</label>
                <select name="vehicle_id" required className="w-full rounded border border-border bg-card px-3 py-2 text-xs">
                  <option value="">-- Choose Vehicle --</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>{v.registration_number} ({v.driver_name || 'No driver'})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground">Attach to Batch</label>
                  <select name="batch_id" className="w-full rounded border border-border bg-card px-3 py-2 text-xs">
                    <option value="">-- None --</option>
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>{b.batch_number}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground">Attach to Sale</label>
                  <select name="sale_id" className="w-full rounded border border-border bg-card px-3 py-2 text-xs">
                    <option value="">-- None --</option>
                    {sales.map((s) => (
                      <option key={s.id} value={s.id}>{s.sale_number}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground">Trip Date</label>
                <input name="trip_date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required className="w-full rounded border border-border bg-card px-3 py-2 text-xs" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input name="origin" placeholder="Origin (e.g. Kiln)" className="w-full rounded border border-border bg-card px-3 py-2 text-xs" />
                <input name="destination" placeholder="Destination (e.g. Site)" className="w-full rounded border border-border bg-card px-3 py-2 text-xs" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground">Distance (km)</label>
                  <input name="distance_km" type="number" step="0.1" placeholder="e.g. 35" className="w-full rounded border border-border bg-card px-3 py-2 text-xs" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground">Freight Cost (₹)</label>
                  <input name="cost" type="number" step="0.01" placeholder="e.g. 2500" required className="w-full rounded border border-border bg-card px-3 py-2 text-xs" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowLogTrip(false)} className="px-3 py-1.5 text-xs border rounded">Cancel</button>
                <button type="submit" className="px-4 py-1.5 text-xs font-bold bg-primary text-primary-foreground rounded">Save Trip</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Vehicle */}
      {showAddVehicle && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-foreground">Register Fleet Vehicle</h3>
            <form onSubmit={handleCreateVehicle} className="space-y-3">
              <input name="registration_number" placeholder="Registration # (e.g. UP-70-AB-1234)" required className="w-full rounded border border-border bg-card px-3 py-2 text-xs" />
              <input name="driver_name" placeholder="Driver Full Name" className="w-full rounded border border-border bg-card px-3 py-2 text-xs" />
              <input name="capacity_details" placeholder="Capacity (e.g. 5,000 Bricks / 10 Tons)" className="w-full rounded border border-border bg-card px-3 py-2 text-xs" />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddVehicle(false)} className="px-3 py-1.5 text-xs border rounded">Cancel</button>
                <button type="submit" className="px-4 py-1.5 text-xs font-bold bg-primary text-primary-foreground rounded">Save Vehicle</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
