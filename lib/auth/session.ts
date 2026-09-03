import { createServerSupabase } from '../supabase/server';
import { prisma } from '../prisma';
import { ensureAdminUserSeeded } from './seed-admin';

export interface AuthUser {
  id: string;
  organization_id: string;
  full_name: string;
  email: string;
  role: string;
}

/**
 * Get the authenticated user from the current session using Prisma.
 * Returns null if not logged in or user not found.
 */
export async function getSessionUser(): Promise<AuthUser | null> {
  try {
    await ensureAdminUserSeeded();
    const supabase = await createServerSupabase();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) return null;

    // Fetch user profile from Prisma
    const dbUser = await prisma.users.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        business_unit_id: true,
        full_name: true,
        email: true,
        role: true,
        is_active: true,
      },
    });

    if (!dbUser || !dbUser.is_active) return null;

    return {
      id: dbUser.id,
      organization_id: dbUser.business_unit_id,
      full_name: dbUser.full_name,
      email: dbUser.email,
      role: dbUser.role,
    };
  } catch (error) {
    console.error('[AUTH SESSION ERROR]', error);
    return null;
  }
}
