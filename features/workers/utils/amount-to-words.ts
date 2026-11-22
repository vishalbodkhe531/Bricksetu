/**
 * Utility to convert numeric amount to Marathi words for financial vouchers and receipts.
 * Example: 25000 -> "पंचवीस हजार रुपये फक्त"
 */

const MARATHI_UNITS = [
  "", "एक", "दोन", "तीन", "चार", "पाच", "सहा", "सात", "आठ", "नऊ", "दहा",
  "अकरा", "बारा", "तेरा", "चौदा", "पंधरा", "सोळा", "सतरा", "अठरा", "एकोणीस", "वीस",
  "एकवीस", "बावीस", "तेवीस", "चोवीस", "पंचवीस", "सव्वीस", "सत्तावीस", "अठ्ठावीस", "एकोणतीस", "तीस",
  "एकतीस", "बत्तीस", "तेहतीस", "चौतीस", "पस्तीस", "छत्तीस", "सदतीस", "अडतीस", "एकोणचाळीस", "चाळीस",
  "एक्केचाळीस", "बेचाळीस", "त्रेचाळीस", "चव्वेचाळीस", "पंचेचाळीस", "शेहेचाळीस", "सत्तेचाळीस", "अठ्ठेचाळीस", "एकोणपन्नास", "पन्नास",
  "एक्कावन्न", "बावन्न", "त्रेपन्न", "चोपन्न", "पंचावन्न", "छप्पन्न", "सत्तावन्न", "अठ्ठावन्न", "एकोणसाठ", "साठ",
  "एकसष्ठ", "बासष्ठ", "त्रेसष्ठ", "चौसष्ठ", "पासष्ठ", "सहासष्ठ", "सदुसष्ठ", "अडुसष्ठ", "एकोणसत्तर", "सत्तर",
  "एकाहत्तर", "बाहत्तर", "त्र्याहत्तर", "चौऱ्याहत्तर", "पंच्याहत्तर", "शहात्तर", "सत्त्याहत्तर", "अठ्ठ्याहत्तर", "एकोणऐंशी", "ऐंशी",
  "एक्क्यांशी", "ब्यांशी", "त्र्यांशी", "चौऱ्यांशी", "पंच्यांशी", "शहांशी", "सत्त्यांशी", "अठ्ठ्यांशी", "एकोणनव्वद", "नव्वद",
  "एक्याण्णव", "ब्याण्णव", "त्र्याण्णव", "चौऱ्याण्णव", "पंच्याण्णव", "शहाण्णव", "सत्त्याण्णव", "अठ्ठ्याण्णव", "नव्व्याण्णव",
];

function getTwoDigitsMarathi(n: number): string {
  if (n <= 0) return "";
  if (n < 100) return MARATHI_UNITS[n] || "";
  return "";
}

export function amountToMarathiWords(amount: number): string {
  const rounded = Math.round(Number(amount) || 0);
  if (rounded <= 0) return "शून्य रुपये फक्त";

  const crore = Math.floor(rounded / 10000000);
  let rem = rounded % 10000000;
  const lakh = Math.floor(rem / 100000);
  rem = rem % 100000;
  const thousand = Math.floor(rem / 1000);
  rem = rem % 1000;
  const hundred = Math.floor(rem / 100);
  const tens = rem % 100;

  const parts: string[] = [];

  if (crore > 0) {
    parts.push(`${getTwoDigitsMarathi(crore)} कोटी`);
  }
  if (lakh > 0) {
    parts.push(`${getTwoDigitsMarathi(lakh)} लाख`);
  }
  if (thousand > 0) {
    parts.push(`${getTwoDigitsMarathi(thousand)} हजार`);
  }
  if (hundred > 0) {
    parts.push(`${getTwoDigitsMarathi(hundred)} शे`);
  }
  if (tens > 0) {
    parts.push(getTwoDigitsMarathi(tens));
  }

  const result = parts.filter(Boolean).join(" ").trim();
  return result ? `${result} रुपये फक्त` : "शून्य रुपये फक्त";
}

