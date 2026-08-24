import { FastifyInstance, FastifyRequest } from 'fastify';
import { query } from '../../shared/db/pool.js';
import { AppError } from '../../shared/errors/index.js';

export async function transportRoutes(fastify: FastifyInstance) {
  // List Vehicles
  fastify.get('/transport/vehicles', { preHandler: [fastify.authenticate] }, async (req: FastifyRequest) => {
    const user = (req as any).user;
    const { rows } = await query(
      'SELECT * FROM transport.vehicles WHERE business_unit_id = $1 ORDER BY registration_number ASC',
      [user.business_unit_id]
    );
    return { data: rows };
  });

  // Create Vehicle
  fastify.post('/transport/vehicles', { preHandler: [fastify.authenticate] }, async (req: FastifyRequest) => {
    const user = (req as any).user;
    const { registration_number, driver_name, capacity_details } = req.body as any;

    if (!registration_number) {
      throw new AppError('INVALID_INPUT', 'Vehicle Registration Number is required.', 400);
    }

    const { rows } = await query(
      `INSERT INTO transport.vehicles (business_unit_id, registration_number, driver_name, capacity_details)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [user.business_unit_id, registration_number, driver_name || null, capacity_details || null]
    );
    return { data: rows[0] };
  });

  // List Transport Trips
  fastify.get('/transport/trips', { preHandler: [fastify.authenticate] }, async (req: FastifyRequest) => {
    const user = (req as any).user;
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
    return { data: rows };
  });

  // Log Transport Trip
  fastify.post('/transport/trips', { preHandler: [fastify.authenticate] }, async (req: FastifyRequest) => {
    const user = (req as any).user;
    const { vehicle_id, batch_id, sale_id, trip_date, origin, destination, distance_km, cost_paise, notes } = req.body as any;

    if (!vehicle_id || !trip_date || cost_paise === undefined) {
      throw new AppError('INVALID_INPUT', 'Vehicle, Trip Date, and Cost are required.', 400);
    }

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
        distance_km || null,
        cost_paise,
        notes || null,
        user.id,
      ]
    );

    return { data: rows[0] };
  });
}
