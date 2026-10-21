import { createBrowserClient } from '@supabase/ssr';

/**
 * Browser-side Supabase client.
 * Uses the anon key — RLS enforces data security.
 * Safe to use in React components / client hooks.
 */
const defaultUrl = 'https://bkqumgjimrzrlyvdvuvs.supabase.co';
const defaultKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrcXVtZ2ppbXJ6cmx5dmR2dXZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzMDg1MjgsImV4cCI6MjEwMzg4NDUyOH0.PqWdpbUXaZP6clJmRLxvmM7khz8MBZxA_HxbcIFlo2s';

export function createBrowserSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || defaultUrl,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || defaultKey
  );
}
