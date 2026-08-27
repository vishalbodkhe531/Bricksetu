import React from 'react';
import { LayoutDashboard, Flame, Layers, ShoppingCart, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setCurrentTab, openQuickEntry } from '@/store/slices/uiSlice';

export const MobileNav: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentTab = useAppSelector((state) => state.ui.currentTab);

  const itemClass = (isActive: boolean) => `flex min-w-12 flex-col items-center gap-1 rounded-lg px-1 py-1 text-[10px] font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:outline-none cursor-pointer ${
    isActive ? 'text-orange-500 dark:text-orange-400' : 'text-muted-foreground hover:text-foreground'
  }`;

  return (
    <nav aria-label="Primary navigation" className="fixed inset-x-0 bottom-0 z-40 flex h-[4.5rem] items-center justify-around border-t border-border bg-card/95 px-2 pb-1 shadow-lg backdrop-blur-xl lg:hidden text-card-foreground">
      <button type="button" aria-label="Dashboard" aria-current={currentTab === 'dashboard' ? 'page' : undefined} className={itemClass(currentTab === 'dashboard')} onClick={() => dispatch(setCurrentTab('dashboard'))}>
        <LayoutDashboard size={20} strokeWidth={currentTab === 'dashboard' ? 2.5 : 1.8} />
        Home
      </button>
      <button type="button" aria-label="Production batches" aria-current={currentTab === 'production' ? 'page' : undefined} className={itemClass(currentTab === 'production')} onClick={() => dispatch(setCurrentTab('production'))}>
        <Flame size={20} strokeWidth={currentTab === 'production' ? 2.5 : 1.8} />
        Batches
      </button>
      <Button
        onClick={() => dispatch(openQuickEntry())}
        size="icon"
        aria-label="Open quick daily entry"
        className="size-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/30 -translate-y-3 border-2 border-background hover:scale-105 active:scale-95 transition-transform cursor-pointer"
      >
        <PlusCircle className="size-6 text-white" />
      </Button>
      <button type="button" aria-label="Stock and inventory" aria-current={currentTab === 'inventory' ? 'page' : undefined} className={itemClass(currentTab === 'inventory')} onClick={() => dispatch(setCurrentTab('inventory'))}>
        <Layers size={20} strokeWidth={currentTab === 'inventory' ? 2.5 : 1.8} />
        Stock
      </button>
      <button type="button" aria-label="Sales" aria-current={currentTab === 'sales' ? 'page' : undefined} className={itemClass(currentTab === 'sales')} onClick={() => dispatch(setCurrentTab('sales'))}>
        <ShoppingCart size={20} strokeWidth={currentTab === 'sales' ? 2.5 : 1.8} />
        Sales
      </button>
    </nav>
  );
};