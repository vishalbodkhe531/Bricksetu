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
    !profile?.role || ["OWNER", "MANAGER", "ADMIN"].includes(roleUpper);

  const canManageProduction =
    !profile?.role || ["OWNER", "MANAGER", "ADMIN", "SUPERVISOR"].includes(roleUpper);

  const canManageInventory =
    !profile?.role || ["OWNER", "MANAGER", "ADMIN"].includes(roleUpper);

  const canManagePayments =
    !profile?.role || ["OWNER", "MANAGER", "ACCOUNTANT", "ADMIN"].includes(roleUpper);

  const canManageTransport =
    !profile?.role || ["OWNER", "MANAGER", "ADMIN"].includes(roleUpper);

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
