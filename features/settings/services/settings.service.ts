import { prisma } from '@/lib/prisma';
import type { OrganizationSettings, UserProfile } from '../types/settings.types';

export class SettingsService {
  /**
   * Get organization details by ID (scoped)
   */
  static async getOrganization(orgId: string): Promise<OrganizationSettings | null> {
    const unit = await prisma.business_units.findUnique({
      where: { id: orgId },
    });

    if (!unit) return null;

    return {
      id: unit.id,
      name: unit.name,
      slug: unit.code,
      created_at: unit.created_at.toISOString(),
      updated_at: unit.updated_at.toISOString(),
    };
  }

  /**
   * List all users in organization (scoped)
   */
  static async listProfiles(orgId: string): Promise<UserProfile[]> {
    const users = await prisma.users.findMany({
      where: { business_unit_id: orgId },
      orderBy: { full_name: 'asc' },
    });

    return users.map((u: any) => ({
      id: u.id,
      organization_id: u.business_unit_id,
      full_name: u.full_name,
      email: u.email,
      role: u.role.toLowerCase() as UserProfile['role'],
      created_at: u.created_at.toISOString(),
      updated_at: u.updated_at.toISOString(),
    }));
  }
}
