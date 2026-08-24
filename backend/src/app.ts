import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import { pool, query } from './shared/db/pool.js';
import { AppError, UnauthorizedError } from './shared/errors/index.js';

import { authRoutes } from './features/auth/auth.routes.js';
import { settingsRoutes } from './features/settings/settings.routes.js';
import { workersRoutes } from './features/workers/workers.routes.js';
import { productionRoutes } from './features/production/production.routes.js';
import { inventoryRoutes } from './features/inventory/inventory.routes.js';
import { materialsRoutes } from './features/materials/materials.routes.js';
import { customersRoutes } from './features/customers/customers.routes.js';
import { salesRoutes } from './features/sales/sales.routes.js';
import { paymentsRoutes } from './features/payments/payments.routes.js';
import { settlementsRoutes } from './features/settlements/settlements.routes.js';
import { expensesRoutes } from './features/expenses/expenses.routes.js';
import { transportRoutes } from './features/transport/transport.routes.js';
import { openingBalancesRoutes } from './features/opening-balances/opening-balances.routes.js';
import { reportsRoutes } from './features/reports/reports.routes.js';

dotenv.config();

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
    pgClient: () => Promise<any>;
  }
}

export function buildApp(): FastifyInstance {
  const app = Fastify({
    logger: true,
  });

  // Plugins
  app.register(cookie, {
    secret: process.env.SESSION_SECRET || 'super-secret-key-at-least-32-chars-long',
  });

  app.register(cors, {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  });

  // DB client helper
  app.decorate('pgClient', async () => {
    return pool.connect();
  });

  // Auth Decorator
  app.decorate('authenticate', async (req: FastifyRequest, reply: FastifyReply) => {
    const sessionToken = req.cookies.bricksetu_session;
    if (!sessionToken) {
      throw new UnauthorizedError('No active session token found.');
    }

    const { rows } = await query(
      `SELECT u.id, u.business_unit_id, u.username, u.email, u.full_name, u.role, u.is_active, s.expires_at, bu.name as bu_name
       FROM app_auth.sessions s
       JOIN app_auth.users u ON u.id = s.user_id
       JOIN core.business_units bu ON bu.id = u.business_unit_id
       WHERE s.id = $1 AND s.expires_at > clock_timestamp() AND u.is_active = true`,
      [sessionToken]
    );

    if (rows.length === 0) {
      reply.clearCookie('bricksetu_session', { path: '/' });
      throw new UnauthorizedError('Session expired or invalid.');
    }

    (req as any).user = {
      id: rows[0].id,
      business_unit_id: rows[0].business_unit_id,
      business_unit_name: rows[0].bu_name,
      username: rows[0].username,
      email: rows[0].email,
      full_name: rows[0].full_name,
      role: rows[0].role,
    };
  });

  // Register Feature API Routes under /api/v1
  app.register(async (v1) => {
    v1.register(authRoutes);
    v1.register(settingsRoutes);
    v1.register(workersRoutes);
    v1.register(productionRoutes);
    v1.register(inventoryRoutes);
    v1.register(materialsRoutes);
    v1.register(customersRoutes);
    v1.register(salesRoutes);
    v1.register(paymentsRoutes);
    v1.register(settlementsRoutes);
    v1.register(expensesRoutes);
    v1.register(transportRoutes);
    v1.register(openingBalancesRoutes);
    v1.register(reportsRoutes);
  }, { prefix: '/api/v1' });

  // Global Error Handler
  app.setErrorHandler((error, req, reply) => {
    req.log.error(error);

    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
        requestId: req.id,
      });
    }

    // Handle PL/pgSQL database exceptions
    if ((error as any).code || (error as any).hint) {
      const code = (error as any).message || 'DATABASE_ERROR';
      const message = (error as any).hint || (error as any).message;
      return reply.status(400).send({
        error: {
          code,
          message,
          details: [],
        },
        requestId: req.id,
      });
    }

    return reply.status(500).send({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected internal server error occurred.',
        details: [],
      },
      requestId: req.id,
    });
  });

  return app;
}
