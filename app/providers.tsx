'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/AuthContext';
import { WebVitalsReporter } from '@/components/analytics/web-vitals';

/**
 * Root client-side providers.
 * Wraps the whole app with:
 *  - QueryClientProvider (TanStack Query)
 *  - AuthProvider (session context)
 *  - WebVitalsReporter (Core Web Vitals monitoring)
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,    // 5 minutes caching (prevents constant loading spinners)
            gcTime: 10 * 60 * 1000,     // Keep unused data in memory for 10 minutes
            retry: 1,
            refetchOnWindowFocus: false, // Don't refetch on window focus
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
      </AuthProvider>
      <WebVitalsReporter />
    </QueryClientProvider>
  );
}
