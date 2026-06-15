import { requireUser } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";
import { sweepExpiredBookings } from "@/lib/lifecycle";
import { PageHeader } from "@/components/ui";
import type { Plot, Project } from "@/lib/types";
import PlotsTable, { type PlotRow } from "./PlotsTable";

export const dynamic = "force-dynamic";

export default async function PlotsPage() {
  await requireUser();
  await sweepExpiredBookings();

  const sb = getSupabase();
  const { data } = await sb
    .from("plots")
    .select("*, projects(name)")
    .order("created_at", { ascending: false });
  const raw = (data ?? []) as (Plot & { projects: Pick<Project, "name"> })[];

  const rows: PlotRow[] = raw.map((p) => ({
    id: p.id,
    project: p.projects?.name ?? "—",
    block: p.block,
    plot_no: p.plot_no,
    sqft: p.sqft,
    value: p.sqft * p.price_per_sqft,
    status: p.status,
  }));

  return (
    <>
      <PageHeader
        title="Plot Inventory"
        subtitle="Every plot across all projects. Search, filter by status and sort instantly."
      />
      <PlotsTable rows={rows} />
    </>
  );
}
