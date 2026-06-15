"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { getSupabase } from "@/lib/supabase";
import { requireCapability } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { ROLES, type Role } from "@/lib/roles";

export async function createUser(formData: FormData): Promise<void> {
  const actor = await requireCapability("manage_users");

  const full_name = String(formData.get("full_name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const mobile = String(formData.get("mobile") || "").trim() || null;
  const role = String(formData.get("role") || "") as Role;
  const manager_id = String(formData.get("manager_id") || "") || null;

  if (!full_name || !email || !password || !ROLES.includes(role)) return;

  const password_hash = await bcrypt.hash(password, 10);
  const { data, error } = await getSupabase()
    .from("users")
    .insert({ full_name, email, password_hash, mobile, role, manager_id })
    .select("id")
    .single();

  if (!error && data) {
    await logAudit(actor, "user", data.id, "create", `${full_name} (${role})`);
  }
  revalidatePath("/users");
}

export async function toggleUserActive(formData: FormData): Promise<void> {
  const actor = await requireCapability("manage_users");
  const id = String(formData.get("id") || "");
  const next = String(formData.get("next") || "") === "true";
  if (!id) return;
  await getSupabase().from("users").update({ is_active: next }).eq("id", id);
  await logAudit(actor, "user", id, next ? "activate" : "deactivate");
  revalidatePath("/users");
}
