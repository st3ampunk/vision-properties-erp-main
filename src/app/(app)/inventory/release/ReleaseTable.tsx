"use client";

import DataTable, { type Column } from "@/components/DataTable";
import { Badge } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";
import { inr, fmtDate } from "@/lib/format";
import { releasePlot } from "../../plots/actions";

export interface ReleaseRow {
  id: string;
  project: string;
  plot: string;
  customer: string;
  value: number;
  cancelledAt: string | null;
  refundStatus: string;
}

const REFUND: Record<string, { label: string; tone: "gray" | "amber" | "blue" | "green" }> = {
  none: { label: "No refund", tone: "gray" },
  pending_approval: { label: "Refund pending", tone: "amber" },
  approved: { label: "Refund approved", tone: "blue" },
  paid: { label: "Refunded", tone: "green" },
};

// Plots whose booking was cancelled and are waiting for an Admin to release them
// back to the company. Releasing flips the plot to 'available'.
export default function ReleaseTable({ rows }: { rows: ReleaseRow[] }) {
  const columns: Column<ReleaseRow>[] = [
    { id: "project", header: "Project", sort: (r) => r.project.toLowerCase(), cell: (r) => <span className="font-medium text-[var(--text)]">{r.project}</span> },
    { id: "plot", header: "Plot", sort: (r) => r.plot, cell: (r) => <span className="font-medium">{r.plot}</span> },
    { id: "customer", header: "Was Held By", sort: (r) => r.customer.toLowerCase(), hideBelow: "sm", cell: (r) => r.customer },
    { id: "value", header: "Value", align: "right", sort: (r) => r.value, hideBelow: "md", cell: (r) => <span className="tabular-nums">{inr(r.value)}</span> },
    { id: "cancelled", header: "Cancelled", hideBelow: "lg", sort: (r) => r.cancelledAt ?? "", cell: (r) => <span className="whitespace-nowrap text-[var(--muted)]">{fmtDate(r.cancelledAt)}</span> },
    {
      id: "refund",
      header: "Refund",
      sort: (r) => r.refundStatus,
      cell: (r) => {
        const m = REFUND[r.refundStatus] ?? REFUND.none;
        return <Badge tone={m.tone}>{m.label}</Badge>;
      },
    },
    {
      id: "action",
      header: "",
      align: "right",
      cell: (r) => (
        <form action={releasePlot} onClick={(e) => e.stopPropagation()}>
          <input type="hidden" name="plot_id" value={r.id} />
          <SubmitButton
            className="btn-ghost text-[var(--brand-red)]"
            style={{ padding: "5px 12px", fontSize: 12 }}
            pendingLabel="Releasing…"
          >
            Release
          </SubmitButton>
        </form>
      ),
    },
  ];

  return (
    <DataTable
      rows={rows}
      columns={columns}
      search={(r) => `${r.project} ${r.plot} ${r.customer}`}
      searchPlaceholder="Search project, plot, customer…"
      filters={[
        {
          id: "refund",
          label: "Refund",
          options: [
            { value: "none", label: "No refund" },
            { value: "pending_approval", label: "Pending" },
            { value: "approved", label: "Approved" },
            { value: "paid", label: "Refunded" },
          ],
          match: (r, v) => r.refundStatus === v,
        },
      ]}
      emptyMessage="No cancelled plots waiting to be released."
    />
  );
}
