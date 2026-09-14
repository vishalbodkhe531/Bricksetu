'use client';

import React from 'react';
import { Target, Hammer, Flame, AlertTriangle, TrendingUp, Coins, DollarSign, Calendar } from 'lucide-react';
import { KPIGrid, KPICardItem } from '@/features/workers/components/KPICard';
import type { BatchKPIs } from '../types/production.types';
import { formatCostPerBrick, formatPaiseToRupees } from '../utils/production-calculations';

interface BatchKPISummaryProps {
  kpis: BatchKPIs;
}

export function BatchKPISummary({ kpis }: BatchKPISummaryProps) {
  const items: KPICardItem[] = [
    {
      id: 'target',
      label: 'उद्दिष्ट',
      value: kpis.target_quantity.toLocaleString(),
      subtext: `Days active: ${kpis.days_in_production} days`,
      icon: Target,
      iconColor: 'text-primary',
    },
    {
      id: 'moulded',
      label: 'पाडलेली वीट',
      value: kpis.moulded_quantity.toLocaleString(),
      subtext: `Labour cost: ${formatPaiseToRupees(kpis.total_moulding_labour_cost_paise)}`,
      icon: Hammer,
      iconColor: 'text-amber-500',
      valueColor: 'text-amber-500',
    },
    {
      id: 'fired_good',
      label: 'पक्की वीट',
      value: kpis.fired_good_quantity.toLocaleString(),
      subtext: `Yield: ${kpis.yield_percentage}% of moulded`,
      icon: Flame,
      iconColor: 'text-emerald-500',
      valueColor: 'text-emerald-500',
    },
    {
      id: 'wastage',
      label: 'नुकसान',
      value: kpis.damaged_quantity.toLocaleString(),
      subtext: `Wastage: ${kpis.wastage_percentage}% loss`,
      icon: AlertTriangle,
      iconColor: 'text-destructive',
      valueColor: 'text-destructive',
    },
    {
      id: 'material_cost',
      label: 'इंधन खर्च',
      value: formatPaiseToRupees(kpis.total_material_cost_paise),
      subtext: 'Coal, Wood, Husk usage',
      icon: Coins,
      iconColor: 'text-amber-500',
    },
    {
      id: 'expenses',
      label: 'इतर खर्च',
      value: formatPaiseToRupees(kpis.total_expense_cost_paise),
      subtext: 'Batch linked expenses',
      icon: DollarSign,
      iconColor: 'text-primary',
    },
    {
      id: 'total_cost',
      label: 'एकूण खर्च',
      value: formatPaiseToRupees(kpis.total_production_cost_paise),
      subtext: 'Material + Labour + Expense',
      icon: TrendingUp,
      iconColor: 'text-primary',
      valueColor: 'text-primary font-bold',
    },
    {
      id: 'cost_per_brick',
      label: 'दर वीट खर्च',
      value: formatCostPerBrick(kpis.cost_per_brick_paise),
      subtext: 'Based on fired good yield',
      icon: Calendar,
      iconColor: 'text-emerald-500',
      valueColor: 'text-emerald-500 font-bold',
    },
  ];

  return <KPIGrid items={items} columns={4} />;
}
