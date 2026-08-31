'use client';

import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Plus, CheckCircle2, AlertCircle, Users, Shield } from 'lucide-react';
import {
  getMasterDataAction,
  createBrickTypeAction,
  createBrickGradeAction,
  createExpenseCategoryAction,
  createAdminUserAction,
  recordOpeningBalanceAction,
} from '@/features/settings/actions';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'ob' | 'master' | 'users'>('ob');
  const [masterData, setMasterData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Opening Balance form states
  const [obType, setObType] = useState<'STOCK' | 'MATERIAL' | 'CUSTOMER_RECEIVABLE' | 'SUPPLIER_PAYABLE'>('STOCK');
  const [obForm, setObForm] = useState<any>({});
  const [obSubmitting, setObSubmitting] = useState(false);

  // Lookup Form Modals / Expanders
  const [showTypeForm, setShowTypeForm] = useState(false);
  const [showGradeForm, setShowGradeForm] = useState(false);
  const [showCatForm, setShowCatForm] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const res = await getMasterDataAction();
    if (res.success) {
      setMasterData(res.data);
    } else {
      toast.error(res.error || 'Failed to load master data');
    }
    setLoading(false);
  }

  const handleOpeningBalanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setObSubmitting(true);
    try {
      let details: any = {};
      if (obType === 'STOCK') {
        details = {
          brick_type_id: obForm.brick_type_id,
          brick_grade_id: obForm.brick_grade_id,
          quantity: parseInt(obForm.quantity, 10),
          unit_cost_paise: Math.round(parseFloat(obForm.unit_cost) * 100),
        };
      } else if (obType === 'MATERIAL') {
        details = {
          material_id: obForm.material_id,
          quantity: parseFloat(obForm.quantity),
          unit_cost_paise: Math.round(parseFloat(obForm.unit_cost) * 100),
        };
      } else if (obType === 'CUSTOMER_RECEIVABLE') {
        details = {
          customer_id: obForm.customer_id,
          amount_paise: Math.round(parseFloat(obForm.amount) * 100),
        };
      } else if (obType === 'SUPPLIER_PAYABLE') {
        details = {
          supplier_id: obForm.supplier_id,
          amount_paise: Math.round(parseFloat(obForm.amount) * 100),
        };
      }

      const res = await recordOpeningBalanceAction(obType, details);
      if (res.success) {
        toast.success('Opening balance recorded successfully!');
        setObForm({});
      } else {
        toast.error(res.error || 'Failed to record opening balance');
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setObSubmitting(false);
    }
  };

  const handleAddBrickType = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const res = await createBrickTypeAction(formData);
    if (res.success) {
      toast.success('Brick type created');
      setShowTypeForm(false);
      loadData();
    } else {
      toast.error(res.error || 'Failed to create brick type');
    }
  };

  const handleAddBrickGrade = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const res = await createBrickGradeAction(formData);
    if (res.success) {
      toast.success('Brick grade created');
      setShowGradeForm(false);
      loadData();
    } else {
      toast.error(res.error || 'Failed to create brick grade');
    }
  };

  const handleAddExpenseCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const res = await createExpenseCategoryAction(formData);
    if (res.success) {
      toast.success('Expense category created');
      setShowCatForm(false);
      loadData();
    } else {
      toast.error(res.error || 'Failed to create expense category');
    }
  };

  const handleAddAdminUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const res = await createAdminUserAction(formData);
    if (res.success) {
      toast.success('Admin user created');
      setShowUserForm(false);
      loadData();
    } else {
      toast.error(res.error || 'Failed to create admin user');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <SettingsIcon className="h-6 w-6 text-primary" />
            Opening Balances & Settings
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            System initialization, stock & party balances, lookup categories, and admin users
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border gap-2">
        <button
          onClick={() => setActiveTab('ob')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'ob'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Opening Balance Wizard
        </button>
        <button
          onClick={() => setActiveTab('master')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'master'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Master Data Lookups
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'users'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Admin User Accounts
        </button>
      </div>

      {/* Tab 1: Opening Balance Wizard */}
      {activeTab === 'ob' && (
        <div className="max-w-2xl bg-card border border-border rounded-xl p-6 space-y-6 shadow-sm">
          <div>
            <h2 className="text-base font-bold text-foreground">Record Initial Opening Balances</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Initialize finished brick stock, material inventory, customer receivables, or supplier payables prior to system go-live.
            </p>
          </div>

          {/* Type selector buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { id: 'STOCK', label: 'Finished Brick Stock' },
              { id: 'MATERIAL', label: 'Raw Material Inventory' },
              { id: 'CUSTOMER_RECEIVABLE', label: 'Customer Receivable' },
              { id: 'SUPPLIER_PAYABLE', label: 'Supplier Payable Balance' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setObType(t.id as any);
                  setObForm({});
                }}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold border transition-all ${
                  obType === t.id
                    ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                    : 'bg-card text-foreground border-border hover:bg-accent'
                }`}
              >
                <span>{t.label}</span>
                {obType === t.id && <CheckCircle2 className="h-4 w-4" />}
              </button>
            ))}
          </div>

          <form onSubmit={handleOpeningBalanceSubmit} className="space-y-4 pt-4 border-t border-border">
            {obType === 'STOCK' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Brick Type</label>
                    <select
                      value={obForm.brick_type_id || ''}
                      onChange={(e) => setObForm({ ...obForm, brick_type_id: e.target.value })}
                      required
                      className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary"
                    >
                      <option value="">-- Select Type --</option>
                      {masterData?.brick_types?.map((bt: any) => (
                        <option key={bt.id} value={bt.id}>{bt.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Brick Grade</label>
                    <select
                      value={obForm.brick_grade_id || ''}
                      onChange={(e) => setObForm({ ...obForm, brick_grade_id: e.target.value })}
                      required
                      className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary"
                    >
                      <option value="">-- Select Grade --</option>
                      {masterData?.brick_grades?.map((bg: any) => (
                        <option key={bg.id} value={bg.id}>{bg.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Quantity (Bricks)</label>
                    <input
                      type="number"
                      placeholder="e.g. 50000"
                      value={obForm.quantity || ''}
                      onChange={(e) => setObForm({ ...obForm, quantity: e.target.value })}
                      required
                      className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Unit Cost (₹ / brick)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 4.50"
                      value={obForm.unit_cost || ''}
                      onChange={(e) => setObForm({ ...obForm, unit_cost: e.target.value })}
                      required
                      className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </>
            )}

            {obType === 'CUSTOMER_RECEIVABLE' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Opening Balance Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 45000.00"
                    value={obForm.amount || ''}
                    onChange={(e) => setObForm({ ...obForm, amount: e.target.value })}
                    required
                    className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={obSubmitting}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50"
              >
                {obSubmitting ? 'Saving...' : 'Commit Opening Balance'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Master Data Lookups */}
      {activeTab === 'master' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Brick Types */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground">Brick Types</h3>
                <button
                  onClick={() => setShowTypeForm(!showTypeForm)}
                  className="inline-flex items-center gap-1 rounded bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground hover:bg-secondary/80"
                >
                  <Plus className="h-3 w-3" /> Add
                </button>
              </div>

              {showTypeForm && (
                <form onSubmit={handleAddBrickType} className="space-y-3 p-3 bg-muted/30 rounded-lg border border-border">
                  <input name="code" placeholder="Code (e.g. STD)" required className="w-full rounded border border-border bg-card px-2.5 py-1.5 text-xs" />
                  <input name="name" placeholder="Name (e.g. Standard Red)" required className="w-full rounded border border-border bg-card px-2.5 py-1.5 text-xs" />
                  <input name="dimensions" placeholder="Dimensions (optional)" className="w-full rounded border border-border bg-card px-2.5 py-1.5 text-xs" />
                  <button type="submit" className="w-full bg-primary text-primary-foreground rounded py-1 text-xs font-bold">Save Type</button>
                </form>
              )}

              <ul className="divide-y divide-border text-xs">
                {masterData?.brick_types?.map((bt: any) => (
                  <li key={bt.id} className="py-2 flex justify-between">
                    <span className="font-medium text-foreground">{bt.name}</span>
                    <span className="text-muted-foreground font-mono">{bt.code}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Brick Grades */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground">Brick Grades</h3>
                <button
                  onClick={() => setShowGradeForm(!showGradeForm)}
                  className="inline-flex items-center gap-1 rounded bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground hover:bg-secondary/80"
                >
                  <Plus className="h-3 w-3" /> Add
                </button>
              </div>

              {showGradeForm && (
                <form onSubmit={handleAddBrickGrade} className="space-y-3 p-3 bg-muted/30 rounded-lg border border-border">
                  <input name="code" placeholder="Code (e.g. CLASS_1)" required className="w-full rounded border border-border bg-card px-2.5 py-1.5 text-xs" />
                  <input name="name" placeholder="Name (e.g. Class 1 First Quality)" required className="w-full rounded border border-border bg-card px-2.5 py-1.5 text-xs" />
                  <button type="submit" className="w-full bg-primary text-primary-foreground rounded py-1 text-xs font-bold">Save Grade</button>
                </form>
              )}

              <ul className="divide-y divide-border text-xs">
                {masterData?.brick_grades?.map((bg: any) => (
                  <li key={bg.id} className="py-2 flex justify-between">
                    <span className="font-medium text-foreground">{bg.name}</span>
                    <span className="text-muted-foreground font-mono">{bg.code}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Expense Categories */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground">Expense Categories</h3>
                <button
                  onClick={() => setShowCatForm(!showCatForm)}
                  className="inline-flex items-center gap-1 rounded bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground hover:bg-secondary/80"
                >
                  <Plus className="h-3 w-3" /> Add
                </button>
              </div>

              {showCatForm && (
                <form onSubmit={handleAddExpenseCategory} className="space-y-3 p-3 bg-muted/30 rounded-lg border border-border">
                  <input name="code" placeholder="Code (e.g. FUEL)" required className="w-full rounded border border-border bg-card px-2.5 py-1.5 text-xs" />
                  <input name="name" placeholder="Name (e.g. Fuel & Diesel)" required className="w-full rounded border border-border bg-card px-2.5 py-1.5 text-xs" />
                  <button type="submit" className="w-full bg-primary text-primary-foreground rounded py-1 text-xs font-bold">Save Category</button>
                </form>
              )}

              <ul className="divide-y divide-border text-xs">
                {masterData?.expense_categories?.map((ec: any) => (
                  <li key={ec.id} className="py-2 flex justify-between">
                    <span className="font-medium text-foreground">{ec.name}</span>
                    <span className="text-muted-foreground font-mono">{ec.code}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Admin Users */}
      {activeTab === 'users' && (
        <div className="space-y-4 max-w-4xl">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground">Registered Admin Users</h2>
            <button
              onClick={() => setShowUserForm(!showUserForm)}
              className="inline-flex items-center gap-1.5 rounded bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow hover:bg-primary/90"
            >
              <Plus className="h-3.5 w-3.5" /> Create Admin User
            </button>
          </div>

          {showUserForm && (
            <form onSubmit={handleAddAdminUser} className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">New Admin Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input name="username" placeholder="Username" required className="rounded border border-border bg-card px-3 py-2 text-xs" />
                <input name="full_name" placeholder="Full Name" required className="rounded border border-border bg-card px-3 py-2 text-xs" />
                <input name="email" type="email" placeholder="Email Address" required className="rounded border border-border bg-card px-3 py-2 text-xs" />
                <input name="password" type="password" placeholder="Password" required className="rounded border border-border bg-card px-3 py-2 text-xs" />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowUserForm(false)} className="px-3 py-1.5 text-xs border rounded">Cancel</button>
                <button type="submit" className="px-4 py-1.5 text-xs font-bold bg-primary text-primary-foreground rounded">Create Admin</button>
              </div>
            </form>
          )}

          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/40 font-semibold uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Full Name</th>
                  <th className="px-4 py-3">Username</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {masterData?.users?.map((u: any) => (
                  <tr key={u.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3 font-semibold text-foreground">{u.full_name}</td>
                    <td className="px-4 py-3 text-muted-foreground font-mono">{u.username}</td>
                    <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                    <td className="px-4 py-3"><span className="rounded bg-primary/10 text-primary px-1.5 py-0.5 font-bold">{u.role}</span></td>
                    <td className="px-4 py-3"><span className="text-emerald-600 dark:text-emerald-400 font-medium">Active</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
