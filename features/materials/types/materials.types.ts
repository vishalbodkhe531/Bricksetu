export interface RawMaterial {
  id: string;
  organization_id: string;
  name: string;
  unit: string;
  reorder_level?: number | null;
  description?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: string;
  organization_id: string;
  name: string;
  contact_person?: string | null;
  phone?: string | null;
  address?: string | null;
  gst_number?: string | null;
  created_at: string;
  updated_at: string;
}

export interface RawMaterialInput {
  name: string;
  unit: string;
  reorder_level?: number | null;
  description?: string | null;
}

export interface SupplierInput {
  name: string;
  contact_person?: string | null;
  phone?: string | null;
  address?: string | null;
  gst_number?: string | null;
}
