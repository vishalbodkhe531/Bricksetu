"use client";

import React, { useRef } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { formatDateDdMmYyyy } from "@/lib/utils";

interface DatePickerProps {
  value: string; // Expected format: YYYY-MM-DD
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "DD-MM-YYYY",
  required = false,
  disabled = false,
  className = "",
}: DatePickerProps) {
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  // Formatted display value: e.g. "13-09-2026"
  const displayValue = value ? formatDateDdMmYyyy(value) : "";

  const handleContainerClick = () => {
    if (disabled || !hiddenInputRef.current) return;
    const input = hiddenInputRef.current;
    try {
      if ('showPicker' in input && typeof (input as any).showPicker === 'function') {
        (input as any).showPicker();
      } else {
        input.focus();
        input.click();
      }
    } catch {
      input.focus();
    }
  };

  return (
    <div className={`relative inline-block w-full ${className}`}>
      {/* Visible Formatted Input (DD-MM-YYYY) */}
      <div
        onClick={handleContainerClick}
        className={`flex h-9 w-full items-center justify-between rounded-md border border-border bg-card px-3 py-1 text-xs text-foreground shadow-xs transition-colors cursor-pointer hover:border-primary/50 focus-within:ring-1 focus-within:ring-primary ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        <span className={`font-mono font-semibold ${displayValue ? "text-foreground" : "text-muted-foreground"}`}>
          {displayValue || placeholder}
        </span>
        <CalendarIcon className="h-4 w-4 text-muted-foreground shrink-0 ml-2" />
      </div>

      {/* Hidden Native Date Input for Browser Calendar Picker */}
      <input
        ref={hiddenInputRef}
        type="date"
        value={value || ""}
        required={required}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="sr-only absolute inset-0 opacity-0 pointer-events-none w-full h-full"
        tabIndex={-1}
      />
    </div>
  );
}
