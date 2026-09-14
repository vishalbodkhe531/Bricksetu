import { BatchStage } from '../types/production.types';

export interface StageOption {
  id: BatchStage;
  label: string;
  labelMarathi: string;
  description: string;
  iconName: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
}

export const STAGE_OPTIONS: StageOption[] = [
  {
    id: 'MOULDING',
    label: 'Moulding',
    labelMarathi: 'पाथाई / म्हाळ',
    description: 'Raw bricks moulding by workers',
    iconName: 'Hammer',
    colorClass: 'text-amber-500',
    bgClass: 'bg-amber-500/10',
    borderClass: 'border-amber-500/30',
  },
  {
    id: 'DRYING',
    label: 'Drying',
    labelMarathi: 'वाळवणे',
    description: 'Drying raw bricks in sun',
    iconName: 'Sun',
    colorClass: 'text-yellow-500',
    bgClass: 'bg-yellow-500/10',
    borderClass: 'border-yellow-500/30',
  },
  {
    id: 'FIRING',
    label: 'Firing & Burning',
    labelMarathi: 'भट्टी भरणी व भाजणी',
    description: 'Kiln loading and burning with fuel',
    iconName: 'Flame',
    colorClass: 'text-orange-500',
    bgClass: 'bg-orange-500/10',
    borderClass: 'border-orange-500/30',
  },
  {
    id: 'SORTING',
    label: 'Sorting & Grading',
    labelMarathi: 'काढणी व प्रतवारी',
    description: 'Unloading kiln and sorting by quality',
    iconName: 'Layers',
    colorClass: 'text-blue-500',
    bgClass: 'bg-blue-500/10',
    borderClass: 'border-blue-500/30',
  },
  {
    id: 'COMPLETED',
    label: 'Completed',
    labelMarathi: 'पूर्ण / साठा तयार',
    description: 'Finished bricks available in inventory',
    iconName: 'CheckCircle',
    colorClass: 'text-emerald-500',
    bgClass: 'bg-emerald-500/10',
    borderClass: 'border-emerald-500/30',
  },
];

export const STAGE_ORDER: BatchStage[] = [
  'MOULDING',
  'DRYING',
  'FIRING',
  'SORTING',
  'COMPLETED',
];

export const BATCH_FILTER_TABS = [
  { id: 'ALL', label: 'All Bhatti', labelMarathi: 'सर्व भट्ट्या' },
  { id: 'IN_PROGRESS', label: 'In Progress', labelMarathi: 'चालू भट्टी' },
  { id: 'MOULDING', label: 'Moulding', labelMarathi: 'पाथाई' },
  { id: 'DRYING', label: 'Drying', labelMarathi: 'वाळवणे' },
  { id: 'FIRING', label: 'Firing', labelMarathi: 'भाजणी' },
  { id: 'SORTING', label: 'Sorting', labelMarathi: 'प्रतवारी' },
  { id: 'COMPLETED', label: 'Completed', labelMarathi: 'पूर्ण भट्टी' },
];

export const BATCH_DETAIL_TABS = [
  { id: 'overview', label: 'Overview / माहिती', icon: 'FileText' },
  { id: 'stages', label: 'Stage Transitions / टप्पे', icon: 'GitCommit' },
  { id: 'moulding', label: 'Moulding Logs / पाथाई नोंद', icon: 'Hammer' },
  { id: 'consumption', label: 'Material Usage / इंधन वापर', icon: 'Fuel' },
  { id: 'expenses', label: 'Expenses / इतर खर्च', icon: 'Coins' },
  { id: 'finished_goods', label: 'Finished Stock / पक्का माल', icon: 'PackageCheck' },
] as const;
