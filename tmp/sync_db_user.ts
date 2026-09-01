import { createClient } from '@supabase/supabase-js';
import { prisma } from '../lib/prisma';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const email = 'admin@bricksetu.com';
  const password = 'Password@123';

  // 1. Get existing auth user
  const { data: listData } = await supabase.auth.admin.listUsers();
  let authUser = listData?.users?.find((u) => u.email === email);

  if (!authUser) {
    const { data: created, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: 'Admin User', role: 'owner' },
    });
    if (error) {
      console.error('Create error:', error);
      return;
    }
    authUser = created.user;
  } else {
    await supabase.auth.admin.updateUserById(authUser.id, { password });
  }

  // 2. Sync to DB users table using authUser.id
  let bu = await prisma.business_units.findFirst();
  if (!bu) {
    bu = await prisma.business_units.create({
      data: {
        code: 'MAIN-KILN',
        name: 'Main Brick Kiln',
      },
    });
  }

  const existingDbUser = await prisma.users.findUnique({ where: { id: authUser.id } });
  if (!existingDbUser) {
    await prisma.users.create({
      data: {
        id: authUser.id,
        business_unit_id: bu.id,
        username: `admin_${Date.now()}`,
        email,
        full_name: 'Admin User',
        role: 'ADMIN',
        password_hash: 'supabase_auth',
        is_active: true,
      },
    });
  }

  console.log('--- LOGIN CREDENTIALS ---');
  console.log('Email:   ', email);
  console.log('Password:', password);
}

main().catch(console.error);
