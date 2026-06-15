"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { requireUser } from "@/lib/auth";
import { createSession } from "@/lib/session";
import { logAudit } from "@/lib/audit";

// Change the signed-in admin's own password.
export async function changePassword(formData: FormData): Promise<void> {
  const user = await requireUser();
  const current = String(formData.get("current_password") || "");
  const next = String(formData.get("new_password") || "");
  const confirm = String(formData.get("confirm_password") || "");

  if (!current || !next) redirect("/settings?err=missing");
  if (next.length < 6) redirect("/settings?err=short");
  if (next !== confirm) redirect("/settings?err=mismatch");

  const sb = getSupabase();
  const { data } = await sb.from("users").select("password_hash").eq("id", user.id).maybeSingle();
  if (!data) redirect("/settings?err=missing");

  const ok = await bcrypt.compare(current, data.password_hash);
  if (!ok) redirect("/settings?err=wrong");

  const password_hash = await bcrypt.hash(next, 10);
  await sb.from("users").update({ password_hash }).eq("id", user.id);
  await logAudit(user, "user", user.id, "password_change");
  redirect("/settings?ok=password");
}

// Update the signed-in admin's own profile (name / email / mobile).
export async function updateProfile(formData: FormData): Promise<void> {
  const user = await requireUser();
  const full_name = String(formData.get("full_name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const mobile = String(formData.get("mobile") || "").trim() || null;
  if (!full_name || !email) redirect("/settings?err=profile");

  const sb = getSupabase();
  const { data: clash } = await sb
    .from("users")
    .select("id")
    .eq("email", email)
    .neq("id", user.id)
    .maybeSingle();
  if (clash) redirect("/settings?err=email");

  await sb.from("users").update({ full_name, email, mobile }).eq("id", user.id);
  // Re-issue the session so the new name/email show immediately.
  await createSession({ id: user.id, full_name, email, role: user.role });
  await logAudit(user, "user", user.id, "profile_update");
  revalidatePath("/settings");
  redirect("/settings?ok=profile");
}
