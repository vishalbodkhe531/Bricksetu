import { api } from '@/lib/axios/axiosInstance';
import type { RawMaterial, Supplier, RawMaterialInput, SupplierInput } from '../types/materials.types';

export const materialsApi = {
  listMaterials: async (_orgId?: string): Promise<RawMaterial[]> => {
    const { data } = await api.get<RawMaterial[]>('/materials');
    return data;
  },

  createMaterial: async (input: RawMaterialInput): Promise<RawMaterial> => {
    const { data } = await api.post<RawMaterial>('/materials', input);
    return data;
  },

  listSuppliers: async (_orgId?: string): Promise<Supplier[]> => {
    const { data } = await api.get<Supplier[]>('/materials/suppliers');
    return data;
  },

  createSupplier: async (input: SupplierInput): Promise<Supplier> => {
    const { data } = await api.post<Supplier>('/materials/suppliers', input);
    return data;
  },
};
