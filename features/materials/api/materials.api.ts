import { api } from "@/lib/axios/axiosInstance";
import type {
  RawMaterial,
  Supplier,
  RawMaterialInput,
  SupplierInput,
  MaterialListItem,
  MaterialDetail,
  MaterialCreateInput,
  MaterialUpdateInput,
  PurchaseRecord,
  ConsumptionRecord,
} from "../types/materials.types";

export const materialsApi = {
  listMaterials: async (_orgId?: string): Promise<MaterialListItem[]> => {
    const { data } = await api.get<MaterialListItem[]>("/materials");
    return data;
  },

  getMaterialDetail: async (materialId: string): Promise<MaterialDetail> => {
    const { data } = await api.get<MaterialDetail>(`/materials/${materialId}`);
    return data;
  },

  createMaterial: async (input: MaterialCreateInput | RawMaterialInput): Promise<RawMaterial> => {
    const { data } = await api.post<RawMaterial>("/materials", input);
    return data;
  },

  updateMaterial: async (materialId: string, input: MaterialUpdateInput): Promise<RawMaterial> => {
    const { data } = await api.patch<RawMaterial>(`/materials/${materialId}`, input);
    return data;
  },

  getMaterialPurchases: async (materialId: string): Promise<PurchaseRecord[]> => {
    const { data } = await api.get<PurchaseRecord[]>(`/materials/${materialId}/purchases`);
    return data;
  },

  getMaterialConsumption: async (materialId: string): Promise<ConsumptionRecord[]> => {
    const { data } = await api.get<ConsumptionRecord[]>(`/materials/${materialId}/consumption`);
    return data;
  },

  listSuppliers: async (_orgId?: string): Promise<Supplier[]> => {
    const { data } = await api.get<Supplier[]>("/materials/suppliers");
    return data;
  },

  createSupplier: async (input: SupplierInput): Promise<Supplier> => {
    const { data } = await api.post<Supplier>("/materials/suppliers", input);
    return data;
  },
};
