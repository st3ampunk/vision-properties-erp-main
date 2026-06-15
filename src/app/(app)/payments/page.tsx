import { requireCapability } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";
import { sweepExpiredBookings } from "@/lib/lifecycle";
import { inr } from "@/lib/format";
import { PageHeader, StatCard } from "@/components/ui";
import type { Booking, Customer, Plot, Project } from "@/lib/types";
import PaymentsTable, { type PaymentRow } from "./PaymentsTable";

export const dynamic = "force-dynamic";

export default async function PaymentsPage() {
  await requireCapability("view_finance");
  await sweepExpiredBookings();

  const sb = getSupabase();
  const { data } = await sb
    .from("bookings")
    .select("*, plots(block, plot_no), customers(name), projects(name)")
    .neq("status", "cancelled")
    .order("created_at", { ascending: false });
  const raw = (data ?? []) as (Booking & {
    plots: Pick<Plot, "block" | "plot_no">;
    customers: Pick<Customer, "name">;
    projects: Pick<Project, "name">;
  })[];

  const rows: PaymentRow[] = raw.map((b) => ({
    id: b.id,
    project: b.projects?.name ?? "—",
    plot: b.plots ? `${b.plots.block}-${b.plots.plot_no}` : "—",
    customer: b.customers?.name ?? "—",
    value: b.total_plot_value,
    paid: b.advance_paid,
    balance: Math.max(0, b.total_plot_value - b.advance_paid),
    status: b.status,
    payment_status: b.payment_status,
  }));

  const totalValue = rows.reduce((s, b) => s + b.value, 0);
  const totalPaid = rows.reduce((s, b) => s + b.paid, 0);

  return (
    <>
      <PageHeader title="Payments" subtitle="Collections and outstanding across every active deal." />
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Deal Value" value={inr(totalValue)} />
        <StatCard label="Received" value={inr(totalPaid)} />
        <StatCard label="Outstanding" value={inr(Math.max(0, totalValue - totalPaid))} />
        <StatCard label="Active Deals" value={rows.length} />
      </div>
      <PaymentsTable rows={rows} />
    </>
  );
}
