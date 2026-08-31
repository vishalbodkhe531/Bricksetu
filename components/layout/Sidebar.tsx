'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Factory,
  Boxes,
  Package,
  ShoppingCart,
  Receipt,
  Truck,
  FileText,
  Settings,
  Flame,
} from 'lucide-react';

export const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Workers & Wages', href: '/workers', icon: Users },
  { name: 'Production', href: '/production', icon: Factory },
  { name: 'Inventory & Stock', href: '/inventory', icon: Boxes },
  { name: 'Materials & Purchases', href: '/materials', icon: Package },
  { name: 'Sales & Customers', href: '/sales', icon: ShoppingCart },
  { name: 'Payments & Allocations', href: '/payments', icon: Receipt },
  { name: 'Transport & Trips', href: '/transport', icon: Truck },
  { name: 'Reports & Analytics', href: '/reports', icon: FileText },
  { name: 'Settings & Setup', href: '/settings', icon: Settings },
];

export function Sidebar({ className = '' }: { className?: string }) {
  const pathname = usePathname();

  return (
    <aside className={`flex flex-col border-r border-border bg-card select-none ${className}`}>
      {/* Brand Logo Header */}
      <div className="flex h-16 items-center gap-3 border-b border-border px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold shadow-xs">
          <Flame className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-base font-bold tracking-tight text-foreground leading-none">BrickSetu</h1>
          <p className="text-[11px] font-medium text-muted-foreground mt-0.5">Kiln Operations ERP</p>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 scrollbar-thin">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(`${item.href}`));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                  : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
              }`}
            >
              <Icon className="h-4.5 w-4.5 shrink-0 stroke-[1.75]" />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer info */}
      <div className="border-t border-border p-4 text-[11px] font-medium text-muted-foreground text-center bg-muted/20">
        v1.0.0 • Operations Register
      </div>
    </aside>
  );
}
