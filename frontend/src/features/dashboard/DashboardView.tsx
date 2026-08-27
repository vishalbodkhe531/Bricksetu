import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Plus, Flame, Layers, Users, ShoppingCart, 
  Wallet, Truck, Package, ArrowRight, TrendingUp
} from 'lucide-react';
import { apiRequest } from '../../shared/api/client';
import { formatINR } from '../../shared/utils/formatters';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { PageHeader } from '../../shared/components/PageHeader';
import { LoadingSpinner } from '../../shared/components/LoadingSpinner';
import { EmptyState } from '../../shared/components/EmptyState';

import { useAppDispatch } from '@/store/hooks';
import { setCurrentTab, openQuickEntry } from '@/store/slices/uiSlice';

interface DashboardViewProps {
  onOpenQuickEntry?: () => void;
  onNavigate?: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenQuickEntry: propsOnOpenQuickEntry,
  onNavigate: propsOnNavigate,
}) => {
  const dispatch = useAppDispatch();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const handleNavigate = (tab: string) => {
    if (propsOnNavigate) {
      propsOnNavigate(tab);
    } else {
      dispatch(setCurrentTab(tab));
    }
  };

  const handleOpenQuickEntry = () => {
    if (propsOnOpenQuickEntry) {
      propsOnOpenQuickEntry();
    } else {
      dispatch(openQuickEntry());
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      const res = await apiRequest('/dashboard/summary');
      setData(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <LoadingSpinner label="Loading Kiln Operational Metrics..." />;
  }

  const kpiCards = [
    {
      label: 'Active Batches', value: data?.active_batches || 0, suffix: '',
      icon: Flame, color: 'orange',
      badge: 'In Production', desc: 'Active kiln rounds',
      descIcon: <TrendingUp className="size-3 text-emerald-500 dark:text-emerald-400" />,
    },
    {
      label: 'Finished Stock', value: (data?.finished_stock_total || 0).toLocaleString(), suffix: 'Bricks',
      icon: Layers, color: 'emerald',
      desc: 'Available for customer dispatch',
    },
    {
      label: 'Customer Receivables', value: formatINR(data?.customer_receivables_paise || 0), suffix: '',
      icon: ShoppingCart, color: 'blue',
      desc: 'Pending customer collections', valueColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Supplier Payables', value: formatINR(data?.supplier_payables_paise || 0), suffix: '',
      icon: Wallet, color: 'rose',
      desc: 'Outstanding vendor dues', valueColor: 'text-rose-600 dark:text-rose-400',
    },
  ];

  const colorMap: Record<string, { iconBg: string; iconText: string; badgeBg: string; badgeBorder: string; badgeText: string }> = {
    orange: { iconBg: 'bg-orange-500/10', iconText: 'text-orange-500 dark:text-orange-400', badgeBg: 'bg-orange-500/10', badgeBorder: 'border-orange-500/30', badgeText: 'text-orange-600 dark:text-orange-400' },
    emerald: { iconBg: 'bg-emerald-500/10', iconText: 'text-emerald-500 dark:text-emerald-400', badgeBg: 'bg-emerald-500/10', badgeBorder: 'border-emerald-500/30', badgeText: 'text-emerald-600 dark:text-emerald-400' },
    blue: { iconBg: 'bg-blue-500/10', iconText: 'text-blue-500 dark:text-blue-400', badgeBg: 'bg-blue-500/10', badgeBorder: 'border-blue-500/30', badgeText: 'text-blue-600 dark:text-blue-400' },
    rose: { iconBg: 'bg-rose-500/10', iconText: 'text-rose-500 dark:text-rose-400', badgeBg: 'bg-rose-500/10', badgeBorder: 'border-rose-500/30', badgeText: 'text-rose-600 dark:text-rose-400' },
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kiln Operations Dashboard"
        description="Live summary metrics, batch firing status, receivables, finished stock, and quick actions"
        icon={<LayoutDashboard className="size-5 sm:size-6" />}
        actions={
          <Button 
            onClick={handleOpenQuickEntry}
            className="h-10 bg-orange-500 px-4 text-xs font-bold text-white shadow-md shadow-orange-500/20 hover:bg-orange-600 sm:text-sm border-0 cursor-pointer"
          >
            <Plus className="size-4" /> Quick Daily Entry
          </Button>
        }
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {kpiCards.map((kpi, idx) => {
          const Icon = kpi.icon;
          const colors = colorMap[kpi.color];
          return (
            <Card key={idx} className="bg-card border-border shadow-xs text-card-foreground p-4 hover:border-orange-500/30 transition-all duration-200">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{kpi.label}</span>
                <div className={`size-8 rounded-lg ${colors.iconBg} ${colors.iconText} flex items-center justify-center border border-current/10 shrink-0`}>
                  <Icon className="size-4" />
                </div>
              </div>
              <div className="mt-2.5 flex items-baseline justify-between gap-2">
                <span className={`text-xl sm:text-2xl font-extrabold ${kpi.valueColor || 'text-foreground'} tracking-tight`}>{kpi.value}</span>
                {kpi.suffix && <span className="text-[11px] text-muted-foreground font-medium">{kpi.suffix}</span>}
                {kpi.badge && (
                  <Badge variant="outline" className={`${colors.badgeBorder} ${colors.badgeText} ${colors.badgeBg} text-[10px] font-bold py-0.5 px-2`}>
                    {kpi.badge}
                  </Badge>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1.5 flex items-center gap-1">
                {kpi.descIcon} {kpi.desc}
              </p>
            </Card>
          );
        })}
      </div>

      {/* Production & Sales Quick Nav Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Finished Stock Table Card */}
        <Card className="lg:col-span-2 bg-card border-border shadow-xs text-card-foreground p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3.5">
            <div>
              <h3 className="text-sm font-bold text-foreground">Finished Stock Ledger</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Current quantities ready in yard by grade</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleNavigate('inventory')} 
              className="text-xs border-border text-foreground hover:bg-muted gap-1.5 h-8 px-3 cursor-pointer"
            >
              View Full Stock <ArrowRight className="size-3.5" />
            </Button>
          </div>

          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide py-2.5">Brick Type</TableHead>
                  <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide py-2.5">Grade</TableHead>
                  <TableHead className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wide text-right py-2.5">Available Qty</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.stock_breakdown?.length > 0 ? (
                  data.stock_breakdown.map((item: any, idx: number) => (
                    <TableRow key={idx} className="border-border hover:bg-muted/40">
                      <TableCell className="font-semibold text-foreground text-sm py-2.5">{item.brick_type_name}</TableCell>
                      <TableCell className="py-2.5">
                        <Badge variant="outline" className="border-amber-500/30 text-amber-600 bg-amber-500/10 text-[10px] font-bold dark:text-amber-400">
                          {item.brick_grade_name}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-bold text-emerald-600 dark:text-emerald-400 text-sm py-2.5">
                        {item.quantity.toLocaleString()} bricks
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow className="border-border">
                    <TableCell colSpan={3}>
                      <EmptyState 
                        title="No stock lots recorded" 
                        description="Use Quick Entry to log initial stock."
                        actionLabel="Quick Entry"
                        onAction={handleOpenQuickEntry}
                      />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Operational Modules Shortcut Card */}
        <Card className="bg-card border-border shadow-xs text-card-foreground p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground mb-0.5">Quick Operational Modules</h3>
            <p className="text-[11px] text-muted-foreground mb-3">Direct access to daily workflow entry views</p>

            <div className="space-y-1.5">
              {[
                { label: 'Batches & Production', tab: 'production', icon: Flame, desc: 'Moulding, Drying, Loading, Firing, Unloading' },
                { label: 'Workers & Settlements', tab: 'workers', icon: Users, desc: 'Paji weekly wages & piece-rate logs' },
                { label: 'Materials & Suppliers', tab: 'materials', icon: Package, desc: 'Coal, Soil, Fuel, & Vendor ledger' },
                { label: 'Customers & Sales', tab: 'sales', icon: ShoppingCart, desc: 'Brick dispatch register & receivables' },
                { label: 'Payments & Expenses', tab: 'payments', icon: Wallet, desc: 'Money transfers & overhead logging' },
              ].map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.tab}
                    onClick={() => handleNavigate(m.tab)}
                    className="w-full flex items-center justify-between border border-border bg-muted/30 hover:bg-muted/70 hover:border-orange-500/40 rounded-lg p-2.5 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="size-7 rounded-md bg-orange-500/10 text-orange-500 dark:text-orange-400 flex items-center justify-center shrink-0">
                        <Icon className="size-3.5" />
                      </div>
                      <div className="text-left">
                        <span className="text-xs font-semibold text-foreground block leading-tight">{m.label}</span>
                        <span className="text-[10px] text-muted-foreground block leading-tight mt-0.5">{m.desc}</span>
                      </div>
                    </div>
                    <ArrowRight className="size-3.5 text-muted-foreground shrink-0 group-hover:text-foreground transition-colors" />
                  </button>
                );
              })}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
