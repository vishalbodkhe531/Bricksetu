import React, { useState, useEffect } from 'react';
import { Truck, Plus } from 'lucide-react';
import { apiRequest } from '../../shared/api/client';
import { formatINR } from '../../shared/utils/formatters';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '../../shared/components/PageHeader';
import { EmptyState } from '../../shared/components/EmptyState';

export const TransportView: React.FC = () => {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [trips, setTrips] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'trips' | 'vehicles'>('trips');
  const [isNewVehicleOpen, setIsNewVehicleOpen] = useState(false);
  const [vehicleForm, setVehicleForm] = useState<any>({});

  useEffect(() => { loadTransportData(); }, []);

  async function loadTransportData() {
    try {
      const [v, t] = await Promise.all([apiRequest('/transport/vehicles'), apiRequest('/transport/trips')]);
      setVehicles(v); setTrips(t);
    } catch (err: any) { console.error(err); }
  }

  const handleCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/transport/vehicles', { method: 'POST', body: JSON.stringify(vehicleForm) });
      setIsNewVehicleOpen(false); setVehicleForm({}); loadTransportData();
    } catch (err: any) { alert(err.message); }
  };

  const tabClasses = (active: boolean) => `gap-1.5 font-semibold text-xs h-8 ${active ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-white'}`;

  return (
    <div className="space-y-6">
      <PageHeader title="Transport & Fleet Management" description="Vehicles, driver logs, transport trips for sales delivery and raw material haulage" icon={<Truck className="size-5 sm:size-6" />}
        actions={<Button onClick={() => setIsNewVehicleOpen(true)} className="bg-orange-500 hover:bg-orange-600 text-white font-bold gap-2 h-10 px-4 shadow-lg shadow-orange-500/20 text-xs sm:text-sm"><Plus className="size-4" /> Add Vehicle</Button>} />

      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant={activeTab === 'trips' ? "default" : "outline"} onClick={() => setActiveTab('trips')} className={tabClasses(activeTab === 'trips')}><Truck className="size-3.5" /> Trips ({trips.length})</Button>
        <Button size="sm" variant={activeTab === 'vehicles' ? "default" : "outline"} onClick={() => setActiveTab('vehicles')} className={tabClasses(activeTab === 'vehicles')}>Vehicles ({vehicles.length})</Button>
      </div>

      {activeTab === 'trips' && (
        <Card className="bg-slate-900/60 border-slate-800/60 backdrop-blur-sm shadow-sm text-slate-100 p-5">
          <div className="rounded-lg border border-slate-800/60 overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-950/40"><TableRow className="border-slate-800/60 hover:bg-transparent">
                <TableHead className="text-slate-500 font-semibold uppercase text-[11px] tracking-wide">Date</TableHead>
                <TableHead className="text-slate-500 font-semibold uppercase text-[11px] tracking-wide">Vehicle</TableHead>
                <TableHead className="text-slate-500 font-semibold uppercase text-[11px] tracking-wide">Driver</TableHead>
                <TableHead className="text-slate-500 font-semibold uppercase text-[11px] tracking-wide">Origin & Destination</TableHead>
                <TableHead className="text-slate-500 font-semibold uppercase text-[11px] tracking-wide">Distance</TableHead>
                <TableHead className="text-slate-500 font-semibold uppercase text-[11px] tracking-wide">Batch / Sale</TableHead>
                <TableHead className="text-slate-500 font-semibold uppercase text-[11px] tracking-wide">Trip Cost</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {trips.length === 0 ? (<TableRow><TableCell colSpan={7}><EmptyState title="No trips recorded" /></TableCell></TableRow>) : trips.map((t) => (
                  <TableRow key={t.id} className="border-slate-800/40 hover:bg-slate-800/30">
                    <TableCell className="text-sm text-slate-400">{t.trip_date}</TableCell>
                    <TableCell className="font-semibold text-slate-200 text-sm">{t.registration_number}</TableCell>
                    <TableCell className="text-slate-300 text-sm">{t.driver_name || '-'}</TableCell>
                    <TableCell className="text-slate-400 text-sm">{t.origin || 'Kiln Yard'} &rarr; {t.destination || 'Customer Location'}</TableCell>
                    <TableCell className="text-sm text-slate-500">{t.distance_km ? `${t.distance_km} KM` : '-'}</TableCell>
                    <TableCell className="text-sm text-slate-500">{t.batch_number || t.sale_number || 'General'}</TableCell>
                    <TableCell className="font-bold text-white text-sm">{formatINR(t.cost_paise)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {activeTab === 'vehicles' && (
        <Card className="bg-slate-900/60 border-slate-800/60 backdrop-blur-sm shadow-sm text-slate-100 p-5">
          <div className="rounded-lg border border-slate-800/60 overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-950/40"><TableRow className="border-slate-800/60 hover:bg-transparent">
                <TableHead className="text-slate-500 font-semibold uppercase text-[11px] tracking-wide">Registration #</TableHead>
                <TableHead className="text-slate-500 font-semibold uppercase text-[11px] tracking-wide">Driver Name</TableHead>
                <TableHead className="text-slate-500 font-semibold uppercase text-[11px] tracking-wide">Capacity Details</TableHead>
                <TableHead className="text-slate-500 font-semibold uppercase text-[11px] tracking-wide">Status</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {vehicles.length === 0 ? (<TableRow><TableCell colSpan={4}><EmptyState title="No vehicles added" actionLabel="Add Vehicle" onAction={() => setIsNewVehicleOpen(true)} /></TableCell></TableRow>) : vehicles.map((v) => (
                  <TableRow key={v.id} className="border-slate-800/40 hover:bg-slate-800/30">
                    <TableCell className="font-semibold text-slate-200 text-sm">{v.registration_number}</TableCell>
                    <TableCell className="text-slate-300 text-sm">{v.driver_name || '-'}</TableCell>
                    <TableCell className="text-sm text-slate-500">{v.capacity_details || 'Standard'}</TableCell>
                    <TableCell><Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 text-[10px] font-bold">ACTIVE</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      <Dialog open={isNewVehicleOpen} onOpenChange={setIsNewVehicleOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 sm:max-w-[480px]">
          <DialogHeader><DialogTitle className="text-lg font-bold text-white">Add Vehicle to Fleet</DialogTitle></DialogHeader>
          <form onSubmit={handleCreateVehicle} className="space-y-4">
            <div className="space-y-1.5"><Label className="text-slate-400 text-xs">Registration Number</Label><Input placeholder="e.g. MH-12-AB-1234" value={vehicleForm.registration_number || ''} onChange={e => setVehicleForm({ ...vehicleForm, registration_number: e.target.value })} required className="bg-slate-950/40 border-slate-700/60" /></div>
            <div className="space-y-1.5"><Label className="text-slate-400 text-xs">Driver Name</Label><Input placeholder="e.g. Suresh Shinde" value={vehicleForm.driver_name || ''} onChange={e => setVehicleForm({ ...vehicleForm, driver_name: e.target.value })} className="bg-slate-950/40 border-slate-700/60" /></div>
            <div className="space-y-1.5"><Label className="text-slate-400 text-xs">Capacity Details</Label><Input placeholder="e.g. 5,000 bricks capacity" value={vehicleForm.capacity_details || ''} onChange={e => setVehicleForm({ ...vehicleForm, capacity_details: e.target.value })} className="bg-slate-950/40 border-slate-700/60" /></div>
            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800/40">
              <Button type="button" variant="outline" onClick={() => setIsNewVehicleOpen(false)} className="border-slate-700 hover:bg-slate-800 text-slate-300">Cancel</Button>
              <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold">Save Vehicle</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
