export function formatINR(paise: number | string | null | undefined): string {
  if (paise === null || paise === undefined) return '₹0.00';
  const num = typeof paise === 'string' ? parseFloat(paise) : paise;
  const rupees = num / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(rupees);
}

export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '-';
  const [year, month, day] = dateString.split('T')[0].split('-');
  return `${day}/${month}/${year}`;
}
