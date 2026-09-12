"use client";

import React from "react";
import {
  Banknote,
  FileText,
  HeartHandshake,
  History,
  MapPin,
  ShieldCheck,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { WorkerWithDetails } from "@/features/workers/types/worker.types";

interface WorkerProfileTabProps {
  worker: WorkerWithDetails;
  canWrite: boolean;
  onOpenRateDialog: () => void;
}

export function WorkerProfileTab({
  worker,
  canWrite,
  onOpenRateDialog,
}: WorkerProfileTabProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-b-lg border border-border bg-card p-4 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
          Worker Profile & Verification Details
        </h3>

        {/* 1. Personal & Contact Information */}
        <div className="space-y-2">
          <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <User className="h-3 w-3 text-primary" /> Personal & Contact
            Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5">
            <div className="space-y-0.5 p-2 bg-muted/20 rounded-md border border-border">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase block">
                Full Name
              </span>
              <p className="font-semibold text-foreground text-xs">
                {worker.full_name}
              </p>
            </div>
            <div className="space-y-0.5 p-2 bg-muted/20 rounded-md border border-border">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase block">
                Primary Phone
              </span>
              <p className="font-mono text-foreground text-xs">
                {worker.phone || "Not provided"}
              </p>
            </div>
            <div className="space-y-0.5 p-2 bg-muted/20 rounded-md border border-border">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase block">
                Alternate Phone
              </span>
              <p className="font-mono text-foreground text-xs">
                {worker.alternate_phone || "Not provided"}
              </p>
            </div>
            <div className="space-y-0.5 p-2 bg-muted/20 rounded-md border border-border">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase block">
                Date of Birth
              </span>
              <p className="font-mono text-foreground text-xs">
                {worker.dob ? worker.dob.split("T")[0] : "Not provided"}
              </p>
            </div>
            <div className="space-y-0.5 p-2 bg-muted/20 rounded-md border border-border">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase block">
                Gender
              </span>
              <p className="font-medium text-foreground text-xs capitalize">
                {worker.gender
                  ? worker.gender.toLowerCase()
                  : "Not specified"}
              </p>
            </div>
            <div className="space-y-0.5 p-2 bg-muted/20 rounded-md border border-border md:col-span-3">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
                <MapPin className="h-3 w-3" /> Residential Address
              </span>
              <p className="text-foreground text-xs">
                {worker.address || "No address recorded"}
              </p>
            </div>
          </div>
        </div>

        {/* 2. Identity Verification */}
        <div className="space-y-2 pt-3 border-t border-border">
          <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <FileText className="h-3 w-3 text-primary" /> Identity &
            Verification
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            <div className="space-y-0.5 p-2 bg-muted/20 rounded-md border border-border">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase block">
                ID Proof Document
              </span>
              <p className="font-medium text-foreground text-xs">
                {worker.id_proof_type || "Not provided"}
              </p>
            </div>
            <div className="space-y-0.5 p-2 bg-muted/20 rounded-md border border-border">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase block">
                ID Number / Card No.
              </span>
              <p className="font-mono text-foreground text-xs">
                {worker.id_proof_number || "Not provided"}
              </p>
            </div>
            <div className="space-y-0.5 p-2 bg-muted/20 rounded-md border border-border">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-emerald-500" />{" "}
                Verification Status
              </span>
              <p className="font-medium text-emerald-600 dark:text-emerald-400 text-xs">
                {worker.id_proof_number
                  ? "Verified Document"
                  : "Pending Document"}
              </p>
            </div>
          </div>
        </div>

        {/* 3. Emergency & Nominee Contact */}
        <div className="space-y-2 pt-3 border-t border-border">
          <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <HeartHandshake className="h-3 w-3 text-primary" /> Emergency &
            Nominee Contact
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            <div className="space-y-0.5 p-2 bg-muted/20 rounded-md border border-border">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase block">
                Nominee / Contact Person
              </span>
              <p className="font-semibold text-foreground text-xs">
                {worker.emergency_contact_name || "Not provided"}
              </p>
            </div>
            <div className="space-y-0.5 p-2 bg-muted/20 rounded-md border border-border">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase block">
                Relationship
              </span>
              <p className="font-medium text-foreground text-xs">
                {worker.emergency_relationship || "Not specified"}
              </p>
            </div>
            <div className="space-y-0.5 p-2 bg-muted/20 rounded-md border border-border">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase block">
                Contact Phone
              </span>
              <p className="font-mono text-foreground text-xs">
                {worker.emergency_contact_phone ? (
                  <a
                    href={`tel:${worker.emergency_contact_phone}`}
                    className="hover:text-primary hover:underline"
                  >
                    {worker.emergency_contact_phone}
                  </a>
                ) : (
                  "Not provided"
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pay Rate History */}
      <div className="rounded-lg border border-border bg-card p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <History className="h-3.5 w-3.5 text-primary" /> Pay Rate History
          </h3>
          {canWrite && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1 text-[11px]"
              onClick={onOpenRateDialog}
            >
              <Banknote className="h-3 w-3" /> Record Rate Change
            </Button>
          )}
        </div>

        {worker.worker_wage_rates && worker.worker_wage_rates.length > 0 ? (
          <div className="border border-border rounded-md overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/40 text-muted-foreground border-b border-border font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-2 px-3">Rate (₹)</th>
                  <th className="py-2 px-3">Effective From</th>
                  <th className="py-2 px-3">Type</th>
                  <th className="py-2 px-3">Recorded Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {worker.worker_wage_rates.map((rate, index) => (
                  <tr
                    key={rate.id}
                    className={index === 0 ? "bg-primary/5 font-semibold" : ""}
                  >
                    <td className="py-2 px-3 font-mono text-foreground font-bold">
                      ₹{rate.rate_amount.toFixed(2)}
                      {index === 0 && (
                        <Badge
                          variant="success"
                          className="ml-2 py-0 px-1 text-[9px]"
                        >
                          CURRENT
                        </Badge>
                      )}
                    </td>
                    <td className="py-2 px-3 font-mono">
                      {rate.effective_from}
                    </td>
                    <td className="py-2 px-3 capitalize">
                      {rate.rate_type.replace(/_/g, " ")}
                    </td>
                    <td className="py-2 px-3 text-muted-foreground font-mono">
                      {new Date(rate.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic">
            No wage rates recorded yet.
          </p>
        )}
      </div>
    </div>
  );
}
