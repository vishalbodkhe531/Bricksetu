import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcryptjs';
import { query } from '../../shared/db/pool.js';
import { AppError, UnauthorizedError } from '../../shared/errors/index.js';

export async function authRoutes(fastify: FastifyInstance) {
  // Login
  fastify.post('/auth/login', async (req: FastifyRequest, reply: FastifyReply) => {
    const { username, password } = req.body as any;
    if (!username || !password) {
      throw new AppError('INVALID_INPUT', 'Username and password are required.', 400);
    }

    const { rows } = await query(
      `SELECT u.id, u.business_unit_id, u.username, u.email, u.password_hash, u.full_name, u.role, u.is_active, bu.name as bu_name
       FROM auth.users u
       JOIN core.business_units bu ON bu.id = u.business_unit_id
       WHERE u.username = $1`,
      [username]
    );

    if (rows.length === 0) {
      throw new UnauthorizedError('Invalid username or password.');
    }

    const user = rows[0];
    if (!user.is_active) {
      throw new UnauthorizedError('User account is deactivated.');
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      throw new UnauthorizedError('Invalid username or password.');
    }

    // Set cookie session token
    const sessionToken = `sess_${user.id}_${Date.now()}`;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await query(
      'INSERT INTO auth.sessions (id, user_id, expires_at) VALUES ($1, $2, $3)',
      [sessionToken, user.id, expiresAt]
    );

    reply.setCookie('bricksetu_session', sessionToken, {
      path: '/',
      httpOnly: true,
      secure: false, // development setting
      sameSite: 'lax',
      expires: expiresAt,
    });

    return {
      data: {
        id: user.id,
        business_unit_id: user.business_unit_id,
        business_unit_name: user.bu_name,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
    };
  });

  // Logout
  fastify.post('/auth/logout', async (req: FastifyRequest, reply: FastifyReply) => {
    const token = req.cookies.bricksetu_session;
    if (token) {
      await query('DELETE FROM auth.sessions WHERE id = $1', [token]);
    }
    reply.clearCookie('bricksetu_session', { path: '/' });
    return { data: { success: true } };
  });

  // Get Current User Profile
  fastify.get('/auth/me', { preHandler: [fastify.authenticate] }, async (req: FastifyRequest) => {
    const user = (req as any).user;
    return { data: user };
  });

  // User Management (Admin creates other Admins)
  fastify.get('/users', { preHandler: [fastify.authenticate] }, async (req: FastifyRequest) => {
    const currentUser = (req as any).user;
    const { rows } = await query(
      `SELECT id, username, email, full_name, role, is_active, created_at
       FROM auth.users
       WHERE business_unit_id = $1
       ORDER BY created_at DESC`,
      [currentUser.business_unit_id]
    );
    return { data: rows };
  });

  fastify.post('/users', { preHandler: [fastify.authenticate] }, async (req: FastifyRequest) => {
    const currentUser = (req as any).user;
    const { username, email, password, full_name } = req.body as any;

    if (!username || !email || !password || !full_name) {
      throw new AppError('INVALID_INPUT', 'All fields (username, email, password, full_name) are required.', 400);
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const { rows } = await query(
      `INSERT INTO auth.users (business_unit_id, username, email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4, $5, 'ADMIN')
       RETURNING id, username, email, full_name, role, is_active, created_at`,
      [currentUser.business_unit_id, username, email, hash, full_name]
    );

    return { data: rows[0] };
  });
}
