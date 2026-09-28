"use client";

import { use, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle, ArrowLeft, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePermissions } from "@/features/auth/hooks/usePermissions";
import { useMaterialDetail } from "@/features/materials/hooks/useMaterials";
import { MaterialIdentityHeader } from "@/features/materials/components/MaterialIdentityHeader";
import { MaterialDetailTabs, MaterialTabType } from "@/features/materials/components/MaterialDetailTabs";
import { MaterialOverviewTab } from "@/features/materials/components/MaterialOverviewTab";
import { MaterialPurchasesTab } from "@/features/materials/components/MaterialPurchasesTab";
import { MaterialConsumptionTab } from "@/features/materials/components/MaterialConsumptionTab";

interface MaterialDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function MaterialDetailPage({ params }: MaterialDetailPageProps) {
  const resolvedParams = use(params);
  const materialId = resolvedParams.id;
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab");

  const { canManageInventory: canWrite } = usePermissions();

  const { data: material, isLoading } = useMaterialDetail(materialId);

  const [activeTab, setActiveTab] = useState<MaterialTabType>(
    initialTab === "purchases"
      ? "purchases"
      : initialTab === "consumption"
        ? "consumption"
        : "overview"
  );

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "purchases" || tab === "consumption" || tab === "overview") {
      setActiveTab(tab);
    }
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <Clock className="h-4 w-4 animate-spin text-primary" /> Loading material details...
        </div>
      </div>
    );
  }

  if (!material) {
    return (
      <div className="space-y-3">
        <Link href="/materials">
          <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Materials List
          </Button>
        </Link>
        <div className="p-6 text-center border border-border rounded-lg bg-card shadow-xs">
          <AlertCircle className="h-7 w-7 text-destructive mx-auto mb-2" />
          <h2 className="text-sm font-bold text-foreground">
            Material Not Found
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            The requested material record does not exist or was removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Identity Header Card */}
      <MaterialIdentityHeader
        material={material}
        canWrite={canWrite}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {/* Navigation Tabs */}
      <MaterialDetailTabs
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        purchaseCount={material.total_purchases}
        consumptionCount={material.recent_consumption.length}
      />

      {/* Tab Content */}
      {activeTab === "overview" && (
        <MaterialOverviewTab material={material} />
      )}

      {activeTab === "purchases" && (
        <MaterialPurchasesTab
          materialId={material.id}
          unit={material.unit}
          initialPurchases={material.recent_purchases}
        />
      )}

      {activeTab === "consumption" && (
        <MaterialConsumptionTab
          materialId={material.id}
          unit={material.unit}
          initialConsumption={material.recent_consumption}
        />
      )}
    </div>
  );
}
