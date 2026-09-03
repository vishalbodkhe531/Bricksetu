'use client';

import React from 'react';
import { Settings as SettingsIcon, Users, Shield, Building } from 'lucide-react';
import { useSettings } from '@/features/settings/hooks/useSettings';
import { useAuth } from '@/context/AuthContext';
import { DataTable, Column } from '@/components/ui/data-table/data-table';
import { Badge } from '@/components/ui/badge';
import type { UserProfile } from '@/features/settings/types/settings.types';

export default function SettingsPage() {
  const { profile } = useAuth();
  const orgId = profile?.organization_id ?? '';

  const { data: settingsData, isLoading } = useSettings(orgId);
  const organization = settingsData?.organization;
  const profiles = settingsData?.profiles ?? [];

  const columns: Column<UserProfile>[] = [
    {
      accessorKey: 'full_name',
      header: 'Full Name',
      cell: ({ row }) => (
        <div className="font-semibold text-foreground">{row.original.full_name}</div>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Email Address',
      cell: ({ row }) => (
        <span className="text-muted-foreground font-mono text-[11px]">{row.original.email}</span>
      ),
    },
    {
      accessorKey: 'role',
      header: 'Role',
      align: 'center',
      cell: ({ row }) => (
        <Badge
          variant={
            row.original.role === 'owner'
              ? 'default'
              : row.original.role === 'manager'
              ? 'secondary'
              : 'outline'
          }
          className="uppercase font-mono text-[10px]"
        >
          {row.original.role}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <SettingsIcon className="h-6 w-6 text-primary" /> Organization Settings & Team
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          System configuration, organization info, role access permissions, and user profiles
        </p>
      </div>

      {/* Organization Details Card */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-3 shadow-xs">
        <div className="flex items-center gap-2 text-sm font-bold text-foreground">
          <Building className="h-4 w-4 text-primary" /> Organization Information
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-muted-foreground block text-[11px]">Organization Name</span>
            <span className="font-semibold text-foreground text-sm">{organization?.name ?? 'BrickSetu Unit'}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[11px]">Organization Slug</span>
            <span className="font-mono text-muted-foreground text-sm">{organization?.slug ?? '—'}</span>
          </div>
        </div>
      </div>

      {/* Team Profiles */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-foreground">
          <Users className="h-4 w-4 text-primary" /> Team Members & Roles ({profiles.length})
        </div>

        <DataTable
          columns={columns}
          data={profiles}
          searchPlaceholder="Search team members..."
          showExport={false}
        />
      </div>
    </div>
  );
}
