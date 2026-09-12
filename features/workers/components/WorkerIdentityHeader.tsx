"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Banknote,
  Briefcase,
  Calendar,
  Coins,
  Edit,
  Phone,
  UserX,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatWorkerCategory } from "@/features/workers/constants/worker-options";
import type { Worker } from "@/features/workers/types/worker.types";

interface WorkerIdentityHeaderProps {
  worker: Worker;
  canWrite: boolean;
  activeTab: "profile" | "record_work" | "ledger";
  onSelectTab: (tab: "profile" | "record_work" | "ledger") => void;
  onOpenRateDialog: () => void;
  onOpenDeactivateDialog: () => void;
}

export function WorkerIdentityHeader({
  worker,
  canWrite,
  activeTab,
  onSelectTab,
  onOpenRateDialog,
  onOpenDeactivateDialog,
}: WorkerIdentityHeaderProps) {
  const userInitials = worker.full_name
    ? worker.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "WK";

  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-xs relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/workers">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-xs">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold shadow-xs overflow-hidden border border-border">
            {worker.photo_url ? (
              <img
                src={worker.photo_url}
                alt={worker.full_name}
                className="h-full w-full object-cover"
              />
            ) : (
              userInitials
            )}
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base font-bold tracking-tight text-foreground">
                {worker.full_name}
              </h1>
              <Badge
                variant={worker.status === "active" ? "success" : "secondary"}
                className="text-[10px] py-0 px-1.5"
              >
                {worker.status}
              </Badge>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1 font-medium">
                <Briefcase className="h-3 w-3 text-primary" />{" "}
                {formatWorkerCategory(worker.category)}
              </span>
              {worker.phone && (
                <a
                  href={`tel:${worker.phone}`}
                  className="flex items-center gap-1 font-mono hover:text-primary hover:underline transition-colors"
                >
                  <Phone className="h-3 w-3" /> {worker.phone}
                </a>
              )}
              <span className="flex items-center gap-1 font-mono">
                <Calendar className="h-3 w-3" /> Joined: {worker.joining_date}
              </span>
            </div>
          </div>
        </div>

        {canWrite && (
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <Button
              variant={activeTab === "record_work" ? "default" : "outline"}
              size="sm"
              onClick={() => onSelectTab("record_work")}
            >
              <Coins className="h-3.5 w-3.5" /> Record Daily Work
            </Button>

            <Link href={`/workers/${worker.id}/edit`}>
              <Button variant="outline" size="sm">
                <Edit className="h-3.5 w-3.5" /> Edit Profile
              </Button>
            </Link>

            <Button variant="default" size="sm" onClick={onOpenRateDialog}>
              <Banknote className="h-3.5 w-3.5" /> Change Rate
            </Button>

            {worker.status === "active" && (
              <Button
                variant="destructive"
                size="sm"
                onClick={onOpenDeactivateDialog}
              >
                <UserX className="h-3.5 w-3.5" /> Deactivate
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
