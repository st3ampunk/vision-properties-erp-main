import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireCapability } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";
import { PageHeader } from "@/components/ui";
import type { Customer, Plot, Project, User } from "@/lib/types";
import BookingForm from "./BookingForm";

export const dynamic = "force-dynamic";

export default async function NewBookingPage({
  searchParams,
}: {
  searchParams: Promise<{ plot?: string; mode?: string }>;
}) {
  await requireCapability("create_booking");
  const sp = await searchParams;
  const plotId = sp.plot;
  const mode = sp.mode === "blocking" ? "blocking" : "booking";
  if (!plotId) redirect("/plots");

  const sb = getSupabase();
  const { data: plotData } = await sb
    .from("plots")
    .select("*, projects(*)")
    .eq("id", plotId)
    .maybeSingle();
  if (!plotData) notFound();
  const plot = plotData as Plot & { projects: Project };

  if (plot.status !== "available") {
    redirect(`/plots/${plotId}`);
  }

  const [{ data: custData }, { data: partnerData }, { data: directorData }] = await Promise.all([
    sb.from("customers").select("id, name, mobile").order("name"),
    sb.from("users").select("id, full_name").eq("role", "business_partner").eq("is_active", true).order("full_name"),
    sb.from("users").select("id, full_name").in("role", ["director", "senior_director"]).eq("is_active", true).order("full_name"),
  ]);

  return (
    <>
      <PageHeader
        title={mode === "blocking" ? "Block Plot" : "Book Plot"}
        subtitle={`${plot.projects.name} · Plot ${plot.block}-${plot.plot_no}`}
        action={<Link href={`/plots/${plotId}`} className="btn-ghost">Cancel</Link>}
      />
      <BookingForm
        mode={mode}
        plot={{
          id: plot.id,
          block: plot.block,
          plot_no: plot.plot_no,
          sqft: plot.sqft,
          price_per_sqft: plot.price_per_sqft,
        }}
        project={{
          name: plot.projects.name,
          advance_percent: plot.projects.advance_percent,
          blocking_amount: plot.projects.blocking_amount,
          blocking_window_hours: plot.projects.blocking_window_hours,
          booking_window_days: plot.projects.booking_window_days,
        }}
        customers={(custData ?? []) as Pick<Customer, "id" | "name" | "mobile">[]}
        partners={(partnerData ?? []) as Pick<User, "id" | "full_name">[]}
        directors={(directorData ?? []) as Pick<User, "id" | "full_name">[]}
      />
    </>
  );
}
