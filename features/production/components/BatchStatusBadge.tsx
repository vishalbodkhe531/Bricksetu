'use client';

import React from 'react';
import { Hammer, Sun, Flame, Layers, CheckCircle2, AlertCircle } from 'lucide-react';
import type { BatchStage, BatchStatus } from '../types/production.types';
import { getStageOption } from '../utils/stage-helpers';

interface BatchStatusBadgeProps {
  stage: BatchStage;
  status?: BatchStatus;
  showIcon?: boolean;
  showMarathi?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function BatchStatusBadge({
  stage,
  status,
  showIcon = true,
  showMarathi = true,
  size = 'md',
}: BatchStatusBadgeProps) {
  const opt = getStageOption(stage);

  const iconsMap: Record<BatchStage, React.ElementType> = {
    MOULDING: Hammer,
    DRYING: Sun,
    FIRING: Flame,
    SORTING: Layers,
    COMPLETED: CheckCircle2,
  };

  const IconComponent = iconsMap[stage] || AlertCircle;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3 py-1.5 text-sm gap-2',
  }[size];

  if (status === 'CANCELLED') {
    return (
      <span
        className={`inline-flex items-center font-semibold rounded-full bg-destructive/10 text-destructive border border-destructive/30 ${sizeClasses}`}
      >
        {showIcon && <AlertCircle className="h-3.5 w-3.5" />}
        <span>Cancelled / रद्द</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border transition-all ${opt.bgClass} ${opt.colorClass} ${opt.borderClass} ${sizeClasses}`}
    >
      {showIcon && <IconComponent className="h-3.5 w-3.5" />}
      <span>
        {opt.label}
        {showMarathi && <span className="opacity-80 font-normal ml-1">({opt.labelMarathi})</span>}
      </span>
    </span>
  );
}
