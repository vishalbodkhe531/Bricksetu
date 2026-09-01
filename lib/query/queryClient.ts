import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,        // 1 min default — tune per feature
      gcTime: 5 * 60 * 1000,       // 5 min garbage collect
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
