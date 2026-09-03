import { createClient } from '@supabase/supabase-js';

/**
 * Service-role Supabase client — bypasses RLS entirely.
 * ⚠️  NEVER import this file in a "use client" component or any file
 *     that might be bundled for the browser.
 * Use ONLY in: API Route Handlers, Server Actions, migration scripts.
 */

if (typeof window !== 'undefined') {
  throw new Error('[lib/supabase/admin] This module must not be imported client-side.');
}

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
