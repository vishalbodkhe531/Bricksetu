import React from 'react';
import { LayoutDashboard, Flame, Layers, ShoppingCart, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
      <Button
        onClick={onOpenQuickEntry}
        size="icon"
        className="size-12 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg shadow-orange-500/40 -translate-y-2 border-2 border-slate-900 hover:scale-105 transition-transform"
      >
        <PlusCircle className="size-6 text-white" />
      </Button>
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
