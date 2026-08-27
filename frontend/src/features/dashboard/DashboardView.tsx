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

interface DashboardViewProps {
  onOpenQuickEntry: () => void;
  onNavigate: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onOpenQuickEntry, onNavigate }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
      descIcon: <TrendingUp className="size-3 text-emerald-400" />,
    },
    {
      label: 'Finished Stock', value: (data?.finished_stock_total || 0).toLocaleString(), suffix: 'Bricks',
      icon: Layers, color: 'emerald',
      desc: 'Available for customer dispatch',
    },
    {
      label: 'Customer Receivables', value: formatINR(data?.customer_receivables_paise || 0), suffix: '',
      icon: ShoppingCart, color: 'blue',
      desc: 'Pending customer collections', valueColor: 'text-blue-400',
    },
    {
      label: 'Supplier Payables', value: formatINR(data?.supplier_payables_paise || 0), suffix: '',
      icon: Wallet, color: 'rose',
      desc: 'Outstanding vendor dues', valueColor: 'text-rose-400',
    },
  ];

  const colorMap: Record<string, { iconBg: string; iconText: string; badgeBg: string; badgeBorder: string; badgeText: string }> = {
    orange: { iconBg: 'bg-orange-500/10', iconText: 'text-orange-400', badgeBg: 'bg-orange-500/10', badgeBorder: 'border-orange-500/30', badgeText: 'text-orange-400' },
    emerald: { iconBg: 'bg-emerald-500/10', iconText: 'text-emerald-400', badgeBg: 'bg-emerald-500/10', badgeBorder: 'border-emerald-500/30', badgeText: 'text-emerald-400' },
    blue: { iconBg: 'bg-blue-500/10', iconText: 'text-blue-400', badgeBg: 'bg-blue-500/10', badgeBorder: 'border-blue-500/30', badgeText: 'text-blue-400' },
    rose: { iconBg: 'bg-rose-500/10', iconText: 'text-rose-400', badgeBg: 'bg-rose-500/10', badgeBorder: 'border-rose-500/30', badgeText: 'text-rose-400' },
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kiln Operations Dashboard"
        description="Live summary metrics, batch firing status, receivables, finished stock, and quick actions"
        icon={<LayoutDashboard className="size-5 sm:size-6" />}
        actions={
          <Button 
            onClick={onOpenQuickEntry}
            className="h-10 bg-orange-500 px-4 text-xs font-bold text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600 sm:text-sm"
          >
            <Plus className="size-4" /> Quick Daily Entry
          </Button>
        }
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi, idx) => {
          const Icon = kpi.icon;
          const colors = colorMap[kpi.color];
          return (
            <Card key={idx} className="bg-slate-900/60 border-slate-800/60 backdrop-blur-sm shadow-sm text-slate-100 p-5 hover:border-slate-700/80 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{kpi.label}</span>
                <div className={`size-9 rounded-lg ${colors.iconBg} ${colors.iconText} flex items-center justify-center border border-current/20`}>
                  <Icon className="size-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between gap-2">
                <span className={`text-2xl sm:text-3xl font-extrabold ${kpi.valueColor || 'text-white'} tracking-tight`}>{kpi.value}</span>
                {kpi.suffix && <span className="text-[11px] text-slate-500 font-medium">{kpi.suffix}</span>}
                {kpi.badge && (
                  <Badge variant="outline" className={`${colors.badgeBorder} ${colors.badgeText} ${colors.badgeBg} text-[10px] font-bold`}>
                    {kpi.badge}
                  </Badge>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
                {kpi.descIcon} {kpi.desc}
              </p>
            </Card>
          );
        })}
      </div>

      {/* Production & Sales Quick Nav Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Finished Stock Table Card */}
        <Card className="lg:col-span-2 bg-slate-900/60 border-slate-800/60 backdrop-blur-sm shadow-sm text-slate-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Finished Stock Ledger</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Current quantities ready in yard by grade</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onNavigate('inventory')} 
              className="text-xs border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-white gap-1.5 h-8"
            >
              View Full Stock <ArrowRight className="size-3.5" />
            </Button>
          </div>

          <div className="rounded-lg border border-slate-800/60 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-950/40">
                <TableRow className="border-slate-800/60 hover:bg-transparent">
                  <TableHead className="text-slate-500 font-semibold uppercase text-[11px] tracking-wide">Brick Type</TableHead>
                  <TableHead className="text-slate-500 font-semibold uppercase text-[11px] tracking-wide">Grade</TableHead>
                  <TableHead className="text-slate-500 font-semibold uppercase text-[11px] tracking-wide text-right">Available Qty</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.stock_breakdown?.length > 0 ? (
                  data.stock_breakdown.map((item: any, idx: number) => (
                    <TableRow key={idx} className="border-slate-800/40 hover:bg-slate-800/30">
                      <TableCell className="font-semibold text-slate-200 text-sm">{item.brick_type_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-amber-500/30 text-amber-400 bg-amber-500/10 text-[10px] font-bold">
                          {item.brick_grade_name}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-bold text-emerald-400 text-sm">
                        {item.quantity.toLocaleString()} bricks
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow className="border-slate-800/40">
                    <TableCell colSpan={3}>
                      <EmptyState 
                        title="No stock lots recorded" 
                        description="Use Quick Entry to log initial stock."
                        actionLabel="Quick Entry"
                        onAction={onOpenQuickEntry}
                      />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Operational Modules Shortcut Card */}
        <Card className="bg-slate-900/60 border-slate-800/60 backdrop-blur-sm shadow-sm text-slate-100 p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-0.5">Quick Operational Modules</h3>
            <p className="text-[11px] text-slate-500 mb-4">Direct access to daily workflow entry views</p>

            <div className="space-y-2">
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
                    onClick={() => onNavigate(m.tab)}
                    className="w-full flex items-center justify-between border border-slate-800/50 bg-slate-950/30 hover:bg-slate-800/50 hover:border-slate-700/60 rounded-lg p-3 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-md bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0">
                        <Icon className="size-4" />
                      </div>
                      <div className="text-left">
                        <span className="text-xs font-semibold text-slate-200 block">{m.label}</span>
                        <span className="text-[11px] text-slate-500 block">{m.desc}</span>
                      </div>
                    </div>
                    <ArrowRight className="size-4 text-slate-600 shrink-0 group-hover:text-slate-400 transition-colors" />
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
