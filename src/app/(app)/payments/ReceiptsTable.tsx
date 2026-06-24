"use client";

import Link from "next/link";
import DataTable, { type Column } from "@/components/DataTable";
import { inr } from "@/lib/format";

// Fully-paid deals, each linking to its printable receipt. Distinct from the
// Payments ledger — this is the post-sales "Fully Paid Receipt" surface.
export interface ReceiptRow {
  id: string;
  project: string;
  plot: string;
  customer: string;
  value: number;
  paid: number;
}

export default function ReceiptsTable({ rows }: { rows: ReceiptRow[] }) {
  const columns: Column<ReceiptRow>[] = [
    { id: "project", header: "Project", sort: (r) => r.project.toLowerCase(), cell: (r) => <span className="font-medium text-[var(--text)]">{r.project}</span> },
    { id: "plot", header: "Plot", cell: (r) => r.plot },
    { id: "customer", header: "Customer", sort: (r) => r.customer.toLowerCase(), hideBelow: "sm", cell: (r) => r.customer },
    { id: "value", header: "Value", align: "right", sort: (r) => r.value, cell: (r) => <span className="tabular-nums">{inr(r.value)}</span> },
    { id: "paid", header: "Paid", align: "right", sort: (r) => r.paid, hideBelow: "md", cell: (r) => <span className="tabular-nums text-emerald-500">{inr(r.paid)}</span> },
    {
      id: "action",
      header: "",
      align: "right",
      cell: (r) => (
        <Link
          href={`/receipts/${r.id}`}
          onClick={(e) => e.stopPropagation()}
          className="btn-ghost"
          style={{ padding: "5px 12px", fontSize: 12 }}
        >
          Receipt
        </Link>
      ),
    },
  ];

  return (
    <DataTable
      rows={rows}
      columns={columns}
      getRowHref={(r) => `/receipts/${r.id}`}
      search={(r) => `${r.project} ${r.plot} ${r.customer}`}
      searchPlaceholder="Search customer, project, plot…"
      emptyMessage="No fully-paid bookings yet."
    />
  );
}
