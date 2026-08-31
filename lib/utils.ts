import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { isRedirectError } from "next/dist/client/components/redirect-error"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type ActionResult<T = any> =
  | { success: true; data?: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export function safeParsePaise(value: unknown): number {
  if (value === null || value === undefined) return 0;
  const n = typeof value === "number" ? value : parseFloat(String(value));
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

export function safeBigInt(value: unknown): bigint {
  if (value === null || value === undefined) return 0n;
  // Postgres numeric SUM() returns strings like "1050000.00" — strip the decimal part first.
  const intPart = (typeof value === "number" ? value.toFixed(0) : String(value)).split(".")[0];
  try {
    return BigInt(intPart || "0");
  } catch {
    return 0n;
  }
}

export function formatPgError(err: any): string {
  if (!err) return 'An unexpected error occurred.';
  if (isRedirectError(err)) {
    throw err;
  }
  if (err.message && err.message.includes('UNAUTHENTICATED')) {
    return 'Authentication required. Please log in.';
  }
  const code = err.code;
  if (code === '23505') {
    return 'A record with this unique information already exists.';
  }
  if (code === '23503') {
    return 'Referenced record was not found or is currently in use.';
  }
  if (code === '23514') {
    return 'Value does not satisfy constraint requirements.';
  }
  if (code === '22P02') {
    return 'Invalid data format provided.';
  }
  return err.message || 'Database operation failed.';
}
