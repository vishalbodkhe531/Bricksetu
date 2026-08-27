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

  const tabClasses = (active: boolean) => `gap-1.5 font-semibold text-xs h-8 cursor-pointer ${active ? 'bg-orange-500 hover:bg-orange-600 text-white border-transparent' : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground'}`;

  return (
    <div className="space-y-6">
      <PageHeader title="Transport & Fleet Management" description="Vehicles, driver logs, transport trips for sales delivery and raw material haulage" icon={<Truck className="size-5 sm:size-6" />}
        actions={<Button onClick={() => setIsNewVehicleOpen(true)} className="bg-orange-500 hover:bg-orange-600 text-white font-bold gap-2 h-10 px-4 shadow-md shadow-orange-500/20 text-xs sm:text-sm border-0 cursor-pointer"><Plus className="size-4" /> Add Vehicle</Button>} />

      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant={activeTab === 'trips' ? "default" : "outline"} onClick={() => setActiveTab('trips')} className={tabClasses(activeTab === 'trips')}><Truck className="size-3.5" /> Trips ({trips.length})</Button>
        <Button size="sm" variant={activeTab === 'vehicles' ? "default" : "outline"} onClick={() => setActiveTab('vehicles')} className={tabClasses(activeTab === 'vehicles')}>Vehicles ({vehicles.length})</Button>
      </div>

      {activeTab === 'trips' && (
        <Card className="bg-card border-border shadow-xs text-card-foreground p-5">
          <div className="rounded-lg border border-border overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50"><TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Date</TableHead>
                <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Vehicle</TableHead>
                <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Driver</TableHead>
                <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Origin & Destination</TableHead>
                <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Distance</TableHead>
                <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Batch / Sale</TableHead>
                <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Trip Cost</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {trips.length === 0 ? (<TableRow><TableCell colSpan={7}><EmptyState title="No trips recorded" /></TableCell></TableRow>) : trips.map((t) => (
                  <TableRow key={t.id} className="border-border hover:bg-muted/40">
                    <TableCell className="text-sm text-muted-foreground">{t.trip_date}</TableCell>
                    <TableCell className="font-semibold text-foreground text-sm">{t.registration_number}</TableCell>
                    <TableCell className="text-foreground text-sm">{t.driver_name || '-'}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{t.origin || 'Kiln Yard'} &rarr; {t.destination || 'Customer Location'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{t.distance_km ? `${t.distance_km} KM` : '-'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{t.batch_number || t.sale_number || 'General'}</TableCell>
                    <TableCell className="font-bold text-foreground text-sm">{formatINR(t.cost_paise)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {activeTab === 'vehicles' && (
        <Card className="bg-card border-border shadow-xs text-card-foreground p-5">
          <div className="rounded-lg border border-border overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50"><TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Registration #</TableHead>
                <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Driver Name</TableHead>
                <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Capacity Details</TableHead>
                <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Status</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {vehicles.length === 0 ? (<TableRow><TableCell colSpan={4}><EmptyState title="No vehicles added" actionLabel="Add Vehicle" onAction={() => setIsNewVehicleOpen(true)} /></TableCell></TableRow>) : vehicles.map((v) => (
                  <TableRow key={v.id} className="border-border hover:bg-muted/40">
                    <TableCell className="font-semibold text-foreground text-sm">{v.registration_number}</TableCell>
                    <TableCell className="text-foreground text-sm">{v.driver_name || '-'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{v.capacity_details || 'Standard'}</TableCell>
                    <TableCell><Badge variant="outline" className="border-emerald-500/30 text-emerald-600 bg-emerald-500/10 text-[10px] font-bold dark:text-emerald-400">ACTIVE</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      <Dialog open={isNewVehicleOpen} onOpenChange={setIsNewVehicleOpen}>
        <DialogContent className="bg-card border-border text-card-foreground sm:max-w-[480px]">
          <DialogHeader><DialogTitle className="text-lg font-bold text-foreground">Add Vehicle to Fleet</DialogTitle></DialogHeader>
          <form onSubmit={handleCreateVehicle} className="space-y-4">
            <div className="space-y-1.5"><Label className="text-muted-foreground text-xs">Registration Number</Label><Input placeholder="e.g. MH-12-AB-1234" value={vehicleForm.registration_number || ''} onChange={e => setVehicleForm({ ...vehicleForm, registration_number: e.target.value })} required className="bg-muted/30 border-border" /></div>
            <div className="space-y-1.5"><Label className="text-muted-foreground text-xs">Driver Name</Label><Input placeholder="e.g. Suresh Shinde" value={vehicleForm.driver_name || ''} onChange={e => setVehicleForm({ ...vehicleForm, driver_name: e.target.value })} className="bg-muted/30 border-border" /></div>
            <div className="space-y-1.5"><Label className="text-muted-foreground text-xs">Capacity Details</Label><Input placeholder="e.g. 5,000 bricks capacity" value={vehicleForm.capacity_details || ''} onChange={e => setVehicleForm({ ...vehicleForm, capacity_details: e.target.value })} className="bg-muted/30 border-border" /></div>
            <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setIsNewVehicleOpen(false)} className="border-border hover:bg-muted text-foreground cursor-pointer">Cancel</Button>
              <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold cursor-pointer">Save Vehicle</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
