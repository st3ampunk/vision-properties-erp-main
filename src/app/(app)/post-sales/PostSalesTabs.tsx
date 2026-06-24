"use client";

import { useState } from "react";
import { inr } from "@/lib/format";
import { StatCard } from "@/components/ui";
import PaymentsWorkspace from "../payments/PaymentsWorkspace";
import { type PaymentRow } from "../payments/PaymentsTable";
import { type LedgerRow } from "../payments/PaymentLedger";
import ReceiptsTable, { type ReceiptRow } from "../payments/ReceiptsTable";
import CancellationsTable, { type CancellationRow } from "./CancellationsTable";

type Tab = "part" | "receipts" | "cancel";

export interface PostSalesTotals {
  dealValue: number;
  received: number;
  outstanding: number;
  refunds: number;
  collected: number;
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors"
      style={
        active
          ? { background: "var(--surface)", color: "var(--text)", boxShadow: "0 1px 2px rgba(0,0,0,0.25)" }
          : { background: "transparent", color: "var(--muted)" }
      }
    >
      {children}
    </button>
  );
}

// Single Post-Sales surface: Part Payment / Fully Paid Receipt / Cancellation as
// tabs over one page (admin). Each tab renders its own dataset + component.
export default function PostSalesTabs({
  deals,
  ledger,
  receipts,
  cancelRows,
  canApproveRefund,
  canPayRefund,
  totals,
  initialTab = "part",
}: {
  deals: PaymentRow[];
  ledger: LedgerRow[];
  receipts: ReceiptRow[];
  cancelRows: CancellationRow[];
  canApproveRefund: boolean;
  canPayRefund: boolean;
  totals: PostSalesTotals;
  initialTab?: Tab;
}) {
  const [tab, setTab] = useState<Tab>(initialTab);

  return (
    <div className="space-y-5">
      <div
        className="inline-flex flex-wrap gap-1 rounded-lg border p-1"
        style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}
      >
        <TabButton active={tab === "part"} onClick={() => setTab("part")}>
          Part Payment
        </TabButton>
        <TabButton active={tab === "receipts"} onClick={() => setTab("receipts")}>
          Fully Paid Receipt
        </TabButton>
        <TabButton active={tab === "cancel"} onClick={() => setTab("cancel")}>
          Cancellation
        </TabButton>
      </div>

      {tab === "part" && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard label="Deal Value" value={inr(totals.dealValue)} />
            <StatCard label="Received" value={inr(totals.received)} />
            <StatCard label="Outstanding" value={inr(totals.outstanding)} />
            <StatCard label="Refunds" value={inr(totals.refunds)} />
          </div>
          <PaymentsWorkspace ledger={ledger} deals={deals} />
        </div>
      )}

      {tab === "receipts" && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <StatCard label="Fully Paid" value={String(receipts.length)} />
            <StatCard label="Collected Value" value={inr(totals.collected)} />
            <StatCard label="Net Received" value={inr(totals.received)} />
          </div>
          <ReceiptsTable rows={receipts} />
        </div>
      )}

      {tab === "cancel" && (
        <CancellationsTable rows={cancelRows} canApprove={canApproveRefund} canPay={canPayRefund} />
      )}
    </div>
  );
}
