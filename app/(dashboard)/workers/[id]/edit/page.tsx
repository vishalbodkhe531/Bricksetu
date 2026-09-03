'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, UserCheck, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useWorkerDetail, useUpdateWorker } from '@/features/workers/hooks/useWorkers';
import { WorkerForm } from '@/features/workers/components/WorkerForm';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { WorkerUpdateInput } from '@/features/workers/types/worker.types';

interface EditWorkerPageProps {
  params: Promise<{ id: string }>;
}

export default function EditWorkerPage({ params }: EditWorkerPageProps) {
  const resolvedParams = use(params);
  const workerId = resolvedParams.id;
  const router = useRouter();
  const { profile } = useAuth();
  const orgId = profile?.organization_id ?? '';

  const { data: worker, isLoading: loading } = useWorkerDetail(workerId);
  const updateWorker = useUpdateWorker(orgId, workerId);

  const handleSubmit = async (data: any) => {
    try {
      await updateWorker.mutateAsync(data as WorkerUpdateInput);
      toast.success('Worker profile updated successfully');
      router.push(`/workers/${workerId}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update worker profile');
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <Clock className="h-4 w-4 animate-spin text-primary" /> Loading worker profile...
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
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <Link href={`/workers/${workerId}`}>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <ArrowLeft className="h-4 w-4" /> Back to Worker Details
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-2.5">
        <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
          <UserCheck className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Edit Worker Profile</h1>
          <p className="text-xs text-muted-foreground">{worker.full_name}</p>
        </div>
      </div>

      {/* Form Component */}
      <WorkerForm
        mode="edit"
        initialData={worker}
        onSubmit={handleSubmit}
        onCancel={() => router.push(`/workers/${workerId}`)}
        isSubmitting={updateWorker.isPending}
      />
    </div>
  );
}
