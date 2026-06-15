"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import CustomerFields from "@/components/CustomerFields";
import { NOMINEE_RELATIONSHIPS, PAYMENT_MODES } from "@/lib/options";
import { createBooking } from "../actions";

interface MiniUser {
  id: string;
  full_name: string;
}
interface MiniCustomer {
  id: string;
  name: string;
  mobile: string;
}
interface Props {
  mode: "blocking" | "booking";
  plot: { id: string; block: string; plot_no: string; sqft: number; price_per_sqft: number };
  project: {
    name: string;
    advance_percent: number;
    blocking_amount: number;
    blocking_window_hours: number;
    booking_window_days: number;
  };
  customers: MiniCustomer[];
  partners: MiniUser[];
  directors: MiniUser[];
}

const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

export default function BookingForm({ mode, plot, project, customers, partners, directors }: Props) {
  const value = useMemo(() => Math.round(plot.sqft * plot.price_per_sqft), [plot]);
  const defaultAdvance = Math.round((value * project.advance_percent) / 100);

  const [useExisting, setUseExisting] = useState(customers.length > 0);
  const [customerId, setCustomerId] = useState("");
  const [advance, setAdvance] = useState(defaultAdvance);
  const [blockAmt, setBlockAmt] = useState(project.blocking_amount);
  const [partnerName, setPartnerName] = useState("");
  const [directorName, setDirectorName] = useState("");

  const paidNowDefault = mode === "blocking" ? project.blocking_amount : defaultAdvance;

  return (
    <form action={createBooking} className="max-w-4xl space-y-6">
      <input type="hidden" name="book_mode" value={mode} />
      <input type="hidden" name="plot_id" value={plot.id} />

      {/* Mode summary */}
      <div className="card border-[var(--accent)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold capitalize">{mode} — {project.name}</p>
            <p className="text-xs text-[var(--muted)]">
              Plot {plot.block}-{plot.plot_no} · {plot.sqft} sq.ft · {inr(plot.price_per_sqft)}/sq.ft
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[var(--muted)]">Total Plot Value</p>
            <p className="text-lg font-semibold">{inr(value)}</p>
          </div>
        </div>
        <p className="mt-3 text-xs text-[var(--muted)]">
          {mode === "blocking"
            ? `Blocking holds the plot for ${project.blocking_window_hours} hours. Convert to a booking before it expires or the plot returns to the company.`
            : `Booking requires ${project.advance_percent}% advance. Complete full payment within ${project.booking_window_days} days or the plot returns to the company.`}
        </p>
      </div>

      {/* Customer Details */}
      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Customer Details</h2>
          {customers.length > 0 && (
            <div className="flex gap-2 text-xs">
              <button
                type="button"
                onClick={() => setUseExisting(true)}
                className={`rounded-full border px-3 py-1 ${useExisting ? "border-[var(--accent)] text-[var(--accent)]" : "text-[var(--muted)]"}`}
              >
                Existing
              </button>
              <button
                type="button"
                onClick={() => setUseExisting(false)}
                className={`rounded-full border px-3 py-1 ${!useExisting ? "border-[var(--accent)] text-[var(--accent)]" : "text-[var(--muted)]"}`}
              >
                New
              </button>
            </div>
          )}
        </div>

        {useExisting ? (
          <div>
            <label className="label">Select Customer *</label>
            <select
              name="customer_id"
              className="select"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              required
            >
              <option value="">Select an existing customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.mobile}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-[var(--muted)]">
              Not listed? <Link href="/customers/new" className="text-[var(--accent)]">Add a customer</Link> or switch to “New”.
            </p>
          </div>
        ) : (
          <CustomerFields />
        )}
      </div>

      {/* Project / Plot Details (snapshot) */}
      <div className="card">
        <h2 className="mb-4 text-sm font-semibold">Project Details</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Readonly label="12. Project Name" value={project.name} />
          <Readonly label="13. Block" value={plot.block} />
          <Readonly label="14. Plot No — Sq.ft" value={`${plot.plot_no} — ${plot.sqft}`} />
        </div>
      </div>

      {/* Nominee Details */}
      <div className="card">
        <h2 className="mb-4 text-sm font-semibold">Nominee Details</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="label">15. Nominee Name</label>
            <input name="nominee_name" className="input" />
          </div>
          <div>
            <label className="label">16. Nominee Mobile</label>
            <input name="nominee_mobile" className="input" />
          </div>
          <div>
            <label className="label">17. Nominee Relationship</label>
            <select name="nominee_relationship" className="select" defaultValue="">
              <option value="">Select</option>
              {NOMINEE_RELATIONSHIPS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Partner Details */}
      <div className="card">
        <h2 className="mb-4 text-sm font-semibold">Partner Details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">18-19. Business Partner</label>
            <select
              name="partner_id"
              className="select"
              defaultValue=""
              onChange={(e) => setPartnerName(e.target.selectedOptions[0]?.dataset.name ?? "")}
            >
              <option value="">Select partner</option>
              {partners.map((p) => (
                <option key={p.id} value={p.id} data-name={p.full_name}>
                  {p.full_name}
                </option>
              ))}
            </select>
            <input type="hidden" name="partner_name" value={partnerName} />
          </div>
          <div>
            <label className="label">20-21. Director</label>
            <select
              name="director_id"
              className="select"
              defaultValue=""
              onChange={(e) => setDirectorName(e.target.selectedOptions[0]?.dataset.name ?? "")}
            >
              <option value="">Select director</option>
              {directors.map((d) => (
                <option key={d.id} value={d.id} data-name={d.full_name}>
                  {d.full_name}
                </option>
              ))}
            </select>
            <input type="hidden" name="director_name" value={directorName} />
          </div>
        </div>
      </div>

      {/* Payment Details */}
      <div className="card">
        <h2 className="mb-4 text-sm font-semibold">Payment Details</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="label">22. Tentative Registration Date</label>
            <input name="tentative_registration_date" type="date" className="input" />
          </div>
          <div>
            <label className="label">23. Mode of Payment</label>
            <select name="mode_of_payment" className="select" defaultValue="">
              <option value="">Select</option>
              {PAYMENT_MODES.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">24. Loan Token By</label>
            <select name="loan_token_by" className="select" defaultValue="">
              <option value="">Select</option>
              <option value="customer">Customer</option>
              <option value="director">Director</option>
            </select>
          </div>
          <div>
            <label className="label">25. Booked Date</label>
            <input name="booked_date" type="date" className="input" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">26. Remarks</label>
            <input name="remarks" className="input" />
          </div>
        </div>

        <div className="mt-4 grid gap-4 border-t pt-4 sm:grid-cols-3">
          {mode === "blocking" ? (
            <div>
              <label className="label">Blocking Amount (₹)</label>
              <input
                name="blocking_amount"
                type="number"
                className="input"
                value={blockAmt}
                onChange={(e) => setBlockAmt(Number(e.target.value))}
              />
            </div>
          ) : (
            <div>
              <label className="label">Advance Required (₹) — {project.advance_percent}%</label>
              <input
                name="advance_required"
                type="number"
                className="input"
                value={advance}
                onChange={(e) => setAdvance(Number(e.target.value))}
              />
            </div>
          )}
          <div>
            <label className="label">Amount Paid Now (₹)</label>
            <input name="amount_paid_now" type="number" className="input" defaultValue={paidNowDefault} min={0} />
          </div>
          <div>
            <label className="label">Payment Mode</label>
            <select name="payment_mode" className="select" defaultValue="">
              <option value="">Select</option>
              {PAYMENT_MODES.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Link href={`/plots/${plot.id}`} className="btn-ghost">Cancel</Link>
        <button type="submit" className="btn-primary">
          {mode === "blocking" ? "Block Plot" : "Book Plot"}
        </button>
      </div>
    </form>
  );
}

function Readonly({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="rounded-lg border bg-[var(--surface-2)] px-3 py-2 text-sm">{value}</div>
    </div>
  );
}
