export interface OrganizationSettings {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  organization_id: string;
  full_name: string;
  email: string;
  role: 'owner' | 'manager' | 'accountant' | 'sales_rep' | 'viewer';
  created_at: string;
  updated_at: string;
}
