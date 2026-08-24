import React from 'react';
import { LayoutDashboard, Flame, Layers, Users, ShoppingCart, PlusCircle } from 'lucide-react';

interface MobileNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenQuickEntry: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentTab, onSelectTab, onOpenQuickEntry }) => {
  return (
    <nav className="mobile-nav">
      <button className={`mobile-nav-item ${currentTab === 'dashboard' ? 'active' : ''}`} onClick={() => onSelectTab('dashboard')}>
        <LayoutDashboard size={20} />
        Home
      </button>
      <button className={`mobile-nav-item ${currentTab === 'production' ? 'active' : ''}`} onClick={() => onSelectTab('production')}>
        <Flame size={20} />
        Batches
      </button>
      <button
        onClick={onOpenQuickEntry}
        style={{
          width: '46px',
          height: '46px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #f97316, #ea580c)',
          color: '#fff',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 15px rgba(249, 115, 22, 0.4)',
          transform: 'translateY(-10px)',
          cursor: 'pointer'
        }}
      >
        <PlusCircle size={24} />
      </button>
      <button className={`mobile-nav-item ${currentTab === 'inventory' ? 'active' : ''}`} onClick={() => onSelectTab('inventory')}>
        <Layers size={20} />
        Stock
      </button>
      <button className={`mobile-nav-item ${currentTab === 'sales' ? 'active' : ''}`} onClick={() => onSelectTab('sales')}>
        <ShoppingCart size={20} />
        Sales
      </button>
    </nav>
  );
};
