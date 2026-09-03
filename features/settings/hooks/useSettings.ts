'use client';

import { useQuery } from '@tanstack/react-query';
import { settingsApi } from '../api/settings.api';

const settingsKeys = {
  all: ['settings'] as const,
  detail: (orgId: string) => ['settings', orgId] as const,
};

export function useSettings(orgId: string) {
  return useQuery({
    queryKey: settingsKeys.detail(orgId),
    queryFn: () => settingsApi.getSettings(orgId),
    staleTime: 5 * 60 * 1000,
    enabled: !!orgId,
  });
}
