import React from 'react';
import { getSessionUser } from '@/lib/auth/session';
import { ClientDashboardContainer } from './client-container';

export const dynamic = 'force-dynamic';

export default async function DashboardLayoutClientShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  return (
    <DashboardLayoutWrapper user={user}>
      {children}
    </DashboardLayoutWrapper>
  );
}

function DashboardLayoutWrapper({
  children,
  user,
}: {
  children: React.ReactNode;
  user: any;
}) {
  return (
    <ClientDashboardContainer user={user}>
      {children}
    </ClientDashboardContainer>
  );
}
