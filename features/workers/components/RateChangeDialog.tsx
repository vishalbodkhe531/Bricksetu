'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { rateChangeSchema, RateChangeInput } from '../types/worker.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Banknote, X, Calendar, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface RateChangeDialogProps {
  open: boolean;
  onClose: () => void;
  workerId: string;
  workerName: string;
  currentRate: number;
  onSuccess?: () => void;
  onSubmitRateChange: (data: RateChangeInput) => Promise<void>;
}

export function RateChangeDialog({
  open,
  onClose,
  workerId,
  workerName,
  currentRate,
  onSuccess,
  onSubmitRateChange,
}: RateChangeDialogProps) {
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RateChangeInput>({
    resolver: zodResolver(rateChangeSchema) as any,
    defaultValues: {
      worker_id: workerId,
      rate_amount: currentRate || undefined,
      rate_type: 'per_1000_bricks',
      effective_date: new Date().toISOString().split('T')[0],
    },
  });

  if (!open) return null;

  const handleFormSubmit = async (data: RateChangeInput) => {
    setSubmitting(true);
    try {
      await onSubmitRateChange(data);
      toast.success(`Pay rate for ${workerName} updated successfully.`);
      reset();
      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update pay rate');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Banknote className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Change Piece Rate</h3>
              <p className="text-xs text-muted-foreground">{workerName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground rounded p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Current Rate Reference Banner */}
        <div className="p-3 bg-muted/20 border border-border rounded-lg flex items-center justify-between text-xs">
          <span className="font-medium text-muted-foreground">Current Effective Rate:</span>
          <span className="font-bold font-mono text-foreground">₹{Number(currentRate).toFixed(2)} / 1K</span>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <input type="hidden" {...register('worker_id')} value={workerId} />

          {/* New Rate Amount */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              New Rate Amount (₹ per 1,000 Bricks) <span className="text-destructive">*</span>
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
              {...register('rate_amount')}
              placeholder="e.g. 480.00"
              className={errors.rate_amount ? 'border-destructive' : ''}
            />
            {errors.rate_amount && (
              <p className="text-[11px] text-destructive font-medium">{String(errors.rate_amount.message)}</p>
            )}
          </div>

          {/* Effective Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3 text-muted-foreground" /> Effective From Date <span className="text-destructive">*</span>
            </label>
            <Input
              type="date"
              {...register('effective_date')}
              className={errors.effective_date ? 'border-destructive' : ''}
            />
            {errors.effective_date && (
              <p className="text-[11px] text-destructive font-medium">{String(errors.effective_date.message)}</p>
            )}
          </div>

          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start gap-2 text-xs text-amber-600 dark:text-amber-400">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              This will record a new effective rate entry in history. Historical settlements prior to this date will preserve their original rate calculations.
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Updating Rate...' : 'Confirm Rate Change'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
