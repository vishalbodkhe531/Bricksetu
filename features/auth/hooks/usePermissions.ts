"use client";

import { useAuth } from "@/context/AuthContext";

export function usePermissions() {
  const { profile } = useAuth();
  const roleUpper = (profile?.role || "").toUpperCase();

  const canManageWorkers =
    !profile?.role || ["OWNER", "MANAGER", "ADMIN"].includes(roleUpper);

  const canManageSales =
    Boolean(profile?.role) &&
    ["OWNER", "MANAGER", "SALES_REP"].includes(roleUpper);

  const canManageMaterials =
    Boolean(profile?.role) && ["OWNER", "MANAGER"].includes(roleUpper);

  const canManageProduction =
    Boolean(profile?.role) && ["OWNER", "MANAGER"].includes(roleUpper);

  const canManageInventory =
    Boolean(profile?.role) && ["OWNER", "MANAGER"].includes(roleUpper);

  const canManagePayments =
    Boolean(profile?.role) &&
    ["OWNER", "MANAGER", "ACCOUNTANT"].includes(roleUpper);

  const canManageTransport =
    Boolean(profile?.role) && ["OWNER", "MANAGER"].includes(roleUpper);

  return {
    profile,
    roleUpper,
    canManageWorkers,
    canManageSales,
    canManageMaterials,
    canManageProduction,
    canManageInventory,
    canManagePayments,
    canManageTransport,
  };
}
