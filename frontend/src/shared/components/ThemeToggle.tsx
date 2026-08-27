import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/themeContext';
import { Button } from '@/components/ui/button';

interface ThemeToggleProps {
  variant?: 'outline' | 'ghost' | 'default';
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'outline',
  className = '',
  showLabel = false,
}) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Button
      type="button"
      variant={variant}
      size={showLabel ? 'sm' : 'icon'}
      onClick={toggleTheme}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle dark/light theme"
      className={`cursor-pointer transition-colors ${
        isDark
          ? 'border-slate-800 bg-slate-900/80 text-amber-400 hover:bg-slate-800 hover:text-amber-300'
          : 'border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
      } ${className}`}
    >
      {isDark ? <Sun className="size-4 shrink-0" /> : <Moon className="size-4 shrink-0" />}
      {showLabel && (
        <span className="text-xs font-semibold ml-1.5">
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </span>
      )}
    </Button>
  );
};
