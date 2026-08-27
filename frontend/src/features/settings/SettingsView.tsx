import React, { useState, useEffect } from 'react';
import { Settings, AlertCircle, CheckCircle2 } from 'lucide-react';
import { apiRequest } from '../../shared/api/client';
import { rupeesToPaise } from '../../shared/utils/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormSelect } from '@/components/ui/form-select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PageHeader } from '../../shared/components/PageHeader';

export const SettingsView: React.FC = () => {
  const [masterData, setMasterData] = useState<any>(null);

  const [obType, setObType] = useState<'STOCK' | 'MATERIAL' | 'CUSTOMER_RECEIVABLE' | 'SUPPLIER_PAYABLE'>('STOCK');
  const [obForm, setObForm] = useState<any>({});
  const [obError, setObError] = useState('');
  const [obSuccess, setObSuccess] = useState('');
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
    setObError('');
    setObSuccess('');
    try {
      let details: any = {};
      if (obType === 'STOCK') { details = { brick_type_id: obForm.brick_type_id, brick_grade_id: obForm.brick_grade_id, quantity: parseInt(obForm.quantity, 10), unit_cost_paise: rupeesToPaise(parseFloat(obForm.unit_cost)) }; }
      else if (obType === 'MATERIAL') { details = { material_id: obForm.material_id, quantity: parseFloat(obForm.quantity), unit_cost_paise: rupeesToPaise(parseFloat(obForm.unit_cost)) }; }
      else if (obType === 'CUSTOMER_RECEIVABLE') { details = { customer_id: obForm.customer_id, amount_paise: rupeesToPaise(parseFloat(obForm.amount)) }; }
      else if (obType === 'SUPPLIER_PAYABLE') { details = { supplier_id: obForm.supplier_id, amount_paise: rupeesToPaise(parseFloat(obForm.amount)) }; }
      await apiRequest('/opening-balances', { method: 'POST', body: JSON.stringify({ type: obType, details }) });
      setObSuccess('Opening Balance recorded successfully!');
      setObForm({});
    } catch (err: any) { setObError(err.message || 'Failed to save opening balance'); }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Opening Balances & Settings"
        description="Initial system setup, stock & party balance initialization, master lookup configuration"
        icon={<Settings className="size-5 sm:size-6" />}
      />

      <Tabs defaultValue="ob" className="space-y-4">
        <TabsList className="bg-muted p-1 rounded-xl">
          <TabsTrigger value="ob" className="gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer">
            Opening Balance Wizard
          </TabsTrigger>
          <TabsTrigger value="master" className="gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer">
            Master Data Lookups
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ob">
          <Card className="bg-card border-border shadow-xs text-card-foreground max-w-2xl p-5 sm:p-6">
            <CardHeader className="p-0 pb-4"><CardTitle className="text-base font-bold text-foreground">Record Initial Opening Balances</CardTitle></CardHeader>
            <CardContent className="p-0 space-y-4">
              {obError && (
                <Alert variant="destructive">
                  <AlertCircle className="size-4" />
                  <AlertDescription>{obError}</AlertDescription>
                </Alert>
              )}
              {obSuccess && (
                <Alert variant="success">
                  <CheckCircle2 className="size-4" />
                  <AlertDescription>{obSuccess}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {[
                  { id: 'STOCK', label: 'Finished Brick Stock' },
                  { id: 'MATERIAL', label: 'Raw Material Inventory' },
                  { id: 'CUSTOMER_RECEIVABLE', label: 'Customer Debt / Receivable' },
                  { id: 'SUPPLIER_PAYABLE', label: 'Supplier Payable Balance' },
                ].map((t) => (
                  <Button
                    key={t.id}
                    type="button"
                    variant={obType === t.id ? "default" : "outline"}
                    onClick={() => { setObType(t.id as any); setObForm({}); setObError(''); setObSuccess(''); }}
                    className={`justify-start font-semibold text-xs h-10 px-3.5 border-border ${obType === t.id ? 'bg-orange-500 hover:bg-orange-600 text-white border-transparent' : 'hover:bg-muted text-foreground'}`}
                  >
                    {t.label}
                  </Button>
                ))}
              </div>

              <form onSubmit={handleOpeningBalanceSubmit} className="space-y-4 pt-2 border-t border-border">
                {obType === 'STOCK' && (
                  <>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5"><Label className="text-muted-foreground text-xs font-semibold">Brick Type</Label>
                        <FormSelect value={obForm.brick_type_id || ''} onChange={e => setObForm({ ...obForm, brick_type_id: e.target.value })} required>
                          <option value="">-- Select Type --</option>
                          {masterData?.brick_types?.map((bt: any) => (<option key={bt.id} value={bt.id}>{bt.name}</option>))}
                        </FormSelect>
                      </div>
                      <div className="space-y-1.5"><Label className="text-muted-foreground text-xs font-semibold">Brick Grade</Label>
                        <FormSelect value={obForm.brick_grade_id || ''} onChange={e => setObForm({ ...obForm, brick_grade_id: e.target.value })} required>
                          <option value="">-- Select Grade --</option>
                          {masterData?.brick_grades?.map((bg: any) => (<option key={bg.id} value={bg.id}>{bg.name}</option>))}
                        </FormSelect>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5"><Label className="text-muted-foreground text-xs font-semibold">Quantity (Bricks)</Label><Input type="number" placeholder="e.g. 50000" value={obForm.quantity || ''} onChange={e => setObForm({ ...obForm, quantity: e.target.value })} required className="bg-muted/30 border-border" /></div>
                      <div className="space-y-1.5"><Label className="text-muted-foreground text-xs font-semibold">Unit Cost (₹ / brick)</Label><Input type="number" step="0.01" placeholder="e.g. 4.50" value={obForm.unit_cost || ''} onChange={e => setObForm({ ...obForm, unit_cost: e.target.value })} required className="bg-muted/30 border-border" /></div>
                    </div>
                  </>
                )}

                {obType === 'MATERIAL' && (
                  <>
                    <div className="space-y-1.5"><Label className="text-muted-foreground text-xs font-semibold">Material</Label>
                      <FormSelect value={obForm.material_id || ''} onChange={e => setObForm({ ...obForm, material_id: e.target.value })} required>
                        <option value="">-- Select Material --</option>
                        {materials.map(m => (<option key={m.id} value={m.id}>{m.name} ({m.unit})</option>))}
                      </FormSelect>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5"><Label className="text-muted-foreground text-xs font-semibold">Quantity</Label><Input type="number" step="0.1" placeholder="e.g. 25" value={obForm.quantity || ''} onChange={e => setObForm({ ...obForm, quantity: e.target.value })} required className="bg-muted/30 border-border" /></div>
                      <div className="space-y-1.5"><Label className="text-muted-foreground text-xs font-semibold">Est Unit Cost (₹)</Label><Input type="number" step="0.01" placeholder="e.g. 8500" value={obForm.unit_cost || ''} onChange={e => setObForm({ ...obForm, unit_cost: e.target.value })} required className="bg-muted/30 border-border" /></div>
                    </div>
                  </>
                )}

                {obType === 'CUSTOMER_RECEIVABLE' && (
                  <>
                    <div className="space-y-1.5"><Label className="text-muted-foreground text-xs font-semibold">Customer</Label>
                      <FormSelect value={obForm.customer_id || ''} onChange={e => setObForm({ ...obForm, customer_id: e.target.value })} required>
                        <option value="">-- Select Customer --</option>
                        {customers.map(c => (<option key={c.id} value={c.id}>{c.name} ({c.code})</option>))}
                      </FormSelect>
                    </div>
                    <div className="space-y-1.5"><Label className="text-muted-foreground text-xs font-semibold">Opening Debt / Balance Due (₹)</Label><Input type="number" step="0.01" placeholder="e.g. 45000.00" value={obForm.amount || ''} onChange={e => setObForm({ ...obForm, amount: e.target.value })} required className="bg-muted/30 border-border" /></div>
                  </>
                )}

                {obType === 'SUPPLIER_PAYABLE' && (
                  <>
                    <div className="space-y-1.5"><Label className="text-muted-foreground text-xs font-semibold">Supplier</Label>
                      <FormSelect value={obForm.supplier_id || ''} onChange={e => setObForm({ ...obForm, supplier_id: e.target.value })} required>
                        <option value="">-- Select Supplier --</option>
                        {suppliers.map(s => (<option key={s.id} value={s.id}>{s.name} ({s.code})</option>))}
                      </FormSelect>
                    </div>
                    <div className="space-y-1.5"><Label className="text-muted-foreground text-xs font-semibold">Opening Payable Due (₹)</Label><Input type="number" step="0.01" placeholder="e.g. 120000.00" value={obForm.amount || ''} onChange={e => setObForm({ ...obForm, amount: e.target.value })} required className="bg-muted/30 border-border" /></div>
                  </>
                )}

                <div className="pt-2 flex justify-end">
                  <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-bold h-10 px-5 shadow-md shadow-orange-500/20 border-0 cursor-pointer">
                    Commit Opening Balance
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="master">
          <Card className="bg-card border-border shadow-xs text-card-foreground p-5">
            <h3 className="text-sm font-bold text-foreground mb-3">System Lookup Tables</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="p-4 border border-border rounded-xl bg-muted/20">
                <strong className="text-xs font-bold text-foreground block mb-2">Brick Types</strong>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  {masterData?.brick_types?.map((bt: any) => (<li key={bt.id}>• {bt.name} ({bt.code})</li>))}
                </ul>
              </div>
              <div className="p-4 border border-border rounded-xl bg-muted/20">
                <strong className="text-xs font-bold text-foreground block mb-2">Brick Grades</strong>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  {masterData?.brick_grades?.map((bg: any) => (<li key={bg.id}>• {bg.name} ({bg.code})</li>))}
                </ul>
              </div>
              <div className="p-4 border border-border rounded-xl bg-muted/20">
                <strong className="text-xs font-bold text-foreground block mb-2">Payment Methods</strong>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  {masterData?.payment_methods?.map((pm: any) => (<li key={pm.id}>• {pm.name} ({pm.code})</li>))}
                </ul>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
