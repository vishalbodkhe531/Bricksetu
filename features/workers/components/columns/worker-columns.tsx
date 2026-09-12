"use client";

import { ActionMenu, type ActionMenuItem } from "@/components/ui/action-menu";
import { Badge } from "@/components/ui/badge";
import { Column } from "@/components/ui/data-table/data-table";
import { formatWorkerCategory } from "@/features/workers/constants/worker-options";
import type { Worker } from "@/features/workers/types/worker.types";
import { getInitials } from "@/features/workers/utils/worker-display";
import { Coins, Edit, Eye, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface WorkerColumnCallbacks {
  onDeactivate: (worker: Worker) => void;
  onGiveAdvance?: (worker: Worker) => void;
}

export function getWorkerColumns(
  canWrite: boolean,
  callbacks: WorkerColumnCallbacks,
): Column<Worker>[] {
  return [
    {
      accessorKey: "full_name",
      header: "Worker",
      cell: ({ row }) => {
        const isInactive = row.original.status === "inactive";
        const initials = getInitials(row.original.full_name || "Worker");

        return (
          <div className="flex items-center gap-3">
            {row.original.photo_url ? (
              <Image
                src={row.original.photo_url}
                alt={row.original.full_name || "Worker"}
                width={36}
                height={36}
                className="h-9 w-9 rounded-full object-cover border border-border shrink-0"
              />
            ) : (
              <div className="h-9 w-9 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-xs shrink-0 select-none">
                {initials}
              </div>
            )}

            <div className="min-w-0">
              <Link
                href={`/workers/${row.original.id}`}
                className={`font-semibold hover:underline flex items-center gap-1.5 truncate ${
                  isInactive
                    ? "text-muted-foreground line-through"
                    : "text-foreground hover:text-primary"
                }`}
              >
                <span className="truncate">{row.original.full_name}</span>
              </Link>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "category",
      header: "Role",
      cell: ({ row }) => (
        <span className="text-xs font-medium text-muted-foreground">
          {formatWorkerCategory(row.original.category)}
        </span>
      ),
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => (
        <span className="font-mono text-xs">{row.original.phone || "—"}</span>
      ),
    },
    {
      accessorKey: "current_rate_amount",
      header: "Current Rate",
      cell: ({ row }) => {
        const rate = row.original.current_rate_amount;
        const cat = row.original.category;
        const unit =
          cat === "DAILY_WAGE"
            ? "/ day"
            : cat === "MONTHLY_SALARY"
              ? "/ mo"
              : "/ 1K";

        return (
          <span className="font-mono font-semibold text-foreground text-xs">
            {rate !== undefined && rate !== null
              ? `₹${rate.toFixed(2)} ${unit}`
              : "—"}
          </span>
        );
      },
    },
    {
      accessorKey: "advance_balance",
      header: "Advance Balance",
      align: "right",
      cell: ({ row }) => {
        const adv = row.original.advance_balance || 0;
        return (
          <span
            className={`font-mono text-xs ${
              adv > 0
                ? "font-bold text-amber-600 dark:text-amber-400"
                : "text-muted-foreground"
            }`}
          >
            ₹{adv.toFixed(2)}
          </span>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      align: "center",
      cell: ({ row }) => (
        <Badge
          variant={row.original.status === "active" ? "success" : "secondary"}
        >
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      align: "center",
      cell: ({ row }) => {
        const items: ActionMenuItem[] = [
          {
            label: "View Profile",
            icon: <Eye className="h-3.5 w-3.5 text-muted-foreground" />,
            href: `/workers/${row.original.id}`,
          },
        ];

        if (canWrite) {
          const isNoDailyWorkRole =
            row.original.category === "BHATKAR" ||
            row.original.category === "AALYAWALE";

          if (!isNoDailyWorkRole) {
            items.push({
              label: "Record Daily Work",
              icon: <Coins className="h-3.5 w-3.5 text-amber-500" />,
              href: `/workers/${row.original.id}?tab=record_work`,
            });
          }
          items.push({
            label: "Edit Profile",
            icon: <Edit className="h-3.5 w-3.5 text-muted-foreground" />,
            href: `/workers/${row.original.id}/edit`,
          });
          items.push({
            label: "Delete",
            icon: <Trash2 className="h-3.5 w-3.5 text-destructive" />,
            onClick: () => callbacks.onDeactivate(row.original),
            variant: "destructive",
          });
        }

        return (
          <div className="flex justify-center">
            <ActionMenu items={items} />
          </div>
        );
      },
    },
  ];
}
