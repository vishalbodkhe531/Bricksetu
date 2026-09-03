"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";

export function ClientDashboardContainer({
  children,
  user,
}: {
  children: React.ReactNode;
  user: any;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <Sidebar className="hidden lg:flex w-64 shrink-0 fixed inset-y-0 left-0 z-40" />

        {/* Mobile Navigation Drawer */}
        <MobileNav
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
          <Header
            user={user}
            onMobileMenuToggle={() => setMobileMenuOpen((prev) => !prev)}
          />
          <main className="flex-1 p-4 sm:p-6 lg:px-3 lg:py-4 w-full">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
