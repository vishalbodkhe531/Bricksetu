"use client";

import React from "react";
import { Input } from "@/components/ui/input";

interface FormattedNumberInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  value: string | number;
  onChange: (value: string) => void;
  allowDecimal?: boolean;
}

export function formatIndianNumber(val: string | number, allowDecimal = false): string {
  if (val === undefined || val === null || val === "") return "";
  const str = String(val).replace(/,/g, "");

  if (allowDecimal) {
    const parts = str.split(".");
    const integerPart = parts[0];
    const decimalPart = parts[1];

    if (isNaN(Number(integerPart)) && integerPart !== "" && integerPart !== "-") {
      return str;
    }

    const formattedInt = integerPart
      ? Number(integerPart).toLocaleString("en-IN")
      : integerPart;

    return decimalPart !== undefined ? `${formattedInt}.${decimalPart}` : formattedInt;
  }

  const cleanInt = str.replace(/[^0-9-]/g, "");
  if (!cleanInt || isNaN(Number(cleanInt))) return cleanInt;
  return Number(cleanInt).toLocaleString("en-IN");
}

export function FormattedNumberInput({
  value,
  onChange,
  allowDecimal = false,
  className = "",
  placeholder,
  ...props
}: FormattedNumberInputProps) {
  const displayValue = formatIndianNumber(value, allowDecimal);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/,/g, "");
    if (allowDecimal) {
      // Allow single decimal point and numbers
      if (/^-?\d*\.?\d*$/.test(rawVal) || rawVal === "") {
        onChange(rawVal);
      }
    } else {
      // Allow only digits and negative sign
      if (/^-?\d*$/.test(rawVal) || rawVal === "") {
        onChange(rawVal);
      }
    }
  };

  return (
    <Input
      {...props}
      type="text"
      inputMode={allowDecimal ? "decimal" : "numeric"}
      value={displayValue}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
    />
  );
}
