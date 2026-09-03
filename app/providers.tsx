'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/query/queryClient';
import { AuthProvider } from '@/context/AuthContext';

/**
 * Root client-side providers.
 * Wraps the whole app with:
 *  - QueryClientProvider (TanStack Query)
 *  - AuthProvider (session context)
 *
 * Server Components still call the service layer directly — they never
 * go through Axios or React Query.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryClientProvider>
  );
}
