'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRecordDailyWork } from '../hooks/useWorkers';
import type { Worker } from '../types/worker.types';
import { Minus, Plus, Calendar, Coins, Package, Truck, FileText, CheckCircle2 } from 'lucide-react';
import { isRateEditableForCategory } from '../utils/rate-permissions';

interface RecordWorkModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgId: string;
  worker?: Worker | null;
  workers?: Worker[];
  defaultCategory?: string;
  batches?: { id: string; batch_number: string }[];
}

const CATEGORIES = [
  { id: 'AALYAWALE', label: 'आल्यावाले', sub: 'Moulder' },
  { id: 'KACHA_MAAL', label: 'कच्चा माल मजूर', sub: 'Raw Material' },
  { id: 'PAKKA_MAAL', label: 'पक्का माल मजूर', sub: 'Finished Goods' },
  { id: 'BHATKAR', label: 'भटकर', sub: 'Kiln Firing' },
];

export function RecordWorkModal({
  open,
  onOpenChange,
  orgId,
  worker,
  workers = [],
  defaultCategory,
  batches = [],
}: RecordWorkModalProps) {
  const recordMutation = useRecordDailyWork(orgId);

  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('');
  const [workDate, setWorkDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [category, setCategory] = useState<string>('AALYAWALE');
  const [entryMode, setEntryMode] = useState<string>('DIRECT_COUNT');
  const [inputQuantity, setInputQuantity] = useState<number | ''>('');
  const [ratePerUnit, setRatePerUnit] = useState<number | ''>('');
  const [batchId, setBatchId] = useState<string>('');
  const [referenceNo, setReferenceNo] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Selected worker object
  const activeWorker = useMemo(() => {
    if (worker) return worker;
    return workers.find((w) => w.id === selectedWorkerId) || null;
  }, [worker, workers, selectedWorkerId]);

  // Sync state when worker or defaultCategory changes
  useEffect(() => {
    if (worker) {
      setSelectedWorkerId(worker.id);
      const cat = worker.category || defaultCategory || 'AALYAWALE';
      setCategory(cat);
      if (cat === 'KACHA_MAAL') {
        setEntryMode('PINJRI_COUNT');
      } else if (cat === 'BHATKAR') {
        setEntryMode('SHIFT_COUNT');
      } else {
        setEntryMode('DIRECT_COUNT');
      }
      setRatePerUnit(worker.current_rate_amount || 0);
    } else if (defaultCategory) {
      setCategory(defaultCategory);
      if (defaultCategory === 'KACHA_MAAL') {
        setEntryMode('PINJRI_COUNT');
      } else if (defaultCategory === 'BHATKAR') {
        setEntryMode('SHIFT_COUNT');
      } else {
        setEntryMode('DIRECT_COUNT');
      }
    }
  }, [worker, defaultCategory, open]);

  // When selected worker changes from dropdown
  const handleWorkerSelect = (wId: string) => {
    setSelectedWorkerId(wId);
    const found = workers.find((w) => w.id === wId);
    if (found) {
      const cat = found.category || category;
      setCategory(cat);
      if (cat === 'KACHA_MAAL') {
        setEntryMode('PINJRI_COUNT');
      } else if (cat === 'BHATKAR') {
        setEntryMode('SHIFT_COUNT');
      } else {
        setEntryMode('DIRECT_COUNT');
      }
      setRatePerUnit(found.current_rate_amount || 0);
    }
  };

  // Category tab change
  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat);
    if (newCat === 'KACHA_MAAL') {
      setEntryMode('PINJRI_COUNT');
    } else if (newCat === 'BHATKAR') {
      setEntryMode('SHIFT_COUNT');
    } else {
      setEntryMode('DIRECT_COUNT');
    }
  };

  // Calculation metrics
  const numQty = typeof inputQuantity === 'number' ? inputQuantity : 0;
  const numRate = typeof ratePerUnit === 'number' ? ratePerUnit : 0;

  const physicalBricks = useMemo(() => {
    if (entryMode === 'PINJRI_COUNT') {
      return numQty * 22;
    }
    if (category === 'BHATKAR' || entryMode === 'SHIFT_COUNT') {
      return 0;
    }
    return numQty;
  }, [entryMode, numQty, category]);

  const billableBricks = useMemo(() => {
    if (entryMode === 'PINJRI_COUNT') {
      return numQty * 20;
    }
    if (category === 'BHATKAR' || entryMode === 'SHIFT_COUNT') {
      return 0;
    }
    return numQty;
  }, [entryMode, numQty, category]);

  const calculatedEarnings = useMemo(() => {
    if (entryMode === 'SHIFT_COUNT' || category === 'BHATKAR') {
      return numQty * numRate;
    }
    // Rate is per 1000 bricks
    return (billableBricks * numRate) / 1000;
  }, [entryMode, category, numQty, numRate, billableBricks]);

  // Stepper handlers
  const handleStep = (delta: number) => {
    const step = entryMode === 'SHIFT_COUNT' || entryMode === 'PINJRI_COUNT' ? delta : delta * 100;
    const current = typeof inputQuantity === 'number' ? inputQuantity : 0;
    const val = Math.max(0, current + step);
    setInputQuantity(val);
  };

  const handleQuickAdd = (amount: number) => {
    const current = typeof inputQuantity === 'number' ? inputQuantity : 0;
    setInputQuantity(current + amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const targetWorkerId = worker?.id || selectedWorkerId;
    if (!targetWorkerId) {
      setErrorMsg('Please select a worker');
      return;
    }

    if (numQty <= 0) {
      setErrorMsg('Please enter a valid quantity');
      return;
    }

    try {
      await recordMutation.mutateAsync({
        worker_id: targetWorkerId,
        work_date: workDate,
        category,
        entry_mode: entryMode,
        input_quantity: numQty,
        rate_per_unit: numRate,
        batch_id: batchId || null,
        reference_no: referenceNo || null,
        notes: notes || null,
      });

      // Reset form & close
      setInputQuantity('');
      setReferenceNo('');
      setNotes('');
      setErrorMsg('');
      onOpenChange(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save daily work entry');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full sm:max-w-lg bg-slate-900 border border-slate-800 text-white rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur z-10 rounded-t-2xl">
          <div>
            <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-400" />
              Daily Work Log / दैनंदिन काम नोंदवा
            </h2>
            {activeWorker && (
              <p className="text-xs text-slate-400 mt-0.5">
                Worker: <span className="text-amber-300 font-medium">{activeWorker.full_name}</span> ({activeWorker.code})
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 text-lg font-bold"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto flex-1 text-sm">
          {errorMsg && (
            <div className="p-3 bg-red-950/80 border border-red-800 text-red-300 rounded-xl text-xs">
              {errorMsg}
            </div>
          )}

          {/* Worker Selector if not pre-selected */}
          {!worker && (
            <div>
              <label className="block text-xs text-slate-400 font-medium mb-1">
                Select Worker / कामगार निवडा *
              </label>
              <select
                value={selectedWorkerId}
                onChange={(e) => handleWorkerSelect(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              >
                <option value="">-- Choose Worker --</option>
                {workers.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.full_name} ({w.code}) — {w.category || 'Worker'}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date Field */}
          <div>
            <label className="block text-xs text-slate-400 font-medium mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" /> Date / दिनांक
            </label>
            <input
              type="date"
              value={workDate}
              onChange={(e) => setWorkDate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          {/* Category Segmented Pills */}
          <div>
            <label className="block text-xs text-slate-400 font-medium mb-1.5">
              Worker Category / वर्ग निवडा
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`px-3 py-2 rounded-xl text-left border transition-all ${
                    category === cat.id
                      ? 'bg-amber-500/15 border-amber-500 text-amber-300 font-medium shadow-sm'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <div className="font-semibold text-xs text-slate-100">{cat.label}</div>
                  <div className="text-[10px] text-slate-400">{cat.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Entry Mode Selector (Special Pinjri rule for Kaccha Maal) */}
          {category === 'KACHA_MAAL' && (
            <div className="bg-slate-950/60 border border-amber-500/20 p-3 rounded-xl">
              <label className="block text-xs font-semibold text-amber-300 mb-2">
                Work Metric Mode / काम मोजणी पद्धत
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEntryMode('PINJRI_COUNT')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium border transition-all ${
                    entryMode === 'PINJRI_COUNT'
                      ? 'bg-amber-500 border-amber-400 text-slate-950 font-bold shadow'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Pinjri Count (पिंजरी)
                </button>
                <button
                  type="button"
                  onClick={() => setEntryMode('DIRECT_COUNT')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium border transition-all ${
                    entryMode === 'DIRECT_COUNT'
                      ? 'bg-amber-500 border-amber-400 text-slate-950 font-bold shadow'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Direct Bricks (नग)
                </button>
              </div>
              {entryMode === 'PINJRI_COUNT' && (
                <p className="text-[11px] text-amber-200/80 mt-2 bg-amber-950/40 p-2 rounded-lg border border-amber-800/30">
                  <span className="font-semibold text-amber-400">Pinjri Rule Active:</span> 1 Pinjri = 22 physical bricks, billed as <span className="underline font-bold text-amber-300">20 bricks</span> (2 bricks wastage allowance).
                </p>
              )}
            </div>
          )}

          {/* Main Input Stepper */}
          <div className="bg-slate-800/50 p-4 border border-slate-700/80 rounded-2xl space-y-3">
            <label className="block text-xs font-medium text-slate-300">
              {entryMode === 'PINJRI_COUNT'
                ? 'Number of Pinjris / पिंजरी संख्या'
                : entryMode === 'SHIFT_COUNT' || category === 'BHATKAR'
                ? 'Shifts Worked / दिवस (Shift)'
                : 'Bricks Moulded/Handled (नग)'}
            </label>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleStep(-1)}
                className="w-12 h-12 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 border border-slate-600 flex items-center justify-center text-xl text-slate-200 font-bold shrink-0 transition-colors shadow-sm"
              >
                <Minus className="w-5 h-5" />
              </button>

              <input
                type="number"
                inputMode="decimal"
                step={entryMode === 'PINJRI_COUNT' || entryMode === 'SHIFT_COUNT' ? '0.5' : '1'}
                value={inputQuantity}
                onChange={(e) => setInputQuantity(e.target.value === '' ? '' : parseFloat(e.target.value))}
                placeholder="0"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-center text-2xl font-bold text-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />

              <button
                type="button"
                onClick={() => handleStep(1)}
                className="w-12 h-12 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 border border-slate-600 flex items-center justify-center text-xl text-slate-200 font-bold shrink-0 transition-colors shadow-sm"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Add Buttons */}
            <div className="flex flex-wrap gap-2 pt-1">
              {entryMode === 'PINJRI_COUNT' ? (
                <>
                  <button type="button" onClick={() => handleQuickAdd(1)} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-300">
                    +1 Pinjri
                  </button>
                  <button type="button" onClick={() => handleQuickAdd(5)} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-300">
                    +5 Pinjris
                  </button>
                  <button type="button" onClick={() => handleQuickAdd(10)} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-300">
                    +10 Pinjris
                  </button>
                </>
              ) : entryMode === 'SHIFT_COUNT' || category === 'BHATKAR' ? (
                <>
                  <button type="button" onClick={() => handleQuickAdd(0.5)} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-300">
                    +0.5 Shift
                  </button>
                  <button type="button" onClick={() => handleQuickAdd(1)} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-300">
                    +1 Shift
                  </button>
                  <button type="button" onClick={() => handleQuickAdd(1.5)} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-300">
                    +1.5 Shift
                  </button>
                </>
              ) : (
                <>
                  <button type="button" onClick={() => handleQuickAdd(500)} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-300">
                    +500
                  </button>
                  <button type="button" onClick={() => handleQuickAdd(1000)} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-300">
                    +1,000
                  </button>
                  <button type="button" onClick={() => handleQuickAdd(2500)} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-300">
                    +2,500
                  </button>
                </>
              )}
            </div>

            {/* Live Calculation Display */}
            {entryMode === 'PINJRI_COUNT' && (
              <div className="bg-slate-900/90 border border-slate-700/60 p-3 rounded-xl space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Physical Bricks (22/Pinjri):</span>
                  <span className="font-mono text-slate-200 font-medium">{physicalBricks.toLocaleString()} bricks</span>
                </div>
                <div className="flex justify-between text-amber-300">
                  <span className="font-semibold">Billable Bricks (20/Pinjri):</span>
                  <span className="font-mono font-bold">{billableBricks.toLocaleString()} bricks</span>
                </div>
              </div>
            )}
          </div>

          {/* Rate Input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs text-slate-400 font-medium">
                Rate / दर ({category === 'BHATKAR' || entryMode === 'SHIFT_COUNT' ? '₹ / shift' : '₹ / 1,000 bricks'})
              </label>
              {isRateEditableForCategory(category) ? (
                <span className="text-[10px] text-amber-400 font-semibold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                  Editable Rate
                </span>
              ) : (
                <span className="text-[10px] text-slate-500 font-mono">
                  Fixed Rate
                </span>
              )}
            </div>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-semibold">₹</span>
              <input
                type="number"
                step="0.01"
                value={ratePerUnit}
                disabled={!isRateEditableForCategory(category)}
                onChange={(e) => setRatePerUnit(e.target.value === '' ? '' : parseFloat(e.target.value))}
                placeholder="Rate"
                className={`w-full bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-3 py-2.5 text-white font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/50 ${
                  !isRateEditableForCategory(category) ? 'opacity-60 cursor-not-allowed bg-slate-800/50' : ''
                }`}
              />
            </div>
          </div>

          {/* Live Earnings Summary Card */}
          <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/40 p-4 border border-amber-500/30 rounded-2xl flex items-center justify-between shadow-inner">
            <div>
              <div className="text-[11px] text-amber-300/80 font-medium uppercase tracking-wider">
                Total Calculated Earnings
              </div>
              <div className="text-2xl font-black text-amber-400 tracking-tight mt-0.5">
                ₹ {calculatedEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div className="text-right text-xs text-slate-400">
              {entryMode === 'PINJRI_COUNT' ? (
                <div>{numQty} Pinjris ({billableBricks} billed)</div>
              ) : entryMode === 'SHIFT_COUNT' ? (
                <div>{numQty} Shifts</div>
              ) : (
                <div>{numQty.toLocaleString()} Bricks</div>
              )}
            </div>
          </div>

          {/* Collapsible Additional Details */}
          <div>
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 py-1"
            >
              {showDetails ? '– Hide extra details' : '+ Add extra details (Batch, Reference No, Notes)'}
            </button>

            {showDetails && (
              <div className="space-y-3 pt-2 border-t border-slate-800 mt-2 animate-in slide-in-from-top-2 duration-200">
                {batches.length > 0 && (
                  <div>
                    <label className="block text-xs text-slate-400 mb-1 flex items-center gap-1">
                      <Package className="w-3.5 h-3.5 text-amber-400" /> Production Batch (Optional)
                    </label>
                    <select
                      value={batchId}
                      onChange={(e) => setBatchId(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                    >
                      <option value="">-- No Batch --</option>
                      {batches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.batch_number}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs text-slate-400 mb-1 flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-amber-400" /> Vehicle / Reference No. (e.g., Truck MH12-AB1234)
                  </label>
                  <input
                    type="text"
                    value={referenceNo}
                    onChange={(e) => setReferenceNo(e.target.value)}
                    placeholder="Ref or Truck No."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-amber-400" /> Notes / टिपण
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Additional comments..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sticky Bottom Save Action Bar */}
          <div className="pt-2 sticky bottom-0 bg-slate-900 border-t border-slate-800 pb-2">
            <button
              type="submit"
              disabled={recordMutation.isPending}
              className="w-full bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold py-3.5 rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 text-base"
            >
              {recordMutation.isPending ? (
                <span>Saving Log...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" /> Save Entry (नोंदवा)
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
