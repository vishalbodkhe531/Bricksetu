import { useState } from 'react';
import { Flame, Menu, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Sidebar } from './Sidebar';

interface MobileHeaderProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenQuickEntry: () => void;
  user: any;
  onLogout: () => void;
}

export function MobileHeader({
  currentTab,
  onSelectTab,
  onOpenQuickEntry,
  user,
  onLogout,
}: MobileHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-800/80 bg-slate-950/85 px-4 backdrop-blur-xl lg:hidden">
      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetTrigger asChild>
          <button
            type="button"
            aria-label="Open navigation menu"
            className="inline-flex size-10 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/70 text-slate-300 transition-colors hover:bg-slate-800 hover:text-white focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:outline-none"
          >
            <Menu className="size-5" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <SheetTitle className="sr-only">Workspace navigation</SheetTitle>
          <Sidebar
            currentTab={currentTab}
            onSelectTab={onSelectTab}
            user={user}
            onLogout={onLogout}
            onNavigate={() => setIsMenuOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <div className="flex items-center gap-2.5">
        <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/20">
          <Flame className="size-4" />
        </div>
        <span className="text-sm font-extrabold tracking-tight text-white">BrickSetu</span>
      </div>

      <Button
        type="button"
        size="sm"
        onClick={onOpenQuickEntry}
        className="bg-orange-500 px-2.5 text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600"
      >
        <Plus className="size-4" />
        <span>Entry</span>
      </Button>
    </header>
  );
}
