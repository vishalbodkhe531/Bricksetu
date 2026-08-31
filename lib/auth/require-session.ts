import { redirect } from 'next/navigation';
import { getSessionUser, AuthUser } from './session';

export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized access') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export async function requireSession(): Promise<AuthUser> {
  const user = await getSessionUser();
  if (!user) {
    redirect('/login');
  }
  return user;
}
