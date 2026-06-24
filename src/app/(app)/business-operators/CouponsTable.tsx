"use client";

import { useState } from "react";
import DataTable, { type Column } from "@/components/DataTable";
import { Badge } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";
import { ROLE_LABELS, type Role } from "@/lib/roles";
import { COUPON_TYPES } from "@/lib/options";
import { issueCoupon } from "./actions";

export interface CouponRow {
  id: string;
  name: string;
  code: string | null;
  role: Role;
  balances: Record<string, number>; // type -> quantity
}

const ROLE_TONE: Record<string, "blue" | "green" | "gray"> = {
  senior_director: "blue",
  director: "blue",
  business_manager: "green",
  business_partner: "gray",
};

export default function CouponsTable({ rows }: { rows: CouponRow[] }) {
  const [issuing, setIssuing] = useState<CouponRow | null>(null);

  const columns: Column<CouponRow>[] = [
    {
      id: "name",
      header: "Sales Person",
      sort: (r) => r.name.toLowerCase(),
      cell: (r) => (
        <div>
          <div className="font-medium text-[var(--text)]">{r.name}</div>
          {r.code && <div className="font-mono text-xs text-[var(--muted)]">{r.code}</div>}
        </div>
      ),
    },
    { id: "role", header: "Role", sort: (r) => r.role, cell: (r) => <Badge tone={ROLE_TONE[r.role] ?? "gray"}>{ROLE_LABELS[r.role]}</Badge> },
    ...COUPON_TYPES.map((t) => ({
      id: t.value,
      header: t.label,
      align: "right" as const,
      sort: (r: CouponRow) => r.balances[t.value] ?? 0,
      cell: (r: CouponRow) => <span className="tabular-nums">{r.balances[t.value] ?? 0}</span>,
    })),
    {
      id: "action",
      header: "",
      align: "right" as const,
      cell: (r: CouponRow) => (
        <button type="button" onClick={() => setIssuing(r)} className="btn-ghost" style={{ padding: "5px 12px", fontSize: 12 }}>
          Issue
        </button>
      ),
    },
  ];

  return (
    <>
      <DataTable
        rows={rows}
        columns={columns}
        search={(r) => `${r.name} ${r.code ?? ""} ${ROLE_LABELS[r.role]}`}
        searchPlaceholder="Search sales person, ID…"
        filters={[
          {
            id: "role",
            label: "Role",
            options: (["senior_director", "director", "business_manager", "business_partner"] as Role[]).map((r) => ({ value: r, label: ROLE_LABELS[r] })),
            match: (r, v) => r.role === v,
          },
        ]}
        emptyMessage="No sales people yet."
      />
      {issuing && <IssueModal row={issuing} onClose={() => setIssuing(null)} />}
    </>
  );
}

function IssueModal({ row, onClose }: { row: CouponRow; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }} onClick={onClose}>
      <div className="card w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-sm font-semibold">Issue Coupon</h2>
        <p className="mt-1 text-xs text-[var(--muted)]">
          {row.name} {row.code ? `· ${row.code}` : ""} · {ROLE_LABELS[row.role]}
        </p>

        <form action={issueCoupon} className="mt-4 space-y-4" onSubmit={() => setTimeout(onClose, 0)}>
          <input type="hidden" name="user_id" value={row.id} />
          <div>
            <label className="label">Coupon Type</label>
            <select name="type" className="select" defaultValue="cab">
              {COUPON_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Quantity</label>
              <input name="quantity" type="number" min={0} className="input" defaultValue={1} />
            </div>
            <div>
              <label className="label">Value (₹, optional)</label>
              <input name="value" type="number" min={0} step="0.01" className="input" defaultValue={0} />
            </div>
          </div>
          <div>
            <label className="label">Note (optional)</label>
            <input name="note" className="input" placeholder="e.g. Performance reward" />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
            <SubmitButton pendingLabel="Issuing…">Issue</SubmitButton>
          </div>
        </form>
      </div>
    </div>
  );
}
