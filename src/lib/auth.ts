import "server-only";
import { redirect } from "next/navigation";
import { getSession, type SessionUser } from "./session";
import { can, type Capability } from "./roles";

// Require an authenticated user; redirect to /login otherwise.
export async function requireUser(): Promise<SessionUser> {
  const user = await getSession();
  if (!user) redirect("/login");
  return user;
}

// Require a specific capability; redirect to dashboard if missing.
export async function requireCapability(cap: Capability): Promise<SessionUser> {
  const user = await requireUser();
  if (!can(user.role, cap)) redirect("/dashboard");
  return user;
}
