import React, { useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Sidebar } from './shared/components/Sidebar';
import { MobileHeader } from './shared/components/MobileHeader';
import { MobileNav } from './shared/components/MobileNav';
import { QuickEntryModal } from './shared/components/QuickEntryModal';
import { LoginView } from './features/auth/LoginView';
import { DashboardView } from './features/dashboard/DashboardView';
import { ProductionView } from './features/production/ProductionView';
import { InventoryView } from './features/inventory/InventoryView';
import { WorkersView } from './features/workers/WorkersView';
import { MaterialsView } from './features/materials/MaterialsView';
import { SalesView } from './features/sales/SalesView';
import { PaymentsView } from './features/payments/PaymentsView';
import { TransportView } from './features/transport/TransportView';
import { SettingsView } from './features/settings/SettingsView';
import { ReportsView } from './features/reports/ReportsView';
import { LoadingSpinner } from './shared/components/LoadingSpinner';

import { useAppDispatch, useAppSelector } from './store/hooks';
import { fetchCurrentUser, setUser } from './store/slices/authSlice';

export function App() {
  const dispatch = useAppDispatch();

  const { user, loading: loadingAuth } = useAppSelector((state) => state.auth);
  const { currentTab, isSidebarCollapsed, refreshKey } = useAppSelector((state) => state.ui);

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  if (loadingAuth) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <LoadingSpinner label="Loading BrickSetu Workspace..." />
      </div>
    );
  }

  if (!user) {
    return <LoginView onLoginSuccess={(u) => dispatch(setUser(u))} />;
  }

  return (
    <AppLayout
      contentKey={refreshKey}
      isSidebarCollapsed={isSidebarCollapsed}
      sidebar={
        <Sidebar
          className={`fixed inset-y-0 left-0 z-40 hidden border-r border-border bg-card shadow-lg transition-all duration-300 lg:flex ${
            isSidebarCollapsed ? 'w-20' : 'w-64'
          }`}
        />
      }
      mobileHeader={<MobileHeader />}
      mobileNavigation={<MobileNav />}
    >
      {currentTab === 'dashboard' && <DashboardView />}
      {currentTab === 'production' && <ProductionView />}
      {currentTab === 'inventory' && <InventoryView />}
      {currentTab === 'workers' && <WorkersView />}
      {currentTab === 'materials' && <MaterialsView />}
      {currentTab === 'sales' && <SalesView />}
      {currentTab === 'payments' && <PaymentsView />}
      {currentTab === 'transport' && <TransportView />}
      {currentTab === 'reports' && <ReportsView />}
      {currentTab === 'settings' && <SettingsView />}
      <QuickEntryModal />
    </AppLayout>
  );
}

export default App;
