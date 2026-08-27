import React, { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { apiRequest } from '../../shared/api/client';
import { rupeesToPaise } from '../../shared/utils/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormSelect } from '@/components/ui/form-select';
import { PageHeader } from '../../shared/components/PageHeader';

export const SettingsView: React.FC = () => {
  const [masterData, setMasterData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'ob' | 'master'>('ob');

  const [obType, setObType] = useState<'STOCK' | 'MATERIAL' | 'CUSTOMER_RECEIVABLE' | 'SUPPLIER_PAYABLE'>('STOCK');
  const [obForm, setObForm] = useState<any>({});
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);

  useEffect(() => { loadSettingsData(); }, []);

  async function loadSettingsData() {
    try {
      const [m, supp, cust, mat] = await Promise.all([apiRequest('/settings/master-data'), apiRequest('/suppliers'), apiRequest('/customers'), apiRequest('/materials')]);
      setMasterData(m); setSuppliers(supp); setCustomers(cust); setMaterials(mat);
    } catch (err: any) { console.error(err); }
  }

  const handleOpeningBalanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let details: any = {};
      if (obType === 'STOCK') { details = { brick_type_id: obForm.brick_type_id, brick_grade_id: obForm.brick_grade_id, quantity: parseInt(obForm.quantity, 10), unit_cost_paise: rupeesToPaise(parseFloat(obForm.unit_cost)) }; }
      else if (obType === 'MATERIAL') { details = { material_id: obForm.material_id, quantity: parseFloat(obForm.quantity), unit_cost_paise: rupeesToPaise(parseFloat(obForm.unit_cost)) }; }
      else if (obType === 'CUSTOMER_RECEIVABLE') { details = { customer_id: obForm.customer_id, amount_paise: rupeesToPaise(parseFloat(obForm.amount)) }; }
      else if (obType === 'SUPPLIER_PAYABLE') { details = { supplier_id: obForm.supplier_id, amount_paise: rupeesToPaise(parseFloat(obForm.amount)) }; }
      await apiRequest('/opening-balances', { method: 'POST', body: JSON.stringify({ type: obType, details }) });
      alert('Opening Balance recorded successfully!');
      setObForm({});
    } catch (err: any) { alert(err.message); }
  };

  const tabClasses = (active: boolean) => `font-semibold text-xs h-8 cursor-pointer ${active ? 'bg-orange-500 hover:bg-orange-600 text-white border-transparent' : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground'}`;

  return (
    <div className="space-y-6">
      <PageHeader title="Opening Balances & Settings" description="Initial system setup, stock & party balance initialization, master lookup configuration" icon={<Settings className="size-5 sm:size-6" />} />

      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant={activeTab === 'ob' ? "default" : "outline"} onClick={() => setActiveTab('ob')} className={tabClasses(activeTab === 'ob')}>Opening Balance Wizard</Button>
        <Button size="sm" variant={activeTab === 'master' ? "default" : "outline"} onClick={() => setActiveTab('master')} className={tabClasses(activeTab === 'master')}>Master Data Lookups</Button>
      </div>

      {activeTab === 'ob' ? (
        <Card className="bg-card border-border shadow-xs text-card-foreground max-w-2xl p-6">
          <CardHeader className="p-0 pb-4"><CardTitle className="text-base font-bold text-foreground">Record Initial Opening Balances</CardTitle></CardHeader>
          <CardContent className="p-0 space-y-4">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {[
                { id: 'STOCK', label: 'Finished Stock Lot' },
                { id: 'MATERIAL', label: 'Material Stock Lot' },
                { id: 'CUSTOMER_RECEIVABLE', label: 'Customer Receivable' },
                { id: 'SUPPLIER_PAYABLE', label: 'Supplier Payable' },
              ].map(t => (
                <Button key={t.id} type="button" size="sm" variant={obType === t.id ? "default" : "outline"}
                  onClick={() => { setObType(t.id as any); setObForm({}); }}
                  className={`text-xs font-semibold cursor-pointer ${obType === t.id ? 'bg-orange-500 hover:bg-orange-600 text-white border-transparent' : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
                  {t.label}
                </Button>
              ))}
            </div>

            <form onSubmit={handleOpeningBalanceSubmit} className="space-y-4 pt-2">
              {obType === 'STOCK' && (<>
                <div className="space-y-1.5"><Label className="text-muted-foreground text-xs">Brick Type</Label>
                  <FormSelect value={obForm.brick_type_id || ''} onChange={e => setObForm({ ...obForm, brick_type_id: e.target.value })} required><option value="">-- Select Type --</option>{masterData?.brick_types.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}</FormSelect></div>
                <div className="space-y-1.5"><Label className="text-muted-foreground text-xs">Brick Grade</Label>
                  <FormSelect value={obForm.brick_grade_id || ''} onChange={e => setObForm({ ...obForm, brick_grade_id: e.target.value })} required><option value="">-- Select Grade --</option>{masterData?.brick_grades.map((g: any) => <option key={g.id} value={g.id}>{g.name}</option>)}</FormSelect></div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5"><Label className="text-muted-foreground text-xs">Quantity</Label><Input type="number" placeholder="e.g. 50000" value={obForm.quantity || ''} onChange={e => setObForm({ ...obForm, quantity: e.target.value })} required className="bg-muted/30 border-border" /></div>
                  <div className="space-y-1.5"><Label className="text-muted-foreground text-xs">Unit Cost (₹ / brick)</Label><Input type="number" step="0.01" placeholder="e.g. 5.50" value={obForm.unit_cost || ''} onChange={e => setObForm({ ...obForm, unit_cost: e.target.value })} required className="bg-muted/30 border-border" /></div>
                </div>
              </>)}

              {obType === 'MATERIAL' && (<>
                <div className="space-y-1.5"><Label className="text-muted-foreground text-xs">Material</Label>
                  <FormSelect value={obForm.material_id || ''} onChange={e => setObForm({ ...obForm, material_id: e.target.value })} required><option value="">-- Select Material --</option>{materials.map(m => <option key={m.id} value={m.id}>{m.name} ({m.unit_code})</option>)}</FormSelect></div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5"><Label className="text-muted-foreground text-xs">Quantity</Label><Input type="number" step="0.01" placeholder="e.g. 45.5" value={obForm.quantity || ''} onChange={e => setObForm({ ...obForm, quantity: e.target.value })} required className="bg-muted/30 border-border" /></div>
                  <div className="space-y-1.5"><Label className="text-muted-foreground text-xs">Unit Cost (₹)</Label><Input type="number" step="0.01" placeholder="e.g. 8500" value={obForm.unit_cost || ''} onChange={e => setObForm({ ...obForm, unit_cost: e.target.value })} required className="bg-muted/30 border-border" /></div>
                </div>
              </>)}

              {obType === 'CUSTOMER_RECEIVABLE' && (<>
                <div className="space-y-1.5"><Label className="text-muted-foreground text-xs">Customer</Label>
                  <FormSelect value={obForm.customer_id || ''} onChange={e => setObForm({ ...obForm, customer_id: e.target.value })} required><option value="">-- Select Customer --</option>{customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}</FormSelect></div>
                <div className="space-y-1.5"><Label className="text-muted-foreground text-xs">Opening Receivable Amount (₹)</Label><Input type="number" step="0.01" placeholder="e.g. 125000" value={obForm.amount || ''} onChange={e => setObForm({ ...obForm, amount: e.target.value })} required className="bg-muted/30 border-border" /></div>
              </>)}

              {obType === 'SUPPLIER_PAYABLE' && (<>
                <div className="space-y-1.5"><Label className="text-muted-foreground text-xs">Supplier</Label>
                  <FormSelect value={obForm.supplier_id || ''} onChange={e => setObForm({ ...obForm, supplier_id: e.target.value })} required><option value="">-- Select Supplier --</option>{suppliers.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}</FormSelect></div>
                <div className="space-y-1.5"><Label className="text-muted-foreground text-xs">Opening Payable Amount (₹)</Label><Input type="number" step="0.01" placeholder="e.g. 75000" value={obForm.amount || ''} onChange={e => setObForm({ ...obForm, amount: e.target.value })} required className="bg-muted/30 border-border" /></div>
              </>)}

              <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold h-10 shadow-md shadow-orange-500/20 mt-2 border-0 cursor-pointer">
                Commit Opening Balance Entry
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-card border-border shadow-xs text-card-foreground p-4">
            <h3 className="text-sm font-bold text-foreground mb-3">Brick Types</h3>
            <ul className="space-y-2">
              {masterData?.brick_types.map((t: any) => (
                <li key={t.id} className="p-2.5 bg-muted/40 rounded-lg text-xs text-foreground border border-border">
                  <strong className="text-orange-600 dark:text-orange-400 font-bold">{t.code}</strong> - {t.name}
                </li>
              ))}
            </ul>
          </Card>
          <Card className="bg-card border-border shadow-xs text-card-foreground p-4">
            <h3 className="text-sm font-bold text-foreground mb-3">Brick Grades</h3>
            <ul className="space-y-2">
              {masterData?.brick_grades.map((g: any) => (
                <li key={g.id} className="p-2.5 bg-muted/40 rounded-lg text-xs text-foreground border border-border">
                  <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{g.code}</strong> - {g.name}
                </li>
              ))}
            </ul>
          </Card>
          <Card className="bg-card border-border shadow-xs text-card-foreground p-4">
            <h3 className="text-sm font-bold text-foreground mb-3">Expense Categories</h3>
            <ul className="space-y-2">
              {masterData?.expense_categories.map((c: any) => (
                <li key={c.id} className="p-2.5 bg-muted/40 rounded-lg text-xs text-foreground border border-border">
                  <strong className="text-purple-600 dark:text-purple-400 font-bold">{c.code}</strong> - {c.name}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
};
