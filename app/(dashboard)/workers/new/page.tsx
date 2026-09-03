"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { WorkerForm } from "@/features/workers/components/WorkerForm";
import { useCreateWorker } from "@/features/workers/hooks/useWorkers";
import type { WorkerInput } from "@/features/workers/types/worker.types";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function NewWorkerPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const orgId = profile?.organization_id ?? "";

  const createWorker = useCreateWorker(orgId);

  const handleSubmit = async (data: any) => {
    try {
      const result = await createWorker.mutateAsync(data as WorkerInput);
      toast.success(`Worker ${result.full_name} registered successfully`);
      router.push(`/workers/${result.id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to register worker");
    }
  };

  return (
    <div className="space-y-6 max-w-9xl mx-auto ">
      {/* Form Component */}
      <WorkerForm
        mode="create"
        onSubmit={handleSubmit}
        onCancel={() => router.push("/workers")}
        isSubmitting={createWorker.isPending}
      />
    </div>
  );
}
