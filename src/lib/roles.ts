// ============================================================================
// Role definitions, hierarchy and permission helpers.
// Mirrors the v0.1 board: Admin -> Sales hierarchy + Business operators.
// ============================================================================

export type Role =
  | "admin"
  | "senior_director"
  | "director"
  | "business_manager"
  | "business_partner"
  | "finance"
  | "legal";

export const ROLES: Role[] = [
  "admin",
  "senior_director",
  "director",
  "business_manager",
  "business_partner",
  "finance",
  "legal",
];

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Admin",
  senior_director: "Senior Director",
  director: "Director",
  business_manager: "Business Manager",
  business_partner: "Business Partner",
  finance: "Finance / Billing",
  legal: "Legal Team",
};

// Sales hierarchy, top -> bottom. Used for "who manages whom".
export const SALES_HIERARCHY: Role[] = [
  "senior_director",
  "director",
  "business_manager",
  "business_partner",
];

export const BUSINESS_OPERATORS: Role[] = ["finance", "legal"];

export function isSalesRole(role: Role): boolean {
  return SALES_HIERARCHY.includes(role);
}

// The role a manager of `role` should normally have (one level up).
export function managerRoleOf(role: Role): Role | null {
  const idx = SALES_HIERARCHY.indexOf(role);
  if (idx > 0) return SALES_HIERARCHY[idx - 1];
  if (idx === 0) return "admin";
  return null;
}

// ---------------------------------------------------------------------------
// Permissions — coarse capability flags per role (app-level guard).
// ---------------------------------------------------------------------------
export type Capability =
  | "manage_users"
  | "manage_projects"
  | "manage_plots"
  | "manage_customers"
  | "create_booking"
  | "approve_booking"
  | "confirm_booking"
  | "cancel_booking"
  | "record_payment"
  | "manage_registration"
  | "approve_refund"
  | "manage_transfer"
  | "view_finance"
  | "view_legal"
  | "view_reports";

const CAPABILITIES: Record<Role, Capability[]> = {
  admin: [
    "manage_users",
    "manage_projects",
    "manage_plots",
    "manage_customers",
    "create_booking",
    "approve_booking",
    "confirm_booking",
    "cancel_booking",
    "record_payment",
    "manage_registration",
    "approve_refund",
    "manage_transfer",
    "view_finance",
    "view_legal",
    "view_reports",
  ],
  senior_director: [
    "manage_customers",
    "create_booking",
    "approve_booking",
    "confirm_booking",
    "cancel_booking",
    "manage_transfer",
    "view_reports",
  ],
  director: [
    "manage_customers",
    "create_booking",
    "approve_booking",
    "confirm_booking",
    "cancel_booking",
    "manage_transfer",
    "view_reports",
  ],
  business_manager: [
    "manage_customers",
    "create_booking",
    "approve_booking",
    "confirm_booking",
    "cancel_booking",
    "manage_transfer",
    "view_reports",
  ],
  business_partner: ["manage_customers", "create_booking"],
  finance: ["record_payment", "view_finance", "view_reports"],
  legal: ["manage_registration", "view_legal", "view_reports"],
};

export function can(role: Role | undefined | null, cap: Capability): boolean {
  if (!role) return false;
  return CAPABILITIES[role]?.includes(cap) ?? false;
}
