'use server';

import { query } from '@/lib/db/pool';
import { requireSession } from '@/lib/auth/require-session';
import { revalidatePath } from 'next/cache';
import { createVehicleSchema, logTripSchema } from '@/lib/validation/schemas';
import { ActionResult, formatPgError, safeParsePaise } from '@/lib/utils';
import { getVehicles, getTrips } from './queries';

export async function getVehiclesAction(): Promise<ActionResult> {
  try {
    const data = await getVehicles();
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: formatPgError(err) };
  }
}

export async function getTripsAction(): Promise<ActionResult> {
  try {
    const data = await getTrips();
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: formatPgError(err) };
  }
}

export async function createVehicleAction(formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireSession();

    const parsed = createVehicleSchema.safeParse({
      registration_number: formData.get('registration_number'),
      driver_name: formData.get('driver_name'),
      capacity_details: formData.get('capacity_details'),
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Invalid vehicle data.' };
    }

    const { registration_number, driver_name, capacity_details } = parsed.data;

    const { rows } = await query(
      `INSERT INTO transport.vehicles (business_unit_id, registration_number, driver_name, capacity_details)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [user.business_unit_id, registration_number, driver_name || null, capacity_details || null]
    );

    revalidatePath('/transport');
    return { success: true, data: rows[0] };
  } catch (err: any) {
    return { success: false, error: formatPgError(err) };
  }
}

export async function logTripAction(formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireSession();

    const parsed = logTripSchema.safeParse({
      vehicle_id: formData.get('vehicle_id'),
      batch_id: formData.get('batch_id') || undefined,
      sale_id: formData.get('sale_id') || undefined,
      trip_date: formData.get('trip_date'),
      origin: formData.get('origin'),
      destination: formData.get('destination'),
      distance_km: formData.get('distance_km'),
      cost: formData.get('cost'),
      notes: formData.get('notes'),
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Invalid trip data.' };
    }

    const {
      vehicle_id,
      batch_id,
      sale_id,
      trip_date,
      origin,
      destination,
      distance_km,
      cost,
      notes,
    } = parsed.data;

    const cost_paise = safeParsePaise(cost);

    const { rows } = await query(
      `INSERT INTO transport.trips (business_unit_id, vehicle_id, batch_id, sale_id, trip_date, origin, destination, distance_km, cost_paise, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        user.business_unit_id,
        vehicle_id,
        batch_id || null,
        sale_id || null,
        trip_date,
        origin || null,
        destination || null,
        distance_km || 0,
        cost_paise,
        notes || null,
        user.id,
      ]
    );

    revalidatePath('/transport');
    return { success: true, data: rows[0] };
  } catch (err: any) {
    return { success: false, error: formatPgError(err) };
  }
}
