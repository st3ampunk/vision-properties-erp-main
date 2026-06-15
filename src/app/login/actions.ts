"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { getSupabase, supabaseConfigured } from "@/lib/supabase";
import { createSession, destroySession } from "@/lib/session";
import { logAudit } from "@/lib/audit";

export async function login(
  _prev: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email || !password) return { error: "Email and password are required." };
  if (!supabaseConfigured()) {
    return {
      error:
        "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local, then run the schema and `npm run db:seed`.",
    };
  }

  const { data: user, error } = await getSupabase()
    .from("users")
    .select("id, full_name, email, password_hash, role, is_active")
    .eq("email", email)
    .maybeSingle();

  if (error || !user) return { error: "Invalid email or password." };
  if (!user.is_active) return { error: "This account is deactivated." };

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return { error: "Invalid email or password." };

  await createSession({
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    role: user.role,
  });
  await logAudit(
    { id: user.id, full_name: user.full_name, email: user.email, role: user.role },
    "user",
    user.id,
    "login",
  );

  redirect("/dashboard");
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/login");
}
