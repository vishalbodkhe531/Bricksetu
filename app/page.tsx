import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth/session';

export const runtime = 'nodejs';

export default async function Home() {
  const user = await getSessionUser();
  if (user) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}
