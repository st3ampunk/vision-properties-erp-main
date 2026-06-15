import { requireUser } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";
import { can } from "@/lib/roles";
import { sweepExpiredBookings } from "@/lib/lifecycle";
import { PageHeader } from "@/components/ui";
import type { Booking, Customer, Plot, Project } from "@/lib/types";
import { type BookingRow } from "./BookingsTable";
import BookingsWorkspace, { type FlowData } from "./BookingsWorkspace";
import { type FlowProject } from "./StartBookingFlow";

export const dynamic = "force-dynamic";

export default async function BookingsPage() {
  const user = await requireUser();
  await sweepExpiredBookings();
  const sb = getSupabase();
  const canCreate = can(user.role, "create_booking");

  const { data } = await sb
    .from("bookings")
    .select("*, plots(block, plot_no), customers(name, mobile), projects(name)")
    .order("created_at", { ascending: false });
  const raw = (data ?? []) as (Booking & {
    plots: Pick<Plot, "block" | "plot_no">;
    customers: Pick<Customer, "name" | "mobile">;
    projects: Pick<Project, "name">;
  })[];

  const rows: BookingRow[] = raw.map((b) => ({
    id: b.id,
    project: b.projects?.name ?? "—",
    plot: b.plots ? `${b.plots.block}-${b.plots.plot_no}` : "—",
    customer: b.customers?.name ?? "—",
    mobile: b.customers?.mobile ?? "—",
    value: b.total_plot_value,
    booked_date: b.booked_date,
    book_mode: b.book_mode,
    status: b.status,
    payment_status: b.payment_status,
    expires_at: b.expires_at,
    created_at: b.created_at,
  }));

  // Data for the inline "Block / Book" flow — only when the user can create.
  let flow: FlowData | null = null;
  if (canCreate) {
    // Base query does NOT depend on the plot-groups migration (0003), so blocking
    // and booking keep working even before that migration is run.
    const [{ data: projData }, { data: custData }, { data: partnerData }, { data: directorData }] =
      await Promise.all([
        sb
          .from("projects")
          .select(
            "id, name, city, advance_percent, blocking_amount, blocking_window_hours, booking_window_days, plots(id, block, plot_no, sqft, price_per_sqft, status)",
          )
          .eq("status", "active")
          .order("name"),
        sb.from("customers").select("id, name, mobile").order("name"),
        sb.from("users").select("id, full_name").eq("role", "business_partner").eq("is_active", true).order("full_name"),
        sb.from("users").select("id, full_name").in("role", ["director", "senior_director"]).eq("is_active", true).order("full_name"),
      ]);

    // Plot groups are OPTIONAL: if migration 0003 isn't applied these queries
    // just error and we fall back to "no groups" (every plot is ungrouped).
    const [{ data: catData }, { data: plotCatData }] = await Promise.all([
      sb.from("plot_categories").select("id, name, project_id"),
      sb.from("plots").select("id, plot_category_id"),
    ]);
    const groupsByProject = new Map<string, { id: string; name: string }[]>();
    for (const g of (catData ?? []) as { id: string; name: string; project_id: string }[]) {
      const list = groupsByProject.get(g.project_id) ?? [];
      list.push({ id: g.id, name: g.name });
      groupsByProject.set(g.project_id, list);
    }
    const plotGroup = new Map<string, string | null>();
    for (const r of (plotCatData ?? []) as { id: string; plot_category_id: string | null }[]) {
      plotGroup.set(r.id, r.plot_category_id);
    }

    const projRaw = (projData ?? []) as unknown as {
      id: string;
      name: string;
      city: string;
      advance_percent: number;
      blocking_amount: number;
      blocking_window_hours: number;
      booking_window_days: number;
      plots: {
        id: string;
        block: string;
        plot_no: string;
        sqft: number;
        price_per_sqft: number;
        status: string;
      }[] | null;
    }[];

    const projects: FlowProject[] = projRaw
      .map((p) => ({
        id: p.id,
        name: p.name,
        city: p.city,
        advance_percent: p.advance_percent,
        blocking_amount: p.blocking_amount,
        blocking_window_hours: p.blocking_window_hours,
        booking_window_days: p.booking_window_days,
        groups: (groupsByProject.get(p.id) ?? []).slice().sort((a, b) => a.name.localeCompare(b.name)),
        plots: (p.plots ?? [])
          .filter((pl) => pl.status === "available")
          .map((pl) => ({
            id: pl.id,
            block: pl.block,
            plot_no: pl.plot_no,
            sqft: pl.sqft,
            price_per_sqft: pl.price_per_sqft,
            plot_category_id: plotGroup.get(pl.id) ?? null,
          })),
      }))
      .filter((p) => p.plots.length > 0);

    flow = {
      projects,
      customers: (custData ?? []) as FlowData["customers"],
      partners: (partnerData ?? []) as FlowData["partners"],
      directors: (directorData ?? []) as FlowData["directors"],
    };
  }

  return (
    <>
      <PageHeader
        title="Bookings & Blocking"
        subtitle="Block or book a plot, and manage every blocking and booking — all in one place."
      />
      <BookingsWorkspace
        rows={rows}
        canConfirm={can(user.role, "confirm_booking")}
        canCancel={can(user.role, "cancel_booking")}
        canCreate={canCreate}
        flow={flow}
      />
    </>
  );
}
