"use client";

import Link from "next/link";
import DataTable, { type Column } from "@/components/DataTable";
import { BookingStatusBadge, PaymentBadge } from "@/components/ui";
import { inr } from "@/lib/format";

export interface PaymentRow {
  id: string;
  project: string;
  plot: string;
  customer: string;
  value: number;
  paid: number;
  balance: number;
  status: string;
  payment_status: string;
}

export default function PaymentsTable({ rows }: { rows: PaymentRow[] }) {
  const columns: Column<PaymentRow>[] = [
    { id: "project", header: "Project", sort: (r) => r.project.toLowerCase(), cell: (r) => <span className="font-medium text-[var(--text)]">{r.project}</span> },
    { id: "plot", header: "Plot", cell: (r) => r.plot },
    { id: "customer", header: "Customer", sort: (r) => r.customer.toLowerCase(), hideBelow: "sm", cell: (r) => r.customer },
    { id: "value", header: "Value", align: "right", sort: (r) => r.value, cell: (r) => <span className="tabular-nums">{inr(r.value)}</span> },
    { id: "paid", header: "Paid", align: "right", sort: (r) => r.paid, hideBelow: "md", cell: (r) => <span className="tabular-nums text-emerald-500">{inr(r.paid)}</span> },
    { id: "balance", header: "Balance", align: "right", sort: (r) => r.balance, cell: (r) => <span className="tabular-nums">{inr(r.balance)}</span> },
    { id: "booking", header: "Booking", hideBelow: "lg", sort: (r) => r.status, cell: (r) => <BookingStatusBadge status={r.status} /> },
    { id: "payment", header: "Payment", sort: (r) => r.payment_status, cell: (r) => <PaymentBadge status={r.payment_status} /> },
    { id: "action", header: "", align: "right", cell: (r) => (
      <Link href={`/bookings/${r.id}`} onClick={(e) => e.stopPropagation()} className="btn-ghost" style={{ padding: "5px 12px", fontSize: 12 }}>Open</Link>
    ) },
  ];

  return (
    <DataTable
      rows={rows}
      columns={columns}
      getRowHref={(r) => `/bookings/${r.id}`}
      search={(r) => `${r.project} ${r.plot} ${r.customer}`}
      searchPlaceholder="Search customer, project, plot…"
      filters={[{ id: "payment", label: "Payment", options: [{ value: "pending", label: "Pending" }, { value: "completed", label: "Paid" }], match: (r, v) => r.payment_status === v }]}
      emptyMessage="No deals found."
    />
  );
}
