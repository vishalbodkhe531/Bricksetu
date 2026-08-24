export function formatRupees(paise: bigint | number): string {
  const numPaise = typeof paise === 'bigint' ? Number(paise) : paise;
  const rupees = numPaise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(rupees);
}

export function rupeesToPaise(rupees: number): bigint {
  return BigInt(Math.round(rupees * 100));
}

export function getKolkataDateString(date: Date = new Date()): string {
  // Return YYYY-MM-DD formatted for Asia/Kolkata timezone
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}
