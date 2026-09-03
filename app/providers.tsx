'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/query/queryClient';
import { AuthProvider } from '@/context/AuthContext';
import { WebVitalsReporter } from '@/components/analytics/web-vitals';

/**
 * Root client-side providers.
 * Wraps the whole app with:
 *  - QueryClientProvider (TanStack Query)
 *  - AuthProvider (session context)
 *  - WebVitalsReporter (Core Web Vitals monitoring)
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
      <WebVitalsReporter />
    </QueryClientProvider>
  );
}
