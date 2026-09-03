import { QueryClient } from '@tanstack/react-query';

/**
 * Global QueryClient — tuned per performance plan §7.
 *   staleTime 30s: don't refetch if data < 30s old (avoids redundant requests)
 *   gcTime 5min: keep cached data 5 min after last subscriber unmounts
 *   retry 1: single retry on failure (not 3 — avoids waterfall delays on hard errors)
 *   refetchOnWindowFocus: false — opt-in per query where it genuinely matters
 *     (e.g. useDashboardSummary sets it to true explicitly)
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,          // 30s — balance freshness vs. request volume
      gcTime: 5 * 60_000,         // 5 min garbage collect
      retry: 1,
      refetchOnWindowFocus: false, // opt-in per hook — not shotgun
    },
  },
});
