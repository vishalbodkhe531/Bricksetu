import { query } from '@/lib/db/pool';
import { requireSession } from '@/lib/auth/require-session';
import { safeBigInt } from '@/lib/utils';

export async function getVehicles() {
  const user = await requireSession();
  const { rows } = await query(
    'SELECT * FROM transport.vehicles WHERE business_unit_id = $1 ORDER BY registration_number ASC',
    [user.business_unit_id]
  );
  return rows;
}

export async function getTrips() {
  const user = await requireSession();
  const { rows } = await query(
    `SELECT t.*, v.registration_number, v.driver_name, b.batch_number, s.sale_number
     FROM transport.trips t
     JOIN transport.vehicles v ON v.id = t.vehicle_id
     LEFT JOIN production.batches b ON b.id = t.batch_id
     LEFT JOIN sales.records s ON s.id = t.sale_id
     WHERE t.business_unit_id = $1
     ORDER BY t.trip_date DESC`,
    [user.business_unit_id]
  );
  return rows.map((r) => ({
    ...r,
    distance_km: parseFloat(r.distance_km || '0'),
    cost_paise: safeBigInt(r.cost_paise).toString(),
  }));
}
