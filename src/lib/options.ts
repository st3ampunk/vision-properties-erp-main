// Select-field option lists used across forms (board: "(Select)" fields).

export const LAND_TYPES = [
  "Residential",
  "Commercial",
  "Agricultural",
  "Mixed Use",
  "Industrial",
];

export const APPROVAL_TYPES: { value: "dtcp_rera" | "dtcp_only"; label: string }[] = [
  { value: "dtcp_rera", label: "DTCP + RERA" },
  { value: "dtcp_only", label: "DTCP Only" },
];

export const PROJECT_TYPES: { value: "affordable" | "luxury"; label: string }[] = [
  { value: "affordable", label: "Affordable Project" },
  { value: "luxury", label: "Luxury Project" },
];

export const OCCUPATIONS = [
  "Salaried",
  "Self Employed",
  "Business Owner",
  "Government Employee",
  "Professional",
  "Retired",
  "Other",
];

export const NOMINEE_RELATIONSHIPS = [
  "Spouse",
  "Son",
  "Daughter",
  "Father",
  "Mother",
  "Brother",
  "Sister",
  "Other",
];

export const PAYMENT_MODES = [
  "Cash",
  "Cheque",
  "Bank Transfer",
  "UPI",
  "Home Loan",
  "Other",
];

export const INDIAN_STATES = [
  "Tamil Nadu",
  "Karnataka",
  "Andhra Pradesh",
  "Telangana",
  "Kerala",
  "Maharashtra",
  "Puducherry",
  "Other",
];
