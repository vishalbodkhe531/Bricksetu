'use client';

import React from 'react';
import { ThemeToggle } from '../ThemeToggle';
import { LogOut, Menu, Building2, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { createBrowserSupabase } from '@/lib/supabase/client';

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
      const supabase = createBrowserSupabase();
      await supabase.auth.signOut();
      await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
      toast.success('Logged out successfully');
      router.push('/login');
      router.refresh();
    } catch {
      toast.error('An error occurred during logout');
    } finally {
      setLoggingOut(false);
    }
  }

  const userDisplayName = user?.full_name || user?.username || 'Admin';
  const userInitials = userDisplayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/95 backdrop-blur px-4 sm:px-6">
      {/* Top 3px Kiln Ember brand accent line */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-primary" />

      {/* Left: Mobile Toggle & Facility Switcher */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-foreground lg:hidden hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Facility Switcher Pill */}
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs font-semibold text-foreground shadow-xs cursor-pointer hover:bg-muted/70 transition-colors">
          <Building2 className="h-4 w-4 text-primary shrink-0" />
          <span className="truncate max-w-[140px] sm:max-w-none">
            {user?.business_unit_name || 'Main Kiln'}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground ml-0.5 shrink-0" />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* User Pill Component */}
        <div className="hidden sm:flex items-center gap-2.5 rounded-full border border-border bg-card px-2.5 py-1 shadow-xs">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold tracking-tighter shrink-0">
            {userInitials}
          </div>
          <span className="text-xs font-medium text-foreground truncate max-w-[120px]">
            {userDisplayName}
          </span>
          <Badge variant="outline" className="text-[10px] font-bold tracking-wider py-0 px-1.5 uppercase bg-muted/50 border-border text-muted-foreground">
            {user?.role || 'ADMIN'}
          </Badge>
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Logout Button */}
        <Button
          variant="outline"
          size="default"
          onClick={handleLogout}
          disabled={loggingOut}
          className="h-9 px-3 text-xs text-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
          title="Sign out of system"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}
