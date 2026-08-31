'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {}

export function TabsList({ className, children, ...props }: TabsListProps) {
  return (
    <div
      className={cn(
        'flex border-b border-border gap-2 overflow-x-auto scrollbar-none',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface TabsTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export function TabsTrigger({
  className,
  active,
  children,
  ...props
}: TabsTriggerProps) {
  return (
    <button
      type="button"
      className={cn(
        'pb-3 px-4 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap select-none',
        active
          ? 'border-primary text-primary font-bold'
          : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
