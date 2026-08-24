import { describe, it, expect } from 'vitest';
import { formatRupees, rupeesToPaise, getKolkataDateString } from '../shared/utils/formatters.js';

describe('Domain Utility & Formatting Rules', () => {
  it('correctly converts rupees to integer paise without floating point issues', () => {
    expect(rupeesToPaise(10.50)).toBe(1050n);
    expect(rupeesToPaise(0.25)).toBe(25n);
    expect(rupeesToPaise(450.00)).toBe(45000n);
  });

  it('correctly formats paise into INR currency representation', () => {
    const formatted = formatRupees(45000n);
    expect(formatted).toContain('450.00');
  });

  it('returns valid Asia/Kolkata date format YYYY-MM-DD', () => {
    const dateStr = getKolkataDateString(new Date('2026-08-24T12:00:00Z'));
    expect(dateStr).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
