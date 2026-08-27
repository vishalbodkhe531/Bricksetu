import React, { useState, useEffect } from 'react';
import { Truck, Plus, AlertCircle } from 'lucide-react';
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PageHeader } from '../../shared/components/PageHeader';
import { EmptyState } from '../../shared/components/EmptyState';

export const TransportView: React.FC = () => {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [trips, setTrips] = useState<any[]>([]);
  const [isNewVehicleOpen, setIsNewVehicleOpen] = useState(false);
  const [vehicleError, setVehicleError] = useState('');
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
    setVehicleError('');
    try {
      await apiRequest('/transport/vehicles', { method: 'POST', body: JSON.stringify(vehicleForm) });
      setIsNewVehicleOpen(false); setVehicleForm({}); loadTransportData();
    } catch (err: any) { setVehicleError(err.message || 'Failed to add vehicle'); }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transport & Fleet Management"
        description="Vehicles, driver logs, transport trips for sales delivery and raw material haulage"
        icon={<Truck className="size-5 sm:size-6" />}
        actions={
          <Button onClick={() => { setVehicleError(''); setIsNewVehicleOpen(true); }} className="bg-orange-500 hover:bg-orange-600 text-white font-bold gap-2 h-10 px-4 shadow-md shadow-orange-500/20 text-xs sm:text-sm border-0 cursor-pointer">
            <Plus className="size-4" /> Add Vehicle
          </Button>
        }
      />

      <Tabs defaultValue="trips" className="space-y-4">
        <TabsList className="bg-muted p-1 rounded-xl">
          <TabsTrigger value="trips" className="gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer">
            <Truck className="size-3.5" /> Trips ({trips.length})
          </TabsTrigger>
          <TabsTrigger value="vehicles" className="gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer">
            Vehicles ({vehicles.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trips">
          <Card className="bg-card border-border shadow-xs text-card-foreground p-4 sm:p-5">
            <div className="rounded-lg border border-border overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Date</TableHead>
                    <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Vehicle</TableHead>
                    <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Driver</TableHead>
                    <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Route</TableHead>
                    <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Distance</TableHead>
                    <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Trip Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trips.length === 0 ? (
                    <TableRow><TableCell colSpan={6}><EmptyState title="No trips logged" description="Use Quick Entry to record delivery trips." /></TableCell></TableRow>
                  ) : trips.map((t) => (
                    <TableRow key={t.id} className="border-border hover:bg-muted/40">
                      <TableCell className="text-sm text-muted-foreground">{t.trip_date}</TableCell>
                      <TableCell className="font-semibold text-foreground text-sm">{t.vehicle_number}</TableCell>
                      <TableCell className="text-sm text-foreground font-medium">{t.driver_name || '-'}</TableCell>
                      <TableCell className="text-sm text-foreground">{t.origin} → {t.destination}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{t.distance_km ? `${t.distance_km} km` : '-'}</TableCell>
                      <TableCell className="font-bold text-foreground text-sm">{formatINR(t.cost_paise)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="vehicles">
          <Card className="bg-card border-border shadow-xs text-card-foreground p-4 sm:p-5">
            <div className="rounded-lg border border-border overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Vehicle Number</TableHead>
                    <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Driver Name</TableHead>
                    <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Ownership</TableHead>
                    <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Capacity</TableHead>
                    <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicles.length === 0 ? (
                    <TableRow><TableCell colSpan={5}><EmptyState title="No vehicles added" description="Add fleet vehicles to record transport logs." actionLabel="Add Vehicle" onAction={() => { setVehicleError(''); setIsNewVehicleOpen(true); }} /></TableCell></TableRow>
                  ) : vehicles.map((v) => (
                    <TableRow key={v.id} className="border-border hover:bg-muted/40">
                      <TableCell className="font-semibold text-foreground text-sm">{v.registration_number}</TableCell>
                      <TableCell className="text-foreground text-sm font-medium">{v.driver_name || '-'}</TableCell>
                      <TableCell><Badge variant="outline" className="border-blue-500/30 text-blue-600 bg-blue-500/10 text-[10px] font-bold dark:text-blue-400">{v.ownership_type}</Badge></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{v.capacity_bricks ? `${v.capacity_bricks.toLocaleString()} bricks` : '-'}</TableCell>
                      <TableCell><Badge variant="outline" className="border-emerald-500/30 text-emerald-600 bg-emerald-500/10 text-[10px] font-bold dark:text-emerald-400">ACTIVE</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Vehicle Dialog */}
      <Dialog open={isNewVehicleOpen} onOpenChange={setIsNewVehicleOpen}>
        <DialogContent className="bg-card border-border text-card-foreground sm:max-w-[480px]">
          <DialogHeader><DialogTitle className="text-lg font-bold text-foreground">Add Vehicle to Fleet</DialogTitle></DialogHeader>
          {vehicleError && (
            <Alert variant="destructive" className="my-2">
              <AlertCircle className="size-4" />
              <AlertDescription>{vehicleError}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleCreateVehicle} className="space-y-4">
            <div className="space-y-1.5"><Label className="text-muted-foreground text-xs font-semibold">Registration Number</Label><Input placeholder="e.g. MP-04-AB-1234" value={vehicleForm.registration_number || ''} onChange={e => setVehicleForm({ ...vehicleForm, registration_number: e.target.value })} required className="bg-muted/30 border-border" /></div>
            <div className="space-y-1.5"><Label className="text-muted-foreground text-xs font-semibold">Driver Name</Label><Input placeholder="e.g. Suresh Kumar" value={vehicleForm.driver_name || ''} onChange={e => setVehicleForm({ ...vehicleForm, driver_name: e.target.value })} className="bg-muted/30 border-border" /></div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5"><Label className="text-muted-foreground text-xs font-semibold">Ownership</Label><Input placeholder="OWNED / HIRED" value={vehicleForm.ownership_type || 'OWNED'} onChange={e => setVehicleForm({ ...vehicleForm, ownership_type: e.target.value })} className="bg-muted/30 border-border" /></div>
              <div className="space-y-1.5"><Label className="text-muted-foreground text-xs font-semibold">Capacity (Bricks)</Label><Input type="number" placeholder="e.g. 3000" value={vehicleForm.capacity_bricks || ''} onChange={e => setVehicleForm({ ...vehicleForm, capacity_bricks: e.target.value })} className="bg-muted/30 border-border" /></div>
            </div>
            <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setIsNewVehicleOpen(false)} className="border-border hover:bg-muted text-foreground cursor-pointer">Cancel</Button>
              <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold border-0 cursor-pointer">Save Vehicle</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
