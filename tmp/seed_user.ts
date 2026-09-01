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

  // 1. Get existing auth users
  const { data: listData } = await supabase.auth.admin.listUsers();
  const existingAuthUser = listData?.users?.find((u) => u.email === email);

  let userId: string;

  if (existingAuthUser) {
    userId = existingAuthUser.id;
    // Update password to ensure it matches
    await supabase.auth.admin.updateUserById(userId, { password });
  } else {
    const { data: newAuthUser, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: 'Admin User', role: 'owner' },
    });
    if (error) throw error;
    userId = newAuthUser.user.id;
  }

  // 2. Get business unit
  let bu = await prisma.business_units.findFirst();
  if (!bu) {
    bu = await prisma.business_units.create({
      data: {
        code: 'MAIN-KILN',
        name: 'Main Brick Kiln',
      },
    });
  }

  // 3. Upsert into app_auth.users table
  const userInDb = await prisma.users.findFirst({ where: { id: userId } });
  if (!userInDb) {
    await prisma.users.create({
      data: {
        id: userId,
        business_unit_id: bu.id,
        email,
        full_name: 'Admin User',
        role: 'OWNER',
        password_hash: 'managed_by_supabase_auth',
        is_active: true,
      },
    });
  }

  console.log('SUCCESS_LOGIN_CREDENTIALS');
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
}

main().catch(console.error);
