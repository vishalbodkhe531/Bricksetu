"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useCreateVehicle } from "@/features/transport/hooks/useTransport";

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  orgId: string;
}

export function AddVehicleModal({
  isOpen,
  onClose,
  orgId,
}: AddVehicleModalProps) {
  const createVehicle = useCreateVehicle(orgId);

  const [regNum, setRegNum] = useState("");
  const [driverName, setDriverName] = useState("");
  const [capacity, setCapacity] = useState("");

  if (!isOpen) return null;

  const handleCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    createVehicle.mutate(
      {
        registration_number: regNum,
        driver_name: driverName || null,
        capacity_details: capacity || null,
      },
      {
        onSuccess: () => {
          toast.success("Vehicle registered successfully");
          onClose();
          setRegNum("");
          setDriverName("");
          setCapacity("");
        },
        onError: (err: Error) => {
          toast.error(err.message || "Failed to register vehicle");
        },
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="text-base font-bold text-foreground">
            Register Fleet Vehicle
          </h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground rounded p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleCreateVehicle} className="space-y-3">
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
              Registration Number *
            </label>
            <Input
              value={regNum}
              onChange={(e) => setRegNum(e.target.value)}
              placeholder="e.g. MH-12-AB-1234"
              required
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
              Driver Name
            </label>
            <Input
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
              placeholder="Driver full name"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
              Capacity Details
            </label>
            <Input
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              placeholder="e.g. 5,000 Bricks / 10 Tons"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createVehicle.isPending}>
              {createVehicle.isPending ? "Saving..." : "Save Vehicle"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
