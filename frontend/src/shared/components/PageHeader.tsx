import React from 'react';

export interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  icon,
  badge,
  actions,
  children,
  className = '',
}) => {
  return (
    <div className={`pb-5 mb-6 border-b border-slate-800/80 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Title & Description Left Group */}
        <div className="flex items-start sm:items-center gap-3.5 min-w-0">
          {icon && (
            <div className="size-10 sm:size-11 rounded-xl bg-gradient-to-br from-orange-500/20 via-orange-500/10 to-transparent border border-orange-500/30 text-orange-400 flex items-center justify-center shrink-0 shadow-md shadow-orange-500/10">
              {icon}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white truncate">
                {title}
              </h1>
              {badge && <div className="shrink-0">{badge}</div>}
            </div>
            {description && (
              <p className="text-xs sm:text-sm text-slate-400 mt-1 font-normal leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons Right Group */}
        {actions && (
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 shrink-0 self-stretch sm:self-auto justify-start sm:justify-end">
            {actions}
          </div>
        )}
      </div>

      {/* Secondary Toolbar / Navigation Tabs Slot */}
      {children && (
        <div className="mt-4 pt-3 border-t border-slate-800/40 flex flex-wrap items-center gap-2">
          {children}
        </div>
      )}
    </div>
  );
};
