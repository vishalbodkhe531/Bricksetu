import React, { useState, useEffect } from 'react';
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
import { apiRequest } from './shared/api/client';
import { LoadingSpinner } from './shared/components/LoadingSpinner';

export function App() {
  const [user, setUser] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isQuickEntryOpen, setIsQuickEntryOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const u = await apiRequest('/auth/me');
      setUser(u);
    } catch (err) {
      setUser(null);
    } finally {
      setLoadingAuth(false);
    }
  }

  const handleLogout = async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error(err);
    }
    setUser(null);
  };

  if (loadingAuth) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <LoadingSpinner label="Loading BrickSetu Workspace..." />
      </div>
    );
  }

  if (!user) {
    return <LoginView onLoginSuccess={(u) => setUser(u)} />;
  }

  return (
    <AppLayout
      contentKey={refreshKey}
      sidebar={
        <Sidebar
          className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-border bg-card shadow-xl backdrop-blur-xl lg:flex"
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
          user={user}
          onLogout={handleLogout}
        />
      }
      mobileHeader={
        <MobileHeader
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
          onOpenQuickEntry={() => setIsQuickEntryOpen(true)}
          user={user}
          onLogout={handleLogout}
        />
      }
      mobileNavigation={
        <MobileNav
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
          onOpenQuickEntry={() => setIsQuickEntryOpen(true)}
        />
      }
    >
      {currentTab === 'dashboard' && <DashboardView onOpenQuickEntry={() => setIsQuickEntryOpen(true)} onNavigate={(t) => setCurrentTab(t)} />}
      {currentTab === 'production' && <ProductionView />}
      {currentTab === 'inventory' && <InventoryView />}
      {currentTab === 'workers' && <WorkersView />}
      {currentTab === 'materials' && <MaterialsView />}
      {currentTab === 'sales' && <SalesView />}
      {currentTab === 'payments' && <PaymentsView />}
      {currentTab === 'transport' && <TransportView />}
      {currentTab === 'reports' && <ReportsView />}
      {currentTab === 'settings' && <SettingsView />}
      <QuickEntryModal
        isOpen={isQuickEntryOpen}
        onClose={() => setIsQuickEntryOpen(false)}
        onSuccess={() => setRefreshKey(prev => prev + 1)}
      />
    </AppLayout>
  );
}

export default App;
