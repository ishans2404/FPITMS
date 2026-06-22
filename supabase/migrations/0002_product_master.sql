-- 0002_product_master.sql
-- Phase 1: depot/product master data.

create table public.product_master (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  category public.produce_category not null,
  species text,
  default_unit public.measurement_unit not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.product_master enable row level security;

-- Read: any authenticated user (depot staff need this to log inward/outward entries).
create policy "product_master_select_authenticated" on public.product_master
  for select using (auth.role() = 'authenticated');

-- Write: scoped to 'dfo' for Phase 1. ASSUMPTION (flagged, not silently decided —
-- see docs/schema.md): the proposal names four roles and none is a generic "admin";
-- dfo is the closest fit for owning reference data. Revisit if a separate admin
-- role is introduced.
create policy "product_master_insert_dfo" on public.product_master
  for insert with check (public.current_user_role() = 'dfo');

create policy "product_master_update_dfo" on public.product_master
  for update using (public.current_user_role() = 'dfo')
  with check (public.current_user_role() = 'dfo');

-- No delete policy, intentionally: product_master rows are referenced by stock_ledger
-- history. Deactivate via is_active = false instead of deleting.
