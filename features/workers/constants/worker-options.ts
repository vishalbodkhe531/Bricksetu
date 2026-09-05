export const CATEGORY_OPTIONS = [
  { value: "AALYAWALE", label: "आल्यावाले" },
  { value: "BHATKAR", label: "भटकर" },
  { value: "KACHA_MAAL", label: "कच्चा माल मजूर" },
  { value: "PAKKA_MAAL", label: "पक्का माल मजूर" },
];

export const GENDER_OPTIONS = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
];

export const ID_PROOF_OPTIONS = [
  { value: "Aadhaar Card", label: "Aadhaar Card" },
  { value: "Voter ID", label: "Voter ID" },
  { value: "PAN Card", label: "PAN Card" },
  { value: "Driving License", label: "Driving License" },
  { value: "Other", label: "Other ID Proof" },
];

export const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive (Deactivated)" },
];

export const RELATIONSHIP_OPTIONS = [
  { value: "Spouse", label: "Spouse (Husband/Wife)" },
  { value: "Parent", label: "Parent (Father/Mother)" },
  { value: "Sibling", label: "Sibling (Brother/Sister)" },
  { value: "Relative", label: "Relative" },
  { value: "Friend", label: "Friend" },
  { value: "Other", label: "Other" },
];

export function formatWorkerCategory(cat: string | null): string {
  if (!cat) return "";
  switch (cat) {
    case "AALYAWALE":
      return "आल्यावाले";
    case "BHATKAR":
      return "भटकर";
    case "KACHA_MAAL":
      return "कच्चा माल मजूर";
    case "PAKKA_MAAL":
      return "पक्का माल मजूर";
    case "PIECE_RATE":
      return "Piece Rate";
    case "DAILY_WAGE":
      return "Daily Wage";
    case "MONTHLY_SALARY":
      return "Monthly Salary";
    default:
      return cat;
  }
}

export function getRateLabelAndHelp(selectedCategory: string) {
  switch (selectedCategory) {
    case "AALYAWALE":
    case "PIECE_RATE":
      return {
        label: "Initial Piece Rate (₹ per 1,000 Bricks)",
        placeholder: "e.g. 450.00",
        help: "Standard payout for moulding 1,000 raw bricks (Pathaiwala).",
      };
    case "BHATKAR":
      return {
        label: "Initial Rate / Salary (₹)",
        placeholder: "e.g. 600.00",
        help: "Bhatkar / Kiln burner wage rate.",
      };
    case "KACHA_MAAL":
      return {
        label: "Initial Rate / Wage (₹)",
        placeholder: "e.g. 400.00",
        help: "Raw material handling wage rate.",
      };
    case "PAKKA_MAAL":
      return {
        label: "Initial Rate / Wage (₹)",
        placeholder: "e.g. 500.00",
        help: "Pakka brick loading / transport wage rate.",
      };
    case "DAILY_WAGE":
      return {
        label: "Initial Daily Rate (₹ per Day)",
        placeholder: "e.g. 500.00",
        help: "Standard payout earned per working day.",
      };
    case "MONTHLY_SALARY":
      return {
        label: "Initial Monthly Salary (₹ per Month)",
        placeholder: "e.g. 15000.00",
        help: "Fixed base monthly salary amount.",
      };
    default:
      return {
        label: "Initial Wage Rate (₹)",
        placeholder: "e.g. 450.00",
        help: "Default rate for worker category.",
      };
  }
}
