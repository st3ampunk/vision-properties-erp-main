-- ============================================================================
-- Vision Properties — Customer form tweaks
-- Adds email + country to customers. (Anniversary date is dropped from the UI
-- but the column is left in place to preserve any existing data.)
-- Idempotent — safe to run on an existing database.
-- ============================================================================
alter table customers
  add column if not exists email   text,
  add column if not exists country text;
