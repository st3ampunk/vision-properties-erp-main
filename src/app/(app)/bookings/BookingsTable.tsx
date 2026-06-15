"use client";

import Link from "next/link";
import DataTable, { type Column } from "@/components/DataTable";
import { Badge, BookingStatusBadge, PaymentBadge } from "@/components/ui";
import { fmtDate, timeLeft, inr } from "@/lib/format";
import { confirmBooking, cancelBooking } from "./actions";

export interface BookingRow {
  id: string;
  project: string;
  plot: string;
  customer: string;
  mobile: string;
  value: number;
  booked_date: string | null;
  book_mode: string;
  status: string;
  payment_status: string;
  expires_at: string | null;
  created_at: string;
}

export default function BookingsTable({
  rows,
  canConfirm,
  canCancel,
}: {
  rows: BookingRow[];
  canConfirm: boolean;
  canCancel: boolean;
}) {
  const columns: Column<BookingRow>[] = [
    { id: "project", header: "Project", sort: (r) => r.project.toLowerCase(), cell: (r) => <span className="font-medium text-[var(--text)]">{r.project}</span> },
    { id: "plot", header: "Plot", cell: (r) => r.plot },
    { id: "customer", header: "Customer", sort: (r) => r.customer.toLowerCase(), cell: (r) => (
      <div><div>{r.customer}</div><div className="text-xs text-[var(--muted)] sm:hidden">{r.mobile}</div></div>
    ) },
    { id: "mobile", header: "Mobile", hideBelow: "md", cell: (r) => r.mobile },
    { id: "value", header: "Value", align: "right", sort: (r) => r.value, hideBelow: "lg", cell: (r) => <span className="tabular-nums">{inr(r.value)}</span> },
    { id: "mode", header: "Mode", sort: (r) => r.book_mode, cell: (r) => (
      <div>
        <Badge tone={r.book_mode === "blocking" ? "amber" : "blue"}>{r.book_mode}</Badge>
        {r.status === "pending" && r.expires_at && (
          <div className="mt-0.5 text-[10px] text-[var(--muted)]">{timeLeft(r.expires_at)}</div>
        )}
      </div>
    ) },
    { id: "status", header: "Status", sort: (r) => r.status, cell: (r) => <BookingStatusBadge status={r.status} /> },
    { id: "payment", header: "Payment", sort: (r) => r.payment_status, cell: (r) => <PaymentBadge status={r.payment_status} /> },
    { id: "action", header: "", align: "right", cell: (r) => (
      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
        <Link href={`/bookings/${r.id}`} className="btn-ghost" style={{ padding: "5px 10px", fontSize: 12 }}>View</Link>
        {r.status === "pending" && canConfirm && (
          <form action={confirmBooking}>
            <input type="hidden" name="id" value={r.id} />
            <button className="btn-success" style={{ padding: "5px 10px", fontSize: 12 }} type="submit">Confirm</button>
          </form>
        )}
        {r.status !== "cancelled" && canCancel && (
          <form action={cancelBooking}>
            <input type="hidden" name="id" value={r.id} />
            <button className="btn-danger" style={{ padding: "5px 10px", fontSize: 12 }} type="submit">Cancel</button>
          </form>
        )}
      </div>
    ) },
  ];

  return (
    <DataTable
      rows={rows}
      columns={columns}
      getRowHref={(r) => `/bookings/${r.id}`}
      search={(r) => `${r.project} ${r.plot} ${r.customer} ${r.mobile}`}
      searchPlaceholder="Search customer, project, plot…"
      filters={[
        { id: "status", label: "Status", options: [
          { value: "pending", label: "Pending" },
          { value: "confirmed", label: "Confirmed" },
          { value: "cancelled", label: "Cancelled" },
        ], match: (r, v) => r.status === v },
        { id: "mode", label: "Mode", options: [
          { value: "blocking", label: "Blocking" },
          { value: "booking", label: "Booking" },
        ], match: (r, v) => r.book_mode === v },
        { id: "payment", label: "Payment", options: [
          { value: "pending", label: "Pending" },
          { value: "completed", label: "Paid" },
        ], match: (r, v) => r.payment_status === v },
      ]}
      emptyMessage="No bookings found."
    />
  );
}
