import "server-only";
import { getSupabase } from "./supabase";
import { notify } from "./audit";

// ---------------------------------------------------------------------------
// Lazy expiry sweep (board flow):
//   - Blocking not converted within window  -> "land will be return"
//   - Booking advance/full not paid in time -> "land is back to company"
// Any pending booking whose `expires_at` has passed and which is NOT fully
// paid is released: the plot goes back to 'available' and the booking is
// cancelled. Runs cheaply on bookings/plots list loads.
// ---------------------------------------------------------------------------
export async function sweepExpiredBookings(): Promise<number> {
  const sb = getSupabase();
  const nowIso = new Date().toISOString();

  const { data: expired } = await sb
    .from("bookings")
    .select("id, plot_id, payment_status, total_plot_value, advance_paid, customer_id")
    .eq("status", "pending")
    .not("expires_at", "is", null)
    .lt("expires_at", nowIso);

  if (!expired || expired.length === 0) return 0;

  // Fully paid bookings are never auto-released even if a window passed.
  const toRelease = expired.filter((b) => b.payment_status !== "completed");
  if (toRelease.length === 0) return 0;

  // Release in parallel — this sweep is awaited before several list pages
  // render, so a serial loop would add one round-trip per expired booking to
  // every page load.
  await Promise.all(
    toRelease.map(async (b) => {
      await sb
        .from("bookings")
        .update({ status: "cancelled", released_at: nowIso })
        .eq("id", b.id);

      await sb
        .from("plots")
        .update({ status: "available" })
        .eq("id", b.plot_id);

      await notify(
        b.id,
        "sms",
        null,
        "Your hold has expired and the plot has been released back to Vision Properties.",
      );
    }),
  );
  return toRelease.length;
}
