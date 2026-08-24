import React from 'react';
import { 
  LayoutDashboard, Flame, Package, Users, Truck, ShoppingCart, 
  Wallet, FileText, Settings, LogOut, Layers, ShieldCheck
} from 'lucide-react';

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
          <span style={{ fontSize: '0.725rem', color: 'var(--accent-orange)', fontWeight: 700, textTransform: 'uppercase' }}>{user?.business_unit_name || 'Main Kiln'}</span>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                marginBottom: '4px',
                background: isActive ? 'var(--accent-orange-glow)' : 'transparent',
                color: isActive ? 'var(--accent-orange)' : 'var(--text-secondary)',
                border: isActive ? '1px solid rgba(249, 115, 22, 0.3)' : '1px solid transparent',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.9rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease',
              }}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
            <ShieldCheck size={16} />
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{user?.full_name}</p>
            <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Administrator</p>
          </div>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={onLogout} style={{ width: '100%' }}>
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </aside>
  );
};
