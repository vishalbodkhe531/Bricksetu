import React from 'react';
import { 
  LayoutDashboard, Flame, Package, Users, Truck, ShoppingCart, 
  Wallet, FileText, Settings, LogOut, Layers, ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  user: any;
  onLogout: () => void;
  className?: string;
  onNavigate?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, user, onLogout, className, onNavigate }) => {
  const mainNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'production', label: 'Batches & Production', icon: Flame },
    { id: 'inventory', label: 'Stock & Inventory', icon: Layers },
    { id: 'workers', label: 'Workers & Settlements', icon: Users },
    { id: 'materials', label: 'Materials & Suppliers', icon: Package },
    { id: 'sales', label: 'Customers & Sales', icon: ShoppingCart },
    { id: 'payments', label: 'Payments & Expenses', icon: Wallet },
    { id: 'transport', label: 'Transport & Trips', icon: Truck },
  ];

  const secondaryNavItems = [
    { id: 'reports', label: 'Reports & Analytics', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderNavItem = (item: { id: string; label: string; icon: any }) => {
    const Icon = item.icon;
    const isActive = currentTab === item.id;
    return (
      <button
        key={item.id}
        onClick={() => {
          onSelectTab(item.id);
          onNavigate?.();
        }}
        aria-current={isActive ? 'page' : undefined}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 cursor-pointer group relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/70 ${
          isActive
            ? 'bg-orange-500/10 text-orange-400 font-semibold'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
        }`}
      >
        {isActive && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-orange-500" />
        )}
        <Icon className={`size-[18px] shrink-0 transition-transform duration-150 ${isActive ? '' : 'group-hover:translate-x-0.5'}`} />
        <span className="truncate">{item.label}</span>
      </button>
    );
  };

  return (
    <aside className={cn('flex h-full min-w-0 flex-col bg-slate-950 text-slate-100', className)}>
      {/* Brand Header */}
      <div className="px-5 py-5 border-b border-slate-800/60 flex items-center gap-3">
        <div className="size-9 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white text-sm font-extrabold shadow-lg shadow-orange-500/20 shrink-0">
          BS
        </div>
        <div className="min-w-0">
          <h2 className="text-[15px] font-extrabold text-white tracking-tight truncate">BrickSetu</h2>
          <Badge variant="outline" className="text-orange-400 border-orange-500/25 bg-orange-500/5 text-[10px] uppercase font-bold py-0 h-4 mt-0.5">
            {user?.business_unit_name || 'Main Kiln'}
          </Badge>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 px-3 mb-2">Operations</p>
        {mainNavItems.map(renderNavItem)}

        <div className="h-px bg-slate-800/50 my-3 mx-2" />

        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 px-3 mb-2">Insights</p>
        {secondaryNavItems.map(renderNavItem)}
      </nav>

      {/* User Footer */}
      <div className="px-4 py-4 border-t border-slate-800/60">
        <div className="flex items-center gap-2.5 mb-3">
          <Avatar className="size-8 border border-slate-700/60 bg-slate-800">
            <AvatarFallback className="bg-slate-800 text-slate-400 text-xs">
              <ShieldCheck className="size-3.5" />
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold text-slate-200 truncate">{user?.full_name}</p>
            <p className="text-[11px] text-slate-500">Administrator</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onLogout} 
          className="w-full gap-2 border-slate-800 hover:bg-slate-800/80 text-slate-400 hover:text-slate-200 text-xs h-8"
        >
          <LogOut className="size-3.5" /> Sign Out
        </Button>
      </div>
    </aside>
  );
};
