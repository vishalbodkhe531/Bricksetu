export const CATEGORY_OPTIONS = [
  { value: "PIECE_RATE", label: "Piece Rate Moulder (Pathaiwala)" },
  { value: "DAILY_WAGE", label: "Daily Wage / Rojdari (Fireman / Loader)" },
  { value: "MONTHLY_SALARY", label: "Monthly Salary (Staff / Manager)" },
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

export function getRateLabelAndHelp(selectedCategory: string) {
  switch (selectedCategory) {
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
    case "PIECE_RATE":
    default:
      return {
        label: "Initial Piece Rate (₹ per 1,000 Bricks)",
        placeholder: "e.g. 450.00",
        help: "Default rate paid for moulding 1,000 raw bricks.",
      };
  }
}
