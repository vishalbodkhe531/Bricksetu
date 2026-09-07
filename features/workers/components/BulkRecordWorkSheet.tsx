'use client';

import React, { useState, useMemo } from 'react';
import { useRecordBulkDailyWork } from '../hooks/useWorkers';
import type { Worker } from '../types/worker.types';
import {
  Calendar,
  Users,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Save,
  Plus,
  Minus,
  Layers,
} from 'lucide-react';

interface BulkRecordWorkSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgId: string;
  workers: Worker[];
}

const CATEGORIES = [
  { id: 'AALYAWALE', label: 'आल्यावाले', sub: 'Moulder' },
  { id: 'KACHA_MAAL', label: 'कच्चा माल मजूर', sub: 'Raw Material' },
  { id: 'PAKKA_MAAL', label: 'पक्का माल मजूर', sub: 'Finished Goods' },
  { id: 'BHATKAR', label: 'भटकर', sub: 'Kiln Firing' },
];

interface WorkerEntryRow {
  workerId: string;
  workerName: string;
  workerCode: string;
  entryMode: 'DIRECT_COUNT' | 'PINJRI_COUNT' | 'SHIFT_COUNT';
  quantity: number | '';
  rate: number;
}

export function BulkRecordWorkSheet({
  open,
  onOpenChange,
  orgId,
  workers,
}: BulkRecordWorkSheetProps) {
  const bulkMutation = useRecordBulkDailyWork(orgId);

  const [workDate, setWorkDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('AALYAWALE');
  const [activeWorkerIndex, setActiveWorkerIndex] = useState<number>(0);
  const [entriesMap, setEntriesMap] = useState<Record<string, WorkerEntryRow>>({});
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Filter workers matching selected category
  const filteredWorkers = useMemo(() => {
    const active = workers.filter((w) => w.status === 'active');
    return active.filter((w) => (w.category || 'AALYAWALE') === selectedCategory);
  }, [workers, selectedCategory]);

  // Default entry mode for category
  const defaultModeForCat = (cat: string) => {
    if (cat === 'KACHA_MAAL') return 'PINJRI_COUNT';
    if (cat === 'BHATKAR') return 'SHIFT_COUNT';
    return 'DIRECT_COUNT';
  };

  // Initialize entry rows when category or workers change
  const rows = useMemo(() => {
    return filteredWorkers.map((w) => {
      const existing = entriesMap[w.id];
      if (existing && existing.entryMode) {
        return existing;
      }
      return {
        workerId: w.id,
        workerName: w.full_name,
        workerCode: w.code || '',
        entryMode: defaultModeForCat(selectedCategory),
        quantity: existing?.quantity !== undefined ? existing.quantity : '',
        rate: w.current_rate_amount || 0,
      };
    });
  }, [filteredWorkers, selectedCategory, entriesMap]);

  const handleQuantityChange = (workerId: string, val: number | '') => {
    setEntriesMap((prev) => {
      const current = prev[workerId] || {
        workerId,
        workerName: workers.find((w) => w.id === workerId)?.full_name || '',
        workerCode: workers.find((w) => w.id === workerId)?.code || '',
        entryMode: defaultModeForCat(selectedCategory),
        quantity: '',
        rate: workers.find((w) => w.id === workerId)?.current_rate_amount || 0,
      };
      return {
        ...prev,
        [workerId]: { ...current, quantity: val },
      };
    });
  };

  const handleEntryModeChange = (
    workerId: string,
    mode: 'DIRECT_COUNT' | 'PINJRI_COUNT' | 'SHIFT_COUNT'
  ) => {
    setEntriesMap((prev) => {
      const current = prev[workerId] || {
        workerId,
        workerName: workers.find((w) => w.id === workerId)?.full_name || '',
        workerCode: workers.find((w) => w.id === workerId)?.code || '',
        entryMode: mode,
        quantity: '',
        rate: workers.find((w) => w.id === workerId)?.current_rate_amount || 0,
      };
      return {
        ...prev,
        [workerId]: { ...current, entryMode: mode },
      };
    });
  };

  const handleRateChange = (workerId: string, rateVal: number) => {
    setEntriesMap((prev) => {
      const current = prev[workerId] || {
        workerId,
        workerName: workers.find((w) => w.id === workerId)?.full_name || '',
        workerCode: workers.find((w) => w.id === workerId)?.code || '',
        entryMode: defaultModeForCat(selectedCategory),
        quantity: '',
        rate: rateVal,
      };
      return {
        ...prev,
        [workerId]: { ...current, rate: rateVal },
      };
    });
  };

  // Summary statistics
  const filledRows = useMemo(() => {
    return rows.filter((r) => typeof r.quantity === 'number' && r.quantity > 0);
  }, [rows]);

  const totalCalculatedEarnings = useMemo(() => {
    return filledRows.reduce((sum, r) => {
      const qty = typeof r.quantity === 'number' ? r.quantity : 0;
      let billable = qty;
      if (r.entryMode === 'PINJRI_COUNT') {
        billable = qty * 20;
      }
      let earnings = 0;
      if (r.entryMode === 'SHIFT_COUNT' || selectedCategory === 'BHATKAR') {
        earnings = qty * r.rate;
      } else {
        earnings = (billable * r.rate) / 1000;
      }
      return sum + earnings;
    }, 0);
  }, [filledRows, selectedCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (filledRows.length === 0) {
      setErrorMsg('Please enter work quantity for at least one worker');
      return;
    }

    try {
      await bulkMutation.mutateAsync({
        work_date: workDate,
        category: selectedCategory as any,
        entries: filledRows.map((r) => ({
          worker_id: r.workerId,
          entry_mode: r.entryMode,
          input_quantity: r.quantity as number,
          rate_per_unit: r.rate,
        })),
      });

      setEntriesMap({});
      setErrorMsg('');
      onOpenChange(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit bulk entries');
    }
  };

  if (!open) return null;

  const currentWorkerRow = rows[activeWorkerIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full h-full sm:h-auto sm:max-w-4xl bg-slate-900 border border-slate-800 text-white sm:rounded-2xl shadow-2xl flex flex-col max-h-screen sm:max-h-[92vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur z-20">
          <div>
            <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-400" />
              Bulk Daily Work Entry / एकत्र काम नोंदवा
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Enter output for all workers in a category at once
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 text-lg font-bold"
          >
            ✕
          </button>
        </div>

        {/* Filters Top Bar */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="text-slate-400 font-medium mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-amber-400" /> Select Date / दिनांक
            </label>
            <input
              type="date"
              value={workDate}
              onChange={(e) => setWorkDate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <div>
            <label className="text-slate-400 font-medium mb-1 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-amber-400" /> Select Category / वर्ग
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setActiveWorkerIndex(0);
                  }}
                  className={`py-1.5 px-2 rounded-lg text-center border text-xs transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-semibold'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Summary Bar */}
        <div className="bg-amber-950/40 border-b border-amber-800/30 px-4 py-2.5 flex items-center justify-between text-xs">
          <div className="text-amber-200">
            <span className="font-semibold text-amber-400">{filledRows.length}</span> of{' '}
            <span className="font-medium">{rows.length}</span> workers entered
          </div>
          <div className="text-right text-amber-300 font-bold font-mono">
            Total: ₹ {totalCalculatedEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>

        {errorMsg && (
          <div className="m-4 p-3 bg-red-950/80 border border-red-800 text-red-300 rounded-xl text-xs">
            {errorMsg}
          </div>
        )}

        {/* Content Body — Card per worker on mobile, Table on desktop */}
        <div className="flex-1 overflow-y-auto p-4">
          {rows.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No active workers found in category "{selectedCategory}".
            </div>
          ) : (
            <>
              {/* Mobile View: Swipeable / Stepper Cards */}
              <div className="md:hidden space-y-4">
                {currentWorkerRow && (
                  <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 space-y-4">
                    {/* Navigation Counter Header */}
                    <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
                      <div>
                        <span className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider">
                          Worker {activeWorkerIndex + 1} of {rows.length}
                        </span>
                        <h3 className="text-base font-bold text-slate-100">
                          {currentWorkerRow.workerName}
                        </h3>
                        <p className="text-xs text-slate-400">{currentWorkerRow.workerCode}</p>
                      </div>

                      <div className="flex gap-1">
                        <button
                          type="button"
                          disabled={activeWorkerIndex === 0}
                          onClick={() => setActiveWorkerIndex((i) => Math.max(0, i - 1))}
                          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 border border-slate-700"
                        >
                          <ChevronLeft className="w-5 h-5 text-slate-200" />
                        </button>
                        <button
                          type="button"
                          disabled={activeWorkerIndex === rows.length - 1}
                          onClick={() => setActiveWorkerIndex((i) => Math.min(rows.length - 1, i + 1))}
                          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 border border-slate-700"
                        >
                          <ChevronRight className="w-5 h-5 text-slate-200" />
                        </button>
                      </div>
                    </div>

                    {/* Entry Mode Toggle (Kaccha Maal Pinjri) */}
                    {selectedCategory === 'KACHA_MAAL' && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEntryModeChange(currentWorkerRow.workerId, 'PINJRI_COUNT')}
                          className={`flex-1 py-1.5 px-2 rounded-lg text-xs border ${
                            currentWorkerRow.entryMode === 'PINJRI_COUNT'
                              ? 'bg-amber-500 border-amber-400 text-slate-950 font-bold'
                              : 'bg-slate-800 border-slate-700 text-slate-300'
                          }`}
                        >
                          Pinjri (22/20 rule)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEntryModeChange(currentWorkerRow.workerId, 'DIRECT_COUNT')}
                          className={`flex-1 py-1.5 px-2 rounded-lg text-xs border ${
                            currentWorkerRow.entryMode === 'DIRECT_COUNT'
                              ? 'bg-amber-500 border-amber-400 text-slate-950 font-bold'
                              : 'bg-slate-800 border-slate-700 text-slate-300'
                          }`}
                        >
                          Direct Bricks
                        </button>
                      </div>
                    )}

                    {/* Stepper Input */}
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-slate-300">
                        {currentWorkerRow.entryMode === 'PINJRI_COUNT'
                          ? 'Number of Pinjris'
                          : currentWorkerRow.entryMode === 'SHIFT_COUNT'
                          ? 'Shifts Worked'
                          : 'Bricks Count'}
                      </label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            const cur = typeof currentWorkerRow.quantity === 'number' ? currentWorkerRow.quantity : 0;
                            const delta = currentWorkerRow.entryMode === 'PINJRI_COUNT' || currentWorkerRow.entryMode === 'SHIFT_COUNT' ? 1 : 100;
                            handleQuantityChange(currentWorkerRow.workerId, Math.max(0, cur - delta));
                          }}
                          className="w-12 h-12 bg-slate-800 border border-slate-600 rounded-xl flex items-center justify-center text-lg font-bold text-white"
                        >
                          <Minus className="w-5 h-5" />
                        </button>
                        <input
                          type="number"
                          inputMode="decimal"
                          value={currentWorkerRow.quantity}
                          onChange={(e) =>
                            handleQuantityChange(
                              currentWorkerRow.workerId,
                              e.target.value === '' ? '' : parseFloat(e.target.value)
                            )
                          }
                          placeholder="0"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 text-center text-xl font-bold text-amber-300"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const cur = typeof currentWorkerRow.quantity === 'number' ? currentWorkerRow.quantity : 0;
                            const delta = currentWorkerRow.entryMode === 'PINJRI_COUNT' || currentWorkerRow.entryMode === 'SHIFT_COUNT' ? 1 : 100;
                            handleQuantityChange(currentWorkerRow.workerId, cur + delta);
                          }}
                          className="w-12 h-12 bg-slate-800 border border-slate-600 rounded-xl flex items-center justify-center text-lg font-bold text-white"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Calculated row figure */}
                    {typeof currentWorkerRow.quantity === 'number' && currentWorkerRow.quantity > 0 && (
                      <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/50 flex justify-between items-center text-xs">
                        <div className="text-slate-400">
                          {currentWorkerRow.entryMode === 'PINJRI_COUNT' ? (
                            <span>
                              {currentWorkerRow.quantity * 22} physical /{' '}
                              <strong className="text-amber-300">{currentWorkerRow.quantity * 20} billable</strong>
                            </span>
                          ) : (
                            <span>Rate: ₹{currentWorkerRow.rate}</span>
                          )}
                        </div>
                        <div className="font-bold text-amber-400 font-mono text-sm">
                          ₹{' '}
                          {(
                            currentWorkerRow.entryMode === 'PINJRI_COUNT'
                              ? (currentWorkerRow.quantity * 20 * currentWorkerRow.rate) / 1000
                              : currentWorkerRow.entryMode === 'SHIFT_COUNT'
                              ? currentWorkerRow.quantity * currentWorkerRow.rate
                              : (currentWorkerRow.quantity * currentWorkerRow.rate) / 1000
                          ).toFixed(2)}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Desktop / Tablet View: Spreadsheet Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-950/60">
                      <th className="py-3 px-3">Worker Name</th>
                      <th className="py-3 px-3">Entry Mode</th>
                      <th className="py-3 px-3">Quantity</th>
                      <th className="py-3 px-3">Billable Output</th>
                      <th className="py-3 px-3">Rate</th>
                      <th className="py-3 px-3 text-right">Earnings</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {rows.map((r) => {
                      const qty = typeof r.quantity === 'number' ? r.quantity : 0;
                      let billable = qty;
                      if (r.entryMode === 'PINJRI_COUNT') {
                        billable = qty * 20;
                      }
                      let earnings = 0;
                      if (r.entryMode === 'SHIFT_COUNT' || selectedCategory === 'BHATKAR') {
                        earnings = qty * r.rate;
                      } else {
                        earnings = (billable * r.rate) / 1000;
                      }

                      return (
                        <tr key={r.workerId} className="hover:bg-slate-800/40">
                          <td className="py-3 px-3">
                            <div className="font-medium text-slate-200">{r.workerName}</div>
                            <div className="text-[10px] text-slate-400">{r.workerCode}</div>
                          </td>
                          <td className="py-3 px-3">
                            {selectedCategory === 'KACHA_MAAL' ? (
                              <select
                                value={r.entryMode}
                                onChange={(e) =>
                                  handleEntryModeChange(r.workerId, e.target.value as any)
                                }
                                className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white"
                              >
                                <option value="PINJRI_COUNT">Pinjri (22/20)</option>
                                <option value="DIRECT_COUNT">Direct Bricks</option>
                              </select>
                            ) : (
                              <span className="text-slate-400 font-mono">
                                {r.entryMode === 'SHIFT_COUNT' ? 'Shift' : 'Direct'}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            <input
                              type="number"
                              step={r.entryMode === 'PINJRI_COUNT' || r.entryMode === 'SHIFT_COUNT' ? '0.5' : '1'}
                              value={r.quantity}
                              onChange={(e) =>
                                handleQuantityChange(
                                  r.workerId,
                                  e.target.value === '' ? '' : parseFloat(e.target.value)
                                )
                              }
                              placeholder="0"
                              className="w-28 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-center font-bold text-amber-300 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                            />
                          </td>
                          <td className="py-3 px-3 text-slate-300">
                            {qty > 0 ? (
                              r.entryMode === 'PINJRI_COUNT' ? (
                                <div>
                                  <span className="font-bold text-amber-300">{billable}</span> bricks
                                  <div className="text-[10px] text-slate-500">({qty * 22} physical)</div>
                                </div>
                              ) : r.entryMode === 'SHIFT_COUNT' ? (
                                <span>{qty} shifts</span>
                              ) : (
                                <span>{qty} bricks</span>
                              )
                            ) : (
                              <span className="text-slate-600">–</span>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            <input
                              type="number"
                              step="0.01"
                              value={r.rate}
                              onChange={(e) =>
                                handleRateChange(r.workerId, parseFloat(e.target.value) || 0)
                              }
                              className="w-20 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200"
                            />
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-amber-400">
                            {qty > 0 ? `₹ ${earnings.toFixed(2)}` : '–'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Footer Action Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 sticky bottom-0 z-20 flex gap-3">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="px-4 py-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={bulkMutation.isPending || filledRows.length === 0}
            className="flex-1 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold py-3 rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50 text-xs transition-all"
          >
            {bulkMutation.isPending ? (
              <span>Saving Entries...</span>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save All {filledRows.length} Entries (एकत्र नोंदवा)
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
