import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Plus, Flame, Layers, Users, ShoppingCart, 
  Wallet, Truck, Package, ArrowRight, TrendingUp, AlertTriangle 
} from 'lucide-react';
import { apiRequest } from '../../shared/api/client';
import { formatINR } from '../../shared/utils/formatters';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PageHeader } from '../../shared/components/PageHeader';

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
    return (
      <div className="flex items-center justify-center min-h-[400px] text-orange-500 font-bold text-sm">
        Loading Kiln Operational Metrics...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Kiln Operations Dashboard"
        description="Live summary metrics, batch firing status, receivables, finished stock, and quick actions"
        icon={<LayoutDashboard className="size-5 sm:size-6" />}
        actions={
          <Button 
            onClick={onOpenQuickEntry}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold gap-2 h-10 px-4 shadow-lg shadow-orange-500/20 text-xs sm:text-sm"
          >
            <Plus className="size-4" /> Quick Daily Entry
          </Button>
        }
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Active Batches */}
        <Card className="bg-slate-900/70 border-slate-800 backdrop-blur-xl shadow-md text-slate-100 p-5 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Batches</span>
            <div className="size-9 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center border border-orange-500/20">
              <Flame className="size-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">{data?.active_batches || 0}</span>
            <Badge variant="outline" className="border-orange-500/40 text-orange-400 bg-orange-500/10 text-[10px] font-bold">
              In Production
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <TrendingUp className="size-3 text-emerald-400" /> Active kiln rounds
          </p>
        </Card>

        {/* Finished Ready Bricks */}
        <Card className="bg-slate-900/70 border-slate-800 backdrop-blur-xl shadow-md text-slate-100 p-5 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Finished Stock</span>
            <div className="size-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Layers className="size-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">
              {(data?.finished_stock_total || 0).toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 font-semibold">Bricks</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Available for customer dispatch</p>
        </Card>

        {/* Customer Receivables */}
        <Card className="bg-slate-900/70 border-slate-800 backdrop-blur-xl shadow-md text-slate-100 p-5 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Customer Receivables</span>
            <div className="size-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <ShoppingCart className="size-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-blue-400">
              {formatINR(data?.customer_receivables_paise || 0)}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Pending customer collections</p>
        </Card>

        {/* Supplier Payables */}
        <Card className="bg-slate-900/70 border-slate-800 backdrop-blur-xl shadow-md text-slate-100 p-5 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Supplier Payables</span>
            <div className="size-9 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
              <Wallet className="size-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-rose-400">
              {formatINR(data?.supplier_payables_paise || 0)}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Outstanding vendor dues</p>
        </Card>
      </div>

      {/* Production & Sales Quick Nav Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        {/* Finished Stock Table Card */}
        <Card className="lg:col-span-2 bg-slate-900/70 border-slate-800 backdrop-blur-xl shadow-md text-slate-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Finished Stock Ledger</h3>
              <p className="text-xs text-slate-400">Current quantities ready in yard by grade</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onNavigate('inventory')} 
              className="text-xs border-slate-700 text-slate-300 hover:bg-slate-800 gap-1.5 h-8"
            >
              View Full Stock <ArrowRight className="size-3.5" />
            </Button>
          </div>

          <div className="rounded-lg border border-slate-800 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-950/60">
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Brick Type</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase text-[11px]">Grade</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase text-[11px] text-right">Available Qty</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.stock_breakdown?.length > 0 ? (
                  data.stock_breakdown.map((item: any, idx: number) => (
                    <TableRow key={idx} className="border-slate-800 hover:bg-slate-800/40">
                      <TableCell className="font-semibold text-slate-100 text-xs sm:text-sm">{item.brick_type_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-amber-500/40 text-amber-400 bg-amber-500/10 text-[10px] font-bold">
                          {item.brick_grade_name}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-extrabold text-emerald-400 text-xs sm:text-sm">
                        {item.quantity.toLocaleString()} bricks
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow className="border-slate-800">
                    <TableCell colSpan={3} className="text-center text-slate-500 text-xs py-6">
                      No stock lots recorded yet. Use Quick Entry to log initial stock.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Operational Modules Shortcut Card */}
        <Card className="bg-slate-900/70 border-slate-800 backdrop-blur-xl shadow-md text-slate-100 p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-1">Quick Operational Modules</h3>
            <p className="text-xs text-slate-400 mb-4">Direct access to daily workflow entry views</p>

            <div className="space-y-2.5">
              {[
                { label: 'Batches & Production', tab: 'production', icon: Flame, desc: 'Moulding, Drying, Loading, Firing, Unloading' },
                { label: 'Workers & Settlements', tab: 'workers', icon: Users, desc: 'Paji weekly wages & piece-rate logs' },
                { label: 'Materials & Suppliers', tab: 'materials', icon: Package, desc: 'Coal, Soil, Fuel, & Vendor ledger' },
                { label: 'Customers & Sales', tab: 'sales', icon: ShoppingCart, desc: 'Brick dispatch register & receivables' },
                { label: 'Payments & Expenses', tab: 'payments', icon: Wallet, desc: 'Money transfers & overhead logging' },
              ].map((m) => {
                const Icon = m.icon;
                return (
                  <Button
                    key={m.tab}
                    variant="outline"
                    onClick={() => onNavigate(m.tab)}
                    className="w-full justify-between border-slate-800 bg-slate-950/40 hover:bg-slate-800/80 hover:border-slate-700 text-left p-3 h-auto"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-md bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0">
                        <Icon className="size-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-100 block">{m.label}</span>
                        <span className="text-[11px] text-slate-400 block font-normal">{m.desc}</span>
                      </div>
                    </div>
                    <ArrowRight className="size-4 text-slate-500 shrink-0" />
                  </Button>
                );
              })}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
