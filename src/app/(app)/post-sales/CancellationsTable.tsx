"use client";

import DataTable, { type Column } from "@/components/DataTable";
import { Badge } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";
import { inr, fmtDate } from "@/lib/format";
import { approveRefund, markRefundPaid } from "../bookings/actions";

export interface CancellationRow {
  id: string;
  project: string;
  plot: string;
  customer: string;
  value: number;
  reason: string | null;
  charge: number | null;
  refundAmount: number | null;
  refundStatus: string; // none | pending_approval | approved | paid
  refundDue: string | null;
  cancelledAt: string | null;
}

const REFUND: Record<string, { label: string; tone: "gray" | "amber" | "blue" | "green" }> = {
  none: { label: "No refund", tone: "gray" },
  pending_approval: { label: "Refund pending", tone: "amber" },
  approved: { label: "Refund approved", tone: "blue" },
  paid: { label: "Refunded", tone: "green" },
};

// Cancelled bookings + their refund lifecycle. Admin can approve a pending
// refund and mark an approved refund as paid out, right from the row.
export default function CancellationsTable({
  rows,
  canApprove,
  canPay,
}: {
  rows: CancellationRow[];
  canApprove: boolean;
  canPay: boolean;
}) {
  const columns: Column<CancellationRow>[] = [
    { id: "project", header: "Project", sort: (r) => r.project.toLowerCase(), cell: (r) => <span className="font-medium text-[var(--text)]">{r.project}</span> },
    { id: "plot", header: "Plot", cell: (r) => r.plot },
    { id: "customer", header: "Customer", sort: (r) => r.customer.toLowerCase(), hideBelow: "sm", cell: (r) => r.customer },
    { id: "value", header: "Value", align: "right", sort: (r) => r.value, hideBelow: "lg", cell: (r) => <span className="tabular-nums">{inr(r.value)}</span> },
    { id: "charge", header: "Charge", align: "right", hideBelow: "lg", cell: (r) => <span className="tabular-nums text-[var(--muted)]">{r.charge ? inr(r.charge) : "—"}</span> },
    { id: "refund", header: "Refund", align: "right", sort: (r) => r.refundAmount ?? 0, cell: (r) => <span className="tabular-nums">{r.refundAmount ? inr(r.refundAmount) : "—"}</span> },
    { id: "cancelled", header: "Cancelled", hideBelow: "lg", sort: (r) => r.cancelledAt ?? "", cell: (r) => <span className="whitespace-nowrap text-[var(--muted)]">{fmtDate(r.cancelledAt)}</span> },
    {
      id: "status",
      header: "Refund Status",
      sort: (r) => r.refundStatus,
      cell: (r) => {
        const m = REFUND[r.refundStatus] ?? REFUND.none;
        return (
          <div>
            <Badge tone={m.tone}>{m.label}</Badge>
            {r.refundStatus === "approved" && r.refundDue && (
              <div className="mt-0.5 text-[10px] text-[var(--muted)]">due {fmtDate(r.refundDue)}</div>
            )}
          </div>
        );
      },
    },
    {
      id: "action",
      header: "",
      align: "right",
      cell: (r) => (
        <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
          {canApprove && r.refundStatus === "pending_approval" && (
            <form action={approveRefund}>
              <input type="hidden" name="id" value={r.id} />
              <SubmitButton className="btn-ghost" style={{ padding: "5px 12px", fontSize: 12 }} pendingLabel="…">
                Approve Refund
              </SubmitButton>
            </form>
          )}
          {canPay && r.refundStatus === "approved" && (
            <form action={markRefundPaid}>
              <input type="hidden" name="id" value={r.id} />
              <SubmitButton className="btn-ghost text-emerald-500" style={{ padding: "5px 12px", fontSize: 12 }} pendingLabel="…">
                Mark Paid
              </SubmitButton>
            </form>
          )}
        </div>
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
          id: "status",
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
      emptyMessage="No cancelled bookings yet."
    />
  );
}
