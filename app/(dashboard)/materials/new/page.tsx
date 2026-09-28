"use client";

import { useAuth } from "@/context/AuthContext";
import { MaterialForm } from "@/features/materials/components/MaterialForm";
import {
  useCreateRawMaterial,
  useSuppliersList,
} from "@/features/materials/hooks/useMaterials";
import type { MaterialCreateInput } from "@/features/materials/types/materials.types";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function NewMaterialPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const orgId = profile?.organization_id ?? "";

  const createMaterial = useCreateRawMaterial(orgId);
  const { data: suppliers = [] } = useSuppliersList(orgId);

  const handleSubmit = async (data: any) => {
    try {
      const result = await createMaterial.mutateAsync(data as MaterialCreateInput);
      toast.success(`Material "${result.name}" registered successfully`);
      router.push(`/materials/${result.id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to register material");
    }
  };

  return (
    <div className="space-y-6 max-w-9xl mx-auto">
      <MaterialForm
        mode="create"
        suppliers={suppliers}
        onSubmit={handleSubmit}
        onCancel={() => router.push("/materials")}
        isSubmitting={createMaterial.isPending}
      />
    </div>
  );
}
