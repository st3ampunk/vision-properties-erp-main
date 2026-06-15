import { requireCapability } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";
import { ROLE_LABELS, SALES_HIERARCHY, BUSINESS_OPERATORS, type Role } from "@/lib/roles";
import { PageHeader } from "@/components/ui";
import type { User } from "@/lib/types";
import { createUser } from "./actions";
import UsersTable, { type UserRow } from "./UsersTable";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  await requireCapability("manage_users");
  const sb = getSupabase();
  const { data: users } = await sb
    .from("users")
    .select("*")
    .order("created_at", { ascending: true });

  const list = (users ?? []) as User[];
  const byId = new Map(list.map((u) => [u.id, u]));
  const managers = list.filter((u) => u.role !== "business_partner" && u.is_active);

  // Admin panel manages the team — hide admin accounts from the list itself.
  const rows: UserRow[] = list
    .filter((u) => u.role !== "admin")
    .map((u) => ({
    id: u.id,
    full_name: u.full_name,
    email: u.email,
    role: u.role as Role,
    manager: u.manager_id ? byId.get(u.manager_id)?.full_name ?? "" : "",
    is_active: u.is_active,
  }));

  return (
    <>
      <PageHeader
        title="Users & Hierarchy"
        subtitle="Admin, the sales chain (Senior Director → Director → Business Manager → Business Partner) and operators (Finance, Legal)."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-1">
          <h2 className="mb-4 text-sm font-semibold">Add User</h2>
          <form action={createUser} className="space-y-3">
            <div><label className="label">Full Name *</label><input name="full_name" className="input" required /></div>
            <div><label className="label">Email *</label><input name="email" type="email" className="input" required /></div>
            <div><label className="label">Temporary Password *</label><input name="password" className="input" required minLength={6} /></div>
            <div><label className="label">Mobile</label><input name="mobile" className="input" /></div>
            <div>
              <label className="label">Role *</label>
              <select name="role" className="select" required defaultValue="">
                <option value="" disabled>Select role</option>
                <optgroup label="Sales Hierarchy">
                  {SALES_HIERARCHY.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                </optgroup>
                <optgroup label="Business Operators">
                  {BUSINESS_OPERATORS.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                </optgroup>
                <option value="admin">{ROLE_LABELS.admin}</option>
              </select>
            </div>
            <div>
              <label className="label">Reports To (Manager)</label>
              <select name="manager_id" className="select" defaultValue="">
                <option value="">— None —</option>
                {managers.map((m) => <option key={m.id} value={m.id}>{m.full_name} ({ROLE_LABELS[m.role]})</option>)}
              </select>
            </div>
            <button className="btn-primary w-full" type="submit">Create User</button>
          </form>
        </div>

        <div className="lg:col-span-2">
          <UsersTable rows={rows} />
        </div>
      </div>
    </>
  );
}
