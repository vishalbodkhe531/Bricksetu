'use client';

import React from 'react';
import { ThemeToggle } from '../ThemeToggle';
import { LogOut, User as UserIcon, Menu } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface HeaderProps {
  user?: {
    full_name?: string;
    username?: string;
    business_unit_name?: string;
    role?: string;
  } | null;
  onMobileMenuToggle?: () => void;
}

export function Header({ user, onMobileMenuToggle }: HeaderProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = React.useState(false);

  async function handleLogout() {
    try {
      setLoggingOut(true);
      const res = await fetch('/api/v1/auth/logout', { method: 'POST' });
      if (res.ok) {
        toast.success('Logged out successfully');
        router.push('/login');
        router.refresh();
      } else {
        toast.error('Logout failed');
      }
    } catch {
      toast.error('An error occurred during logout');
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/95 backdrop-blur px-4 sm:px-6">
      {/* Mobile Toggle & BU Label */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-foreground lg:hidden hover:bg-accent"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {user?.business_unit_name || 'Main Kiln Unit'}
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* User Info Badge */}
        <div className="hidden sm:flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs">
          <UserIcon className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-medium text-foreground">{user?.full_name || user?.username || 'Admin'}</span>
          <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
            {user?.role || 'ADMIN'}
          </span>
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-border bg-card px-3 text-xs font-medium text-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground disabled:opacity-50"
          title="Sign out"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
