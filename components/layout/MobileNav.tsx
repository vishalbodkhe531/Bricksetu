'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navItems } from './Sidebar';
import { X, Flame } from 'lucide-react';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Menu */}
      <div className="fixed inset-y-0 left-0 z-50 w-72 max-w-[80vw] border-r border-border bg-card shadow-lg flex flex-col">
        <div className="flex h-16 items-center justify-between border-b border-border px-5 relative">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-primary" />
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold shadow-xs">
              <Flame className="h-4 w-4" />
            </div>
            <div>
              <span className="text-base font-bold text-foreground leading-none block">BrickSetu</span>
              <span className="text-[10px] text-muted-foreground">Kiln Operations ERP</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(`${item.href}`));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-xs font-semibold transition-colors ${
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

        <div className="border-t border-border p-4 text-[11px] font-medium text-muted-foreground text-center bg-muted/20">
          v1.0.0 • Operations Register
        </div>
      </div>
    </div>
  );
}
