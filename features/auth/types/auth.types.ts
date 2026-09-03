export interface Profile {
  id: string;
  organization_id: string;
  full_name: string;
  phone: string | null;
  role: 'owner' | 'manager' | 'supervisor' | 'accountant' | 'viewer';
  is_active: boolean;
  created_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  profile: Profile;
}
