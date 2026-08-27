import React from 'react';

interface LoadingSpinnerProps {
  label?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  label = 'Loading...',
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center min-h-[320px] gap-4 ${className}`}>
      <div className="relative size-10">
        <div className="absolute inset-0 rounded-full border-2 border-slate-800" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-orange-500 animate-spin" />
      </div>
      <span className="text-xs font-semibold text-slate-400 tracking-wide">{label}</span>
    </div>
  );
};
