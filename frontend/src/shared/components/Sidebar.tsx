import React from 'react';
import { 
  LayoutDashboard, Flame, Package, Users, Truck, ShoppingCart, 
  Wallet, FileText, Settings, LogOut, Layers, ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  user: any;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, user, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'production', label: 'Batches & Production', icon: Flame },
    { id: 'inventory', label: 'Stock & Inventory', icon: Layers },
    { id: 'workers', label: 'Workers & Settlements', icon: Users },
    { id: 'materials', label: 'Materials & Suppliers', icon: Package },
    { id: 'sales', label: 'Customers & Sales', icon: ShoppingCart },
    { id: 'payments', label: 'Payments & Expenses', icon: Wallet },
    { id: 'transport', label: 'Transport & Trips', icon: Truck },
    { id: 'reports', label: 'Reports & Analytics', icon: FileText },
    { id: 'settings', label: 'Opening Balances & Settings', icon: Settings },
  ];

  return (
    <aside className="sidebar">
      <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '38px', height: '38px', background: 'linear-gradient(135deg, #f97316, #ea580c)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800 }}>
          BS
        </div>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>BrickSetu</h2>
          <Badge variant="outline" className="text-orange-500 border-orange-500/30 text-[10px] uppercase font-bold py-0 h-4">
            {user?.business_unit_name || 'Main Kiln'}
          </Badge>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <Button
              key={item.id}
              variant={isActive ? "secondary" : "ghost"}
              onClick={() => onSelectTab(item.id)}
              className={`w-full justify-start gap-3 mb-1 text-sm font-medium h-10 px-3 ${
                isActive 
                  ? 'bg-orange-500/10 text-orange-500 border border-orange-500/30 hover:bg-orange-500/20 font-semibold' 
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
              }`}
            >
              <Icon className="size-4 shrink-0" />
              <span>{item.label}</span>
            </Button>
          );
        })}
      </nav>

      <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <Avatar className="size-8 border border-slate-700 bg-slate-800">
            <AvatarFallback className="bg-slate-800 text-slate-300">
              <ShieldCheck className="size-4" />
            </AvatarFallback>
          </Avatar>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{user?.full_name}</p>
            <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Administrator</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onLogout} className="w-full gap-2 border-slate-700 hover:bg-slate-800 text-slate-300">
          <LogOut className="size-3.5" /> Sign Out
        </Button>
      </div>
    </aside>
  );
};
