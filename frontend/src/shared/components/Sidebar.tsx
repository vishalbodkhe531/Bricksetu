import React from 'react';
import { 
  LayoutDashboard, Flame, Package, Users, Truck, ShoppingCart, 
  Wallet, FileText, Settings, LogOut, Layers, ChevronRight, ChevronLeft, Sun, Moon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '../context/themeContext';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  user: any;
  onLogout: () => void;
  className?: string;
  onNavigate?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentTab, 
  onSelectTab, 
  user, 
  onLogout, 
  className, 
  onNavigate,
  isCollapsed = false,
  onToggleCollapse
}) => {
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'production', label: 'Batches & Production', icon: Flame },
    { id: 'inventory', label: 'Stock & Inventory', icon: Layers },
    { id: 'workers', label: 'Workers & Wages', icon: Users },
    { id: 'materials', label: 'Materials & Vendors', icon: Package },
    { id: 'sales', label: 'Customers & Sales', icon: ShoppingCart },
    { id: 'payments', label: 'Payments & Overhead', icon: Wallet },
    { id: 'transport', label: 'Transport & Trips', icon: Truck },
    { id: 'reports', label: 'Reports & Analytics', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className={cn('flex h-full flex-col bg-card text-card-foreground border-r border-border transition-all duration-300 relative select-none', className)}>
      
      {/* Brand Header & Integrated Toggle Button */}
      <div className={`p-3.5 border-b border-border flex items-center ${isCollapsed ? 'justify-center flex-col gap-2' : 'justify-between'}`}>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="size-9 bg-orange-500 rounded-xl flex items-center justify-center text-white font-extrabold shadow-md shadow-orange-500/25 shrink-0">
            <Flame className="size-4.5" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-extrabold text-foreground tracking-tight leading-none">BrickSetu</h2>
              <p className="text-[10px] text-muted-foreground font-medium mt-1 truncate">
                {user?.business_unit_name || 'Kiln Management'}
              </p>
            </div>
          )}
        </div>

        {/* Toggle Collapse Button - Fits neatly inside header */}
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="size-7 rounded-lg bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-3 scrollbar-thin">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          
          if (isCollapsed) {
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onNavigate?.();
                }}
                title={item.label}
                className={`size-9 rounded-xl flex items-center justify-center mx-auto transition-all cursor-pointer ${
                  isActive
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                }`}
              >
                <Icon className="size-4.5" />
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectTab(item.id);
                onNavigate?.();
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-orange-500 text-white font-semibold shadow-md shadow-orange-500/25'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60 font-medium'
              }`}
            >
              <Icon className="size-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Controls: Logout & Theme Switch in 1 row 2 columns at bottom */}
      <div className="p-2 border-t border-border">
        {!isCollapsed ? (
          <div className="grid grid-cols-2 gap-1.5">
            {/* Logout Button */}
            <button
              type="button"
              onClick={onLogout}
              className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted border border-border/40 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="size-3.5 shrink-0" />
              <span>Logout</span>
            </button>

            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted border border-border/40 transition-colors cursor-pointer"
              title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === 'dark' ? (
                <>
                  <Moon className="size-3.5 text-orange-400 shrink-0" />
                  <span>Dark</span>
                </>
              ) : (
                <>
                  <Sun className="size-3.5 text-orange-500 shrink-0" />
                  <span>Light</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5 items-center">
            {/* Collapsed Logout Button */}
            <button
              type="button"
              onClick={onLogout}
              title="Logout"
              className="size-9 rounded-xl bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-all cursor-pointer"
            >
              <LogOut className="size-4" />
            </button>

            {/* Collapsed Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className="size-9 bg-muted/50 hover:bg-muted rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              {theme === 'dark' ? <Moon className="size-4 text-orange-400" /> : <Sun className="size-4 text-orange-500" />}
            </button>
          </div>
        )}
      </div>

    </aside>
  );
};
