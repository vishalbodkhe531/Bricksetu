import React from 'react';
import { 
  LayoutDashboard, Flame, Package, Users, Truck, ShoppingCart, 
  Wallet, FileText, Settings, LogOut, Layers, ChevronRight, ChevronLeft, Sun, Moon, ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '../context/themeContext';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setCurrentTab, toggleSidebarCollapse } from '@/store/slices/uiSlice';
import { logoutUser } from '@/store/slices/authSlice';

interface SidebarProps {
  className?: string;
  onNavigate?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  className, 
  onNavigate
}) => {
  const dispatch = useAppDispatch();
  const { theme, toggleTheme } = useTheme();
  
  const user = useAppSelector((state) => state.auth.user);
  const currentTab = useAppSelector((state) => state.ui.currentTab);
  const isCollapsed = useAppSelector((state) => state.ui.isSidebarCollapsed);

  const handleSelectTab = (tabId: string) => {
    dispatch(setCurrentTab(tabId));
    onNavigate?.();
  };

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const handleToggleCollapse = () => {
    dispatch(toggleSidebarCollapse());
  };

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

  const getInitials = (name?: string) => {
    if (!name) return 'BS';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <aside className={cn('flex h-full flex-col bg-card text-card-foreground border-r border-border transition-all duration-300 relative select-none', className)}>
      
      {/* Brand Header & Integrated Toggle Button */}
      <div className={cn('p-4 border-b border-border/80 flex items-center', isCollapsed ? 'justify-center flex-col gap-3' : 'justify-between')}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="size-9 bg-orange-500 rounded-xl flex items-center justify-center text-white font-extrabold shadow-md shadow-orange-500/25 shrink-0">
            <Flame className="size-5" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-bold text-foreground tracking-tight leading-none">BrickSetu</h2>
              <p className="text-xs text-muted-foreground font-normal mt-1 truncate">
                {user?.business_unit_name || 'Kiln Management'}
              </p>
            </div>
          )}
        </div>

        {/* Toggle Collapse Button */}
        <button
          type="button"
          onClick={handleToggleCollapse}
          className="p-1.5 rounded-lg text-muted-foreground/80 hover:text-foreground hover:bg-muted transition-colors cursor-pointer shrink-0"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3.5 py-4 space-y-1.5 scrollbar-thin">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          
          if (isCollapsed) {
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                title={item.label}
                className={cn(
                  'size-10 rounded-xl flex items-center justify-center mx-auto transition-all cursor-pointer',
                  isActive
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/70'
                )}
              >
                <Icon className="size-5" />
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => handleSelectTab(item.id)}
              className={cn(
                'w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-150 cursor-pointer',
                isActive
                  ? 'bg-orange-500 text-white font-semibold shadow-md shadow-orange-500/25'
                  : 'text-muted-foreground/90 hover:text-foreground hover:bg-muted/70 font-medium'
              )}
            >
              <Icon className="size-5 shrink-0" />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer / Profile Section */}
      <div className="p-3.5 border-t border-border/80 space-y-2.5">
        {!isCollapsed ? (
          <>
            {/* User Profile Info Card */}
            <div className="flex items-center justify-between gap-3 px-2 py-1.5 rounded-xl hover:bg-muted/40 transition-colors cursor-pointer">
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-9 rounded-full bg-orange-500 text-white font-bold flex items-center justify-center text-xs shadow-xs shrink-0">
                  {getInitials(user?.full_name || user?.username || 'Owner')}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-foreground truncate leading-tight">
                    {user?.full_name || user?.username || 'Owner'}
                  </h4>
                  <p className="text-xs text-muted-foreground truncate font-normal mt-0.5">
                    {user?.role || 'Admin'}
                  </p>
                </div>
              </div>
              <ChevronUp className="size-4 text-muted-foreground shrink-0" />
            </div>

            {/* Logout & Theme Toggle in 1 row 2 columns */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50">
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground bg-muted/40 hover:bg-muted border border-border/40 transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="size-3.5 shrink-0" />
                <span>Logout</span>
              </button>

              <button
                type="button"
                onClick={toggleTheme}
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground bg-muted/40 hover:bg-muted border border-border/40 transition-colors cursor-pointer"
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
          </>
        ) : (
          <div className="flex flex-col gap-2 items-center">
            {/* Collapsed Logout / Theme Buttons */}
            <button
              type="button"
              onClick={handleLogout}
              title="Logout"
              className="size-10 rounded-xl bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-all cursor-pointer"
            >
              <LogOut className="size-4.5" />
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className="size-10 bg-muted/50 hover:bg-muted rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              {theme === 'dark' ? <Moon className="size-4.5 text-orange-400" /> : <Sun className="size-4.5 text-orange-500" />}
            </button>
          </div>
        )}
      </div>

    </aside>
  );
};
