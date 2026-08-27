import React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-6 text-center ${className}`}>
      <div className="size-12 rounded-xl bg-muted/60 border border-border flex items-center justify-center text-muted-foreground mb-4">
        {icon || <Inbox className="size-6" />}
      </div>
      <h4 className="text-sm font-semibold text-foreground mb-1">{title}</h4>
      {description && (
        <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          size="sm"
          className="mt-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold gap-1.5"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
