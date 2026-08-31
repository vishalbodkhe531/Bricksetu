import { getSessionUser, AuthUser } from '@/lib/auth/session';

export async function getCurrentUser(): Promise<AuthUser | null> {
  return await getSessionUser();
}
