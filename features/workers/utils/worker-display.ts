export function getInitials(name: string): string {
  if (!name) return "WK";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}
