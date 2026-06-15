-- ============================================================================
-- Vision Properties — Plot grouping within a project
-- A project (top) has many plots, and those plots are organised into groups /
-- categories that belong to the project (e.g. Phase 1, Premium, Corner).
-- Idempotent — safe to run on an existing database.
-- ============================================================================

create table if not exists plot_categories (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id) on delete cascade,
  name        text not null,
  description text,
  created_at  timestamptz not null default now(),
  unique (project_id, name)
);
create index if not exists idx_plot_categories_project on plot_categories(project_id);

alter table plots
  add column if not exists plot_category_id uuid references plot_categories(id) on delete set null;
create index if not exists idx_plots_category on plots(plot_category_id);
  