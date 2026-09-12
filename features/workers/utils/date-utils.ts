export const MARATHI_DAYS = [
  "रविवार",
  "सोमवार",
  "मंगळवार",
  "बुधवार",
  "गुरुवार",
  "शुक्रवार",
  "शनिवार",
];

export function getMarathiDay(dateStr: string): string {
  if (!dateStr) return "—";
  const parts = dateStr.split("T")[0].split("-");
  if (parts.length === 3) {
    const [yyyy, mm, dd] = parts.map(Number);
    const date = new Date(yyyy, mm - 1, dd);
    return MARATHI_DAYS[date.getDay()] || "—";
  }
  const date = new Date(dateStr);
  return MARATHI_DAYS[date.getDay()] || "—";
}

export function formatDateDdMmYyyy(dateStr: string): string {
  if (!dateStr) return "—";
  const parts = dateStr.split("T")[0].split("-");
  if (parts.length === 3) {
    const [yyyy, mm, dd] = parts;
    return `${dd}-${mm}-${yyyy}`;
  }
  const date = new Date(dateStr);
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}
