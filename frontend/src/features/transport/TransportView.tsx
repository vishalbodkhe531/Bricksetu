import React, { useState, useEffect } from 'react';
import { Truck, Plus } from 'lucide-react';
import { apiRequest } from '../../shared/api/client';
import { formatINR } from '../../shared/utils/formatters';

export const TransportView: React.FC = () => {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [trips, setTrips] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'trips' | 'vehicles'>('trips');

  const [isNewVehicleOpen, setIsNewVehicleOpen] = useState(false);
  const [vehicleForm, setVehicleForm] = useState<any>({});

  useEffect(() => {
    loadTransportData();
  }, []);

  async function loadTransportData() {
    try {
      const [v, t] = await Promise.all([
        apiRequest('/transport/vehicles'),
        apiRequest('/transport/trips'),
      ]);
      setVehicles(v);
      setTrips(t);
    } catch (err: any) {
      console.error(err);
    }
  }

  const handleCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/transport/vehicles', {
        method: 'POST',
        body: JSON.stringify(vehicleForm),
      });
      setIsNewVehicleOpen(false);
      loadTransportData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Transport & Fleet Management</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Vehicles, driver logs, transport trips for sales delivery and raw material haulage</p>
        </div>
        <button className="btn btn-secondary" onClick={() => setIsNewVehicleOpen(true)}>
          <Plus size={18} /> Add Vehicle
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
        <button className={`btn ${activeTab === 'trips' ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setActiveTab('trips')}>
          <Truck size={14} /> Transport Trips ({trips.length})
        </button>
        <button className={`btn ${activeTab === 'vehicles' ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setActiveTab('vehicles')}>
          Vehicles Fleet ({vehicles.length})
        </button>
      </div>

      {activeTab === 'trips' && (
        <div className="glass-card" style={{ padding: '20px' }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Vehicle</th>
                  <th>Driver</th>
                  <th>Origin & Destination</th>
                  <th>Distance</th>
                  <th>Batch / Sale</th>
                  <th>Trip Cost</th>
                </tr>
              </thead>
              <tbody>
                {trips.map((t) => (
                  <tr key={t.id}>
                    <td>{t.trip_date}</td>
                    <td><strong>{t.registration_number}</strong></td>
                    <td>{t.driver_name || '-'}</td>
                    <td>{t.origin || 'Kiln Yard'} &rarr; {t.destination || 'Customer Location'}</td>
                    <td>{t.distance_km ? `${t.distance_km} KM` : '-'}</td>
                    <td>{t.batch_number || t.sale_number || 'General'}</td>
                    <td><strong>{formatINR(t.cost_paise)}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'vehicles' && (
        <div className="glass-card" style={{ padding: '20px' }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Registration #</th>
                  <th>Driver Name</th>
                  <th>Capacity Details</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((v) => (
                  <tr key={v.id}>
                    <td><strong>{v.registration_number}</strong></td>
                    <td>{v.driver_name || '-'}</td>
                    <td>{v.capacity_details || 'Standard'}</td>
                    <td><span className="badge badge-emerald">ACTIVE</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Vehicle Modal */}
      {isNewVehicleOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px' }}>Add Vehicle to Fleet</h3>
            <form onSubmit={handleCreateVehicle}>
              <div className="form-group">
                <label className="form-label">Registration Number</label>
                <input type="text" className="form-input" placeholder="e.g. MH-12-AB-1234" value={vehicleForm.registration_number || ''} onChange={e => setVehicleForm({ ...vehicleForm, registration_number: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Driver Name</label>
                <input type="text" className="form-input" placeholder="e.g. Suresh Shinde" value={vehicleForm.driver_name || ''} onChange={e => setVehicleForm({ ...vehicleForm, driver_name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Capacity Details</label>
                <input type="text" className="form-input" placeholder="e.g. 5,000 bricks capacity" value={vehicleForm.capacity_details || ''} onChange={e => setVehicleForm({ ...vehicleForm, capacity_details: e.target.value })} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsNewVehicleOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Vehicle</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
