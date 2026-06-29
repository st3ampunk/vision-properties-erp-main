-- Add an optional Pincode to projects (Add Project form · location section).
-- Captured for reference next to District/City; nullable since it's optional.
alter table projects add column if not exists pincode text;
