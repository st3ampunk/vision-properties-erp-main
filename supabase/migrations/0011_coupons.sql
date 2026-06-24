-- ============================================================================
-- 0011 — Coupons / tokens issued to sales people
--
-- A ledger of coupons/tokens granted to a salesperson. Admin can issue EXTRA
-- coupons here (e.g. a Cab Token to a Director). A person's balance for a type
-- is the sum of their rows. (Auto-issuance + redemption come later.)
--   type: cab | tools | digital | gold
--   source: admin (manual) | auto (system)
-- ============================================================================

create table if not exists coupons (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users(id) on delete cascade,
  type        text not null,
  quantity    integer not null default 0,
  value       numeric(14,2) not null default 0,
  source      text not null default 'admin',
  note        text,
  issued_by   uuid references users(id) on delete set null,
  created_at  timestamptz not null default now()
);
create index if not exists idx_coupons_user on coupons(user_id);
create index if not exists idx_coupons_type on coupons(type);
