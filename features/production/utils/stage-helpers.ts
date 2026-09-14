import { BatchStage } from '../types/production.types';
import { STAGE_OPTIONS, STAGE_ORDER } from '../constants/production-options';

export function getStageOption(stage: BatchStage) {
  return (
    STAGE_OPTIONS.find((s) => s.id === stage) || {
      id: stage,
      label: stage,
      labelMarathi: stage,
      description: '',
      iconName: 'HelpCircle',
      colorClass: 'text-muted-foreground',
      bgClass: 'bg-muted',
      borderClass: 'border-border',
    }
  );
}

export function getNextStage(currentStage: BatchStage): BatchStage | null {
  const currentIndex = STAGE_ORDER.indexOf(currentStage);
  if (currentIndex === -1 || currentIndex >= STAGE_ORDER.length - 1) {
    return null;
  }
  return STAGE_ORDER[currentIndex + 1];
}

export function getPreviousStage(currentStage: BatchStage): BatchStage | null {
  const currentIndex = STAGE_ORDER.indexOf(currentStage);
  if (currentIndex <= 0) {
    return null;
  }
  return STAGE_ORDER[currentIndex - 1];
}

export function getStageProgressPercentage(stage: BatchStage): number {
  const index = STAGE_ORDER.indexOf(stage);
  if (index === -1) return 0;
  return Math.round(((index + 1) / STAGE_ORDER.length) * 100);
}

export function isStageAtOrAfter(stage: BatchStage, targetStage: BatchStage): boolean {
  const stageIdx = STAGE_ORDER.indexOf(stage);
  const targetIdx = STAGE_ORDER.indexOf(targetStage);
  return stageIdx >= targetIdx;
}
