'use client';

import React from 'react';
import type { BatchStage } from '../types/production.types';
import { STAGE_ORDER } from '../constants/production-options';
import { getStageOption, getStageProgressPercentage } from '../utils/stage-helpers';

interface BatchProgressBarProps {
  currentStage: BatchStage;
  showLabels?: boolean;
}

export function BatchProgressBar({ currentStage, showLabels = true }: BatchProgressBarProps) {
  const currentIdx = STAGE_ORDER.indexOf(currentStage);
  const percentage = getStageProgressPercentage(currentStage);

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
        <span>Lifecycle Progress / टप्पा प्रगती</span>
        <span suppressHydrationWarning className="font-mono font-bold text-primary">{percentage}%</span>
      </div>

      <div className="relative w-full bg-muted/60 h-2.5 rounded-full overflow-hidden border border-border/50">
        <div
          className="h-full bg-linear-to-r from-amber-500 via-orange-500 to-emerald-500 transition-all duration-500 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {showLabels && (
        <div className="grid grid-cols-5 gap-1 pt-1">
          {STAGE_ORDER.map((stage, idx) => {
            const opt = getStageOption(stage);
            const isCompleted = idx <= currentIdx;
            const isCurrent = idx === currentIdx;

            return (
              <div
                key={stage}
                className={`text-center text-[10px] font-medium transition-colors ${
                  isCurrent
                    ? 'text-primary font-bold'
                    : isCompleted
                      ? 'text-foreground/80'
                      : 'text-muted-foreground/50'
                }`}
              >
                <div
                  className={`mx-auto mb-1 h-1.5 w-1.5 rounded-full ${
                    isCurrent
                      ? 'bg-primary ring-2 ring-primary/30'
                      : isCompleted
                        ? 'bg-emerald-500'
                        : 'bg-muted-foreground/30'
                  }`}
                />
                <span className="truncate block">{opt.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
