import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { SettingsService } from '@/features/settings/services/settings.service';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const [organization, profiles] = await Promise.all([
      SettingsService.getOrganization(user.organization_id),
      SettingsService.listProfiles(user.organization_id),
    ]);

    return NextResponse.json({
      organization,
      profiles,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
