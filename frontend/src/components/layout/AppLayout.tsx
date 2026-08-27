import type { ReactNode } from 'react';

interface AppLayoutProps {
  children: ReactNode;
  sidebar: ReactNode;
  mobileHeader: ReactNode;
  mobileNavigation: ReactNode;
  contentKey?: number;
}

export function AppLayout({
  children,
  sidebar,
  mobileHeader,
  mobileNavigation,
  contentKey,
}: AppLayoutProps) {
  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      {sidebar}
      <div className="min-w-0 lg:pl-72">
        {mobileHeader}
        <main key={contentKey} className="min-w-0 px-4 py-5 pb-28 sm:px-6 sm:py-6 lg:px-8 lg:py-8 lg:pb-10 2xl:px-10">
          <div className="mx-auto w-full max-w-[1600px]">{children}</div>
        </main>
      </div>
      {mobileNavigation}
    </div>
  );
}
