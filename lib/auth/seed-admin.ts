import { createClient } from '@supabase/supabase-js';
import { prisma } from '@/lib/prisma';

let isSeeded = false;

/**
 * Ensures the default admin user exists in both Supabase Auth and Prisma DB.
 * Runs atomically once on demand/middleware check.
 */
export async function ensureAdminUserSeeded(): Promise<void> {
  if (isSeeded) return;

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) return;

    const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const adminEmail = 'admin@bricksetu.com';
    const adminPassword = 'Password@123';

    // 1. Check if admin user exists in Supabase Auth
    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
    let authUser = users?.find((u) => u.email?.toLowerCase() === adminEmail.toLowerCase());

    if (!authUser) {
      const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: { full_name: 'System Admin' },
      });

      if (createErr || !created.user) {
        console.error('[SEED ADMIN ERROR] Failed to create Supabase Auth admin:', createErr);
        return;
      }
      authUser = created.user;
      console.log('[SEED ADMIN SUCCESS] Created default admin user in Supabase Auth:', authUser.id);
    }

    // 2. Ensure default Business Unit exists in Prisma
    let bu = await prisma.business_units.findFirst();
    if (!bu) {
      bu = await prisma.business_units.create({
        data: {
          code: 'BU-MAIN',
          name: 'Main Brick Kiln',
          is_active: true,
        },
      });
      console.log('[SEED ADMIN SUCCESS] Created default Business Unit:', bu.id);
    }

    // 3. Ensure user record exists in Prisma app_auth.users
    const existingDbUser = await prisma.users.findFirst({
      where: {
        OR: [{ id: authUser.id }, { email: adminEmail }],
      },
    });

    if (!existingDbUser) {
      await prisma.users.create({
        data: {
          id: authUser.id,
          business_unit_id: bu.id,
          username: 'admin',
          email: adminEmail,
          password_hash: '$2a$10$dummyhash', // Auth handled via Supabase Auth
          full_name: 'System Admin',
          role: 'ADMIN',
          is_active: true,
        },
      });
      console.log('[SEED ADMIN SUCCESS] Created default admin profile in Prisma DB');
    } else if (existingDbUser.id !== authUser.id) {
      // Sync ID if mismatch
      await prisma.users.update({
        where: { email: adminEmail },
        data: { id: authUser.id, business_unit_id: bu.id, is_active: true },
      });
    }

    isSeeded = true;
  } catch (error) {
    console.error('[SEED ADMIN ERROR]', error);
  }
}
