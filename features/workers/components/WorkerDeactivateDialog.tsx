'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UserX, AlertTriangle, X } from 'lucide-react';
import { toast } from 'sonner';

interface WorkerDeactivateDialogProps {
  open: boolean;
  onClose: () => void;
  workerId: string;
  workerName: string;
  advanceBalance?: number;
  onConfirmDeactivate: (workerId: string) => Promise<void>;
}

export function WorkerDeactivateDialog({
  open,
  onClose,
  workerId,
  workerName,
  advanceBalance = 0,
  onConfirmDeactivate,
}: WorkerDeactivateDialogProps) {
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleDeactivate = async () => {
    setSubmitting(true);
    try {
      await onConfirmDeactivate(workerId);
      toast.success(`Worker ${workerName} deactivated successfully.`);
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to deactivate worker');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2 text-destructive">
            <div className="p-2 rounded-lg bg-destructive/10">
              <UserX className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">Deactivate Worker</h3>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground rounded p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-foreground">
            Are you sure you want to deactivate <strong className="font-semibold">{workerName}</strong>?
          </p>

          {/* Outstanding Advance Warning */}
          {advanceBalance > 0 && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg space-y-1 text-xs text-amber-600 dark:text-amber-400">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>Outstanding Advance Warning</span>
              </div>
              <p>
                This worker currently has an unpaid advance balance of{' '}
                <strong className="font-mono font-bold">₹{Number(advanceBalance).toFixed(2)}</strong>.
              </p>
            </div>
          )}

          <div className="p-3 bg-muted/20 border border-border rounded-lg text-xs text-muted-foreground space-y-1">
            <span className="font-semibold text-foreground block">Audit Integrity Guaranteed</span>
            <p>
              Deactivating a worker sets their status to INACTIVE. All historical daily moulding logs, advance transactions, and weekly settlement records will be fully preserved in reporting.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDeactivate}
            disabled={submitting}
          >
            {submitting ? 'Deactivating...' : 'Confirm Deactivation'}
          </Button>
        </div>
      </div>
    </div>
  );
}
