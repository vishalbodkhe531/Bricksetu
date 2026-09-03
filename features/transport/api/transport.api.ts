import { api } from '@/lib/axios/axiosInstance';
import type { Vehicle, VehicleInput } from '../types/transport.types';

export const transportApi = {
  listVehicles: async (_orgId?: string): Promise<Vehicle[]> => {
    const { data } = await api.get<Vehicle[]>('/transport');
    return data;
  },

  createVehicle: async (input: VehicleInput): Promise<Vehicle> => {
    const { data } = await api.post<Vehicle>('/transport', input);
    return data;
  },
};
