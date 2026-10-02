export interface RawMaterial {
  id: string;
  organization_id: string;
  name: string;
  code: string;
  unit: string;
  reorder_level?: number | null;
  description?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: string;
  organization_id: string;
  code?: string | null;
  name: string;
  contact_person?: string | null;
  phone?: string | null;
  address?: string | null;
  gst_number?: string | null;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

export interface MaterialListItem {
  id: string;
  name: string;
  code: string;
  unit: string;
  reorder_level: number | null;
  description: string | null;
  is_active: boolean;
  primary_supplier_name: string | null;
  primary_supplier_phone: string | null;
  material_date: string | null;
  total_purchases: number;
  total_quantity_purchased: number;
  available_stock: number;
  created_at: string;
}

export interface PurchaseRecord {
  id: string;
  purchase_number: string;
  supplier_name: string;
  supplier_id: string;
  purchase_date: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  notes: string | null;
}

export interface ConsumptionRecord {
  id: string;
  batch_name: string | null;
  consumption_date: string;
  quantity: number;
  cost: number;
  notes: string | null;
}

export interface MaterialDetail extends MaterialListItem {
  suppliers: Supplier[];
  recent_purchases: PurchaseRecord[];
  recent_consumption: ConsumptionRecord[];
  lots_summary: {
    total_lots: number;
    active_lots: number;
    total_available: number;
  };
}

export interface RawMaterialInput {
  name: string;
  unit: string;
  quantity: number;
  rate_per_unit: number;
  total_estimated_cost?: number | null;
  material_date?: string | null;
  description?: string | null;
}

export interface SupplierInput {
  name: string;
  contact_person?: string | null;
  phone?: string | null;
  address?: string | null;
  gst_number?: string | null;
}

export interface MaterialCreateInput {
  name: string;
  unit: string;
  quantity: number;
  rate_per_unit: number;
  total_estimated_cost?: number | null;
  material_date?: string | null;
  description?: string | null;
  supplier_mode: "none" | "existing" | "new";
  supplier_id?: string | null;
  new_supplier_name?: string | null;
  new_supplier_contact_person?: string | null;
  new_supplier_phone?: string | null;
  new_supplier_address?: string | null;
  new_supplier_gst?: string | null;
}

export interface MaterialUpdateInput {
  name?: string;
  unit?: string;
  reorder_level?: number | null;
  description?: string | null;
  is_active?: boolean;
}
