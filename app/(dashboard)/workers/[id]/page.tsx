'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Phone,
  Calendar,
  Briefcase,
  Edit,
  TrendingUp,
  Clock,
  AlertCircle,
  X,
} from 'lucide-react';
import { useWorkerDetail, useUpdateWorker } from '@/features/workers/hooks/useWorkers';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTable, Column } from '@/components/ui/data-table/data-table';
import { toast } from 'sonner';

interface WorkerDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function WorkerDetailPage({ params }: WorkerDetailPageProps) {
  const resolvedParams = use(params);
  const workerId = resolvedParams.id;
  const { profile } = useAuth();
  const orgId = profile?.organization_id ?? '';

  const { data: worker, isLoading: loading } = useWorkerDetail(workerId);
  const updateWorker = useUpdateWorker(orgId, workerId);

  const [activeTab, setActiveTab] = useState<'overview' | 'rate_history' | 'payments' | 'production' | 'settlements'>('overview');

  // Modals
  const [showEditModal, setShowEditModal] = useState(false);

  // Edit Form State
  const [fullName, setFullName] = useState(worker?.full_name || '');
  const [phone, setPhone] = useState(worker?.phone || '');
  const [address, setAddress] = useState(worker?.address || '');

  const handleUpdateWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    updateWorker.mutate(
      {
        full_name: fullName,
        phone: phone || null,
        address: address || null,
      },
      {
        onSuccess: () => {
          toast.success('Worker details updated successfully');
          setShowEditModal(false);
        },
        onError: (err: Error) => {
          toast.error(err.message || 'Failed to update worker details');
        },
      }
    );
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <Clock className="h-4 w-4 animate-spin text-primary" /> Loading worker record...
        </div>
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="space-y-4">
        <Link href="/workers">
          <Button variant="outline" size="sm" className="gap-1.5">
            <ArrowLeft className="h-4 w-4" /> Back to Roster
          </Button>
        </Link>
        <div className="p-8 text-center border border-border rounded-xl bg-card">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
          <h2 className="text-base font-bold text-foreground">Worker Not Found</h2>
          <p className="text-xs text-muted-foreground mt-1">The requested worker record does not exist or was removed.</p>
        </div>
      </div>
    );
  }

  const userInitials = worker.full_name
    ? worker.full_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
    : 'WK';

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div>
        <Link href="/workers">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <ArrowLeft className="h-4 w-4" /> Back to Worker Roster
          </Button>
        </Link>
      </div>

      {/* Header / Identity Card */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-bold shadow-xs">
              {userInitials}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold tracking-tight text-foreground">{worker.full_name}</h1>
                <Badge variant={worker.status === 'active' ? 'success' : 'secondary'}>
                  {worker.status}
                </Badge>
              </div>

              <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1 font-medium">
                  <Briefcase className="h-3.5 w-3.5 text-primary" /> {worker.category ?? 'Piece Rate Moulder'}
                </span>
                {worker.phone && (
                  <a
                    href={`tel:${worker.phone}`}
                    className="flex items-center gap-1 font-mono hover:text-primary hover:underline transition-colors"
                  >
                    <Phone className="h-3.5 w-3.5" /> {worker.phone}
                  </a>
                )}
                <span className="flex items-center gap-1 font-mono">
                  <Calendar className="h-3.5 w-3.5" /> Created: {new Date(worker.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                setFullName(worker.full_name);
                setPhone(worker.phone || '');
                setAddress(worker.address || '');
                setShowEditModal(true);
              }}
              className="gap-1 text-xs"
            >
              <Edit className="h-3.5 w-3.5" /> Edit Profile
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Current Rate</span>
          <span className="text-base font-bold font-mono text-foreground mt-1 block tabular-nums">
            ₹{Number(worker.current_rate?.rate_amount || 0).toFixed(2)}
          </span>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Status</span>
          <span className="text-base font-bold capitalize text-primary mt-1 block">
            {worker.status}
          </span>
        </div>
      </div>

      {/* Overview Panel */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Profile Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1 p-3 bg-muted/20 rounded-lg border border-border">
            <span className="text-[11px] font-bold text-muted-foreground uppercase">Full Name</span>
            <p className="font-semibold text-foreground text-sm">{worker.full_name}</p>
          </div>
          <div className="space-y-1 p-3 bg-muted/20 rounded-lg border border-border">
            <span className="text-[11px] font-bold text-muted-foreground uppercase">Phone Number</span>
            <p className="font-mono text-foreground text-sm">{worker.phone || 'Not provided'}</p>
          </div>
          <div className="space-y-1 p-3 bg-muted/20 rounded-lg border border-border">
            <span className="text-[11px] font-bold text-muted-foreground uppercase">Category</span>
            <p className="font-medium text-foreground text-sm">{worker.category ?? 'General Worker'}</p>
          </div>
          <div className="space-y-1 p-3 bg-muted/20 rounded-lg border border-border">
            <span className="text-[11px] font-bold text-muted-foreground uppercase">Piece Rate (₹ / 1,000)</span>
            <p className="font-mono font-bold text-foreground text-sm">
              ₹{Number(worker.current_rate?.rate_amount || 0).toFixed(2)}
            </p>
          </div>
          <div className="space-y-1 p-3 bg-muted/20 rounded-lg border border-border md:col-span-2">
            <span className="text-[11px] font-bold text-muted-foreground uppercase">Address</span>
            <p className="text-foreground text-sm">{worker.address || 'No address recorded'}</p>
          </div>
        </div>
      </div>

      {/* Modal: Edit Worker */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 space-y-4 shadow-md">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">Edit Worker Profile</h3>
              <button onClick={() => setShowEditModal(false)} className="text-muted-foreground hover:text-foreground rounded p-1">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateWorker} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Full Name</label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Phone Number</label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Address</label>
                <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Residential address" />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateWorker.isPending}>
                  {updateWorker.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
