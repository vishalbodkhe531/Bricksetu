import { api } from '@/lib/axios/axiosInstance';
import type { OrganizationSettings, UserProfile } from '../types/settings.types';

export interface SettingsData {
  organization: OrganizationSettings | null;
  profiles: UserProfile[];
}

export const settingsApi = {
  getSettings: async (_orgId?: string): Promise<SettingsData> => {
    const { data } = await api.get<SettingsData>('/settings');
    return data;
  },
};
