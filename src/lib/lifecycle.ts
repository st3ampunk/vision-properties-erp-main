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

  let released = 0;
  for (const b of expired) {
    // Fully paid bookings are never auto-released even if a window passed.
    if (b.payment_status === "completed") continue;

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
    released++;
  }
  return released;
}
