import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Server-side Supabase client.
 * Reads auth cookies to run queries as the authenticated user.
 * Use in Server Components, Server Actions, and API Route Handlers.
 */
const defaultUrl = 'https://bkqumgjimrzrlyvdvuvs.supabase.co';
const defaultKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrcXVtZ2ppbXJ6cmx5dmR2dXZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzMDg1MjgsImV4cCI6MjEwMzg4NDUyOH0.PqWdpbUXaZP6clJmRLxvmM7khz8MBZxA_HxbcIFlo2s';

export async function createServerSupabase() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || defaultUrl,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || defaultKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll is called from a Server Component where cookie mutation
            // is a no-op. Middleware handles cookie refresh instead.
          }
        },
      },
    }
  );
}
