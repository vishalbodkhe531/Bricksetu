"use client";

import React from "react";
import { Settings as SettingsIcon, Users } from "lucide-react";
import { DataTable } from "@/components/ui/data-table/data-table";
import { usePermissions } from "@/features/auth/hooks/usePermissions";
import { userColumns } from "@/features/settings/components/columns/user-columns";
import { OrganizationCard } from "@/features/settings/components/OrganizationCard";
import { useSettings } from "@/features/settings/hooks/useSettings";

export default function SettingsPage() {
  const { profile } = usePermissions();
  const orgId = profile?.organization_id ?? "";

  const { data: settingsData } = useSettings(orgId);
  const organization = settingsData?.organization;
  const profiles = settingsData?.profiles ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <SettingsIcon className="h-6 w-6 text-primary" /> Organization
          Settings & Team
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          System configuration, organization info, role access permissions, and
          user profiles
        </p>
      </div>

      {/* Organization Details Card */}
      <OrganizationCard organization={organization} />

      {/* Team Profiles */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-foreground">
          <Users className="h-4 w-4 text-primary" /> Team Members & Roles (
          {profiles.length})
        </div>

        <DataTable
          columns={userColumns}
          data={profiles}
          searchPlaceholder="Search team members..."
          showExport={false}
        />
      </div>
    </div>
  );
}
