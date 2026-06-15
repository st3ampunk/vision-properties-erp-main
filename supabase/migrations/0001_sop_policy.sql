-- ============================================================================
-- Vision Properties — SOP v1.0 alignment migration
-- Adds CONFIGURABLE policy parameters (no hard-coded SOP numbers) plus the
-- columns needed for the Cancellation/Refund (§3) and Plot Transfer (§7)
-- workflows. Safe to run against an existing database — every statement is
-- idempotent.
--
-- Run in the Supabase SQL Editor.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- §2–§3–§7  Per-project, editable policy configuration.
-- Defaults mirror SOP v1.0 but every value is changeable per project
-- (the SOP itself allows Chennai vs Trichy differences).
-- ---------------------------------------------------------------------------
alter table projects
  -- §2 Booking advance floor: advance = max(advance_percent %, this amount)
  add column if not exists advance_min_amount      numeric(14,2) not null default 50000,
  -- §3 Cancellation & refund
  add column if not exists cancel_full_refund_days  integer       not null default 3,
  add column if not exists cancellation_charge      numeric(14,2) not null default 5000,
  add column if not exists refund_processing_days   integer       not null default 5,
  -- §7 Plot transfer / change
  add column if not exists transfer_charge          numeric(14,2) not null default 5000;

-- ---------------------------------------------------------------------------
-- §3  Refund tracking on the booking record.
-- refund_status: none | pending_approval | approved | paid
-- ---------------------------------------------------------------------------
alter table bookings
  add column if not exists cancellation_reason  text,
  add column if not exists cancellation_charge  numeric(14,2),
  add column if not exists refund_amount         numeric(16,2),
  add column if not exists refund_status         text not null default 'none',
  add column if not exists refund_approved_by    uuid references users(id) on delete set null,
  add column if not exists refund_approved_at    timestamptz,
  add column if not exists refund_due_date       date,
  add column if not exists refund_paid_at        timestamptz;

-- ---------------------------------------------------------------------------
-- §7  Plot transfer / change log.
-- kind: upgrade | lateral | downgrade
-- ---------------------------------------------------------------------------
create table if not exists plot_transfers (
  id            uuid primary key default gen_random_uuid(),
  booking_id    uuid not null references bookings(id) on delete cascade,
  from_plot_id  uuid not null references plots(id) on delete restrict,
  to_plot_id    uuid not null references plots(id) on delete restrict,
  from_value    numeric(16,2) not null default 0,
  to_value      numeric(16,2) not null default 0,
  kind          text not null,                 -- upgrade | lateral | downgrade
  charge        numeric(14,2) not null default 0,
  remarks       text,
  approved_by   uuid references users(id) on delete set null,
  created_by    uuid references users(id) on delete set null,
  created_at    timestamptz not null default now()
);
create index if not exists idx_transfers_booking on plot_transfers(booking_id);
