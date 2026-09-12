import { formatDateDdMmYyyy, getMarathiDay } from "./date-utils";

/**
 * Returns the Friday YYYY-MM-DD date string that ends the Sat-Fri week for a given date string.
 */
export function getWeekEndFriday(dateStr: string): string {
  if (!dateStr) return "";
  const datePart = dateStr.split("T")[0];
  const parts = datePart.split("-").map(Number);
  if (parts.length !== 3) return datePart;

  const [yyyy, mm, dd] = parts;
  const d = new Date(yyyy, mm - 1, dd);
  const day = d.getDay(); // 0 = Sun, 1 = Mon, ..., 5 = Fri, 6 = Sat

  // Distance to Friday (5)
  const daysToFriday = (5 - day + 7) % 7;
  d.setDate(d.getDate() + daysToFriday);

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const date = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${date}`;
}

/**
 * Returns the Saturday YYYY-MM-DD date string that starts the Sat-Fri week for a given Friday date string.
 */
export function getWeekStartSaturday(fridayDateStr: string): string {
  if (!fridayDateStr) return "";
  const datePart = fridayDateStr.split("T")[0];
  const parts = datePart.split("-").map(Number);
  if (parts.length !== 3) return datePart;

  const [yyyy, mm, dd] = parts;
  const d = new Date(yyyy, mm - 1, dd);
  d.setDate(d.getDate() - 6);

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const date = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${date}`;
}

/**
 * Formats a week range label into Marathi / Bilingual string.
 * Example: "शनि 06/09/2026 – शुक्र 12/09/2026"
 */
export function formatWeekLabel(saturdayStr: string, fridayStr: string): string {
  const satFormatted = formatDateDdMmYyyy(saturdayStr);
  const friFormatted = formatDateDdMmYyyy(fridayStr);
  return `शनिवार (${satFormatted}) – शुक्रवार (${friFormatted})`;
}
