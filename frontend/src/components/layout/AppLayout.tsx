import type { ReactNode } from 'react';

interface AppLayoutProps {
  children: ReactNode;
  sidebar: ReactNode;
  mobileHeader: ReactNode;
  mobileNavigation: ReactNode;
  contentKey?: number;
  isSidebarCollapsed?: boolean;
}

export function AppLayout({
  children,
  sidebar,
  mobileHeader,
  mobileNavigation,
  contentKey,
  isSidebarCollapsed = false,
}: AppLayoutProps) {
  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      {sidebar}
      <div className={`min-w-0 transition-all duration-300 ${isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
        {mobileHeader}
        <main key={contentKey} className="min-w-0 px-4 py-5 pb-24 sm:px-6 sm:py-6 lg:px-4 lg:py-6 lg:pb-10">
          <div className="mx-auto w-full max-w-[1600px]">{children}</div>
        </main>
      </div>
      {mobileNavigation}
    </div>
  );
}
