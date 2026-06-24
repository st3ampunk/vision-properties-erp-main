import { requireCapability } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";
import { sweepExpiredBookings } from "@/lib/lifecycle";
import { PageHeader } from "@/components/ui";
import type { Booking, Customer, Plot, Project } from "@/lib/types";
import ReleaseTable, { type ReleaseRow } from "./ReleaseTable";

export const dynamic = "force-dynamic";

// Post-Sales · Plot Release. A cancelled booking does NOT free its plot directly
// — the plot is held as 'cancelled' and lands here for an Admin to release back
// to the company. Lists only those cancelled-and-pending plots. Admin-only.
export default async function PlotReleasePage() {
  await requireCapability("manage_plots");
  await sweepExpiredBookings();
  const sb = getSupabase();

  const { data: plotData } = await sb
    .from("plots")
    .select("id, plot_no, sqft, price_per_sqft, status, projects(name)")
    .eq("status", "cancelled")
    .order("plot_no");
  const plots = (plotData ?? []) as unknown as (Pick<Plot, "id" | "plot_no" | "sqft" | "price_per_sqft" | "status"> & {
    projects: Pick<Project, "name"> | null;
  })[];

  // The cancelled booking behind each held plot → who held it, value, refund.
  const ids = plots.map((p) => p.id);
  const byPlot = new Map<string, { customer: string; value: number; cancelledAt: string | null; refundStatus: string }>();
  if (ids.length > 0) {
    const { data: bkData } = await sb
      .from("bookings")
      .select("plot_id, total_plot_value, released_at, refund_status, customers(name)")
      .in("plot_id", ids)
      .eq("status", "cancelled")
      .order("released_at", { ascending: false });
    for (const b of (bkData ?? []) as unknown as (Pick<Booking, "plot_id" | "total_plot_value" | "released_at" | "refund_status"> & {
      customers: Pick<Customer, "name"> | null;
    })[]) {
      // Keep the most recent cancelled booking per plot (rows are sorted desc).
      if (!byPlot.has(b.plot_id)) {
        byPlot.set(b.plot_id, {
          customer: b.customers?.name ?? "—",
          value: Number(b.total_plot_value ?? 0),
          cancelledAt: b.released_at,
          refundStatus: b.refund_status ?? "none",
        });
      }
    }
  }

  const rows: ReleaseRow[] = plots.map((p) => {
    const bk = byPlot.get(p.id);
    return {
      id: p.id,
      project: p.projects?.name ?? "—",
      plot: p.plot_no,
      customer: bk?.customer ?? "—",
      value: bk?.value ?? p.sqft * p.price_per_sqft,
      cancelledAt: bk?.cancelledAt ?? null,
      refundStatus: bk?.refundStatus ?? "none",
    };
  });

  return (
    <>
      <PageHeader
        title="Plot Release"
        subtitle="Cancelled plots waiting to be released back to the company for the next customer."
      />
      <ReleaseTable rows={rows} />
    </>
  );
}
