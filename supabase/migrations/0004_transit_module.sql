-- 0004_transit_module.sql
-- Phase 2: Standalone CG Transit Module
--
-- Covers: vehicle registry, CG-specific transit pass issuance, and
-- checkpost verification events.
--
-- Design decisions:
-- • transit_passes is NOT linked to NTPS (see ADR 0001). pass_no is a
--   free-text CG Forest Department permit number, not a FK into any
--   external system.
-- • checkpost_verifications is append-only (no UPDATE/DELETE policy),
--   matching the audit-immutability principle of stock_ledger.
-- • transit_passes allows UPDATE on status — a pass legitimately moves
--   through issued → in_transit → verified → completed or cancelled.
--   The status column is the only mutable field.
-- • stock_ledger.transit_pass_ref (already nullable from Phase 1) stores
--   transit_passes.pass_no as free text — no FK added to keep the
--   stock_ledger schema stable (avoids a migration touching an immutable
--   table whose RLS is load-bearing).

-- ── Enums ──────────────────────────────────────────────────────────────────
create type public.transit_pass_status as enum (
  'issued',      -- Pass created; vehicle not yet departed
  'in_transit',  -- Vehicle on road (depot staff marks after loading)
  'verified',    -- At least one checkpost has verified
  'completed',   -- Destination confirmed receipt (Phase 3 hook)
  'cancelled'    -- Voided before transit began
);

create type public.vehicle_type as enum (
  'truck', 'tractor', 'pickup', 'tempo', 'other'
);

-- ── Vehicle registry ────────────────────────────────────────────────────────
-- Shared reference table — any depot can register vehicles; any authenticated
-- user can read it (checkpost staff need it for verification lookups).
create table public.vehicles (
  id               uuid    primary key default gen_random_uuid(),
  registration_no  text    not null unique,
  vehicle_type     public.vehicle_type not null default 'truck',
  owner_name       text,
  capacity_value   numeric(10, 3),
  capacity_unit    public.measurement_unit,
  is_active        boolean not null default true,
  registered_by    uuid    not null references public.profiles(id) default auth.uid(),
  created_at       timestamptz not null default now()
);

alter table public.vehicles enable row level security;

create policy "vehicles_select_authenticated" on public.vehicles
  for select using (auth.role() = 'authenticated');

create policy "vehicles_insert_depot_or_dfo" on public.vehicles
  for insert with check (
    public.current_user_role() in ('depot_staff', 'dfo')
  );

-- Depot staff / DFO can deactivate (is_active = false); no hard deletes
-- because vehicles appear in historical transit_passes.
create policy "vehicles_update_depot_or_dfo" on public.vehicles
  for update
  using  (public.current_user_role() in ('depot_staff', 'dfo'))
  with check (public.current_user_role() in ('depot_staff', 'dfo'));

-- ── Transit passes ──────────────────────────────────────────────────────────
create table public.transit_passes (
  id                   uuid    primary key default gen_random_uuid(),
  pass_no              text    not null unique,   -- CG Forest Dept permit no.
  depot_id             uuid    not null references public.depots(id),
  vehicle_id           uuid    references public.vehicles(id),
  driver_name          text,
  driver_license_no    text,
  product_id           uuid    not null references public.product_master(id),
  quantity             numeric(12, 3) not null check (quantity > 0),
  unit                 public.measurement_unit not null,
  source_description   text    not null,  -- human-readable; depot staff fills
  destination          text    not null,  -- buyer / processing unit / etc.
  batch_lot_ref        text,              -- matches stock_ledger.batch_lot_no
  issued_at            timestamptz not null default now(),
  valid_until          timestamptz,
  status               public.transit_pass_status not null default 'issued',
  remarks              text,
  issued_by            uuid    not null references public.profiles(id) default auth.uid(),
  created_at           timestamptz not null default now()
);

create index transit_passes_depot_idx      on public.transit_passes (depot_id);
create index transit_passes_status_idx     on public.transit_passes (status);
create index transit_passes_issued_at_idx  on public.transit_passes (issued_at desc);
create index transit_passes_vehicle_idx    on public.transit_passes (vehicle_id)
  where vehicle_id is not null;
create index transit_passes_pass_no_idx    on public.transit_passes (pass_no);

alter table public.transit_passes enable row level security;

-- Depot staff: own depot only
create policy "transit_passes_select_depot_staff" on public.transit_passes
  for select using (
    public.current_user_role() = 'depot_staff'
    and depot_id = public.current_user_depot()
  );

-- DFO: all depots in their division
create policy "transit_passes_select_dfo" on public.transit_passes
  for select using (
    public.current_user_role() = 'dfo'
    and depot_id in (
      select id from public.depots
      where division_id = public.current_user_division()
    )
  );

-- Checkpost staff: ALL passes — they verify vehicles from any depot
create policy "transit_passes_select_checkpost" on public.transit_passes
  for select using (public.current_user_role() = 'checkpost_staff');

create policy "transit_passes_select_hq" on public.transit_passes
  for select using (public.current_user_role() = 'hq_analytics');

-- Insert: depot staff for their depot; DFO for their division's depots
create policy "transit_passes_insert_depot_staff" on public.transit_passes
  for insert with check (
    public.current_user_role() = 'depot_staff'
    and depot_id = public.current_user_depot()
    and issued_by = auth.uid()
  );

create policy "transit_passes_insert_dfo" on public.transit_passes
  for insert with check (
    public.current_user_role() = 'dfo'
    and depot_id in (
      select id from public.depots
      where division_id = public.current_user_division()
    )
    and issued_by = auth.uid()
  );

-- Status update only — the issuer can advance their own pass's status.
-- core fields (quantity, product, destination) are NOT allowed to change
-- via a policy check on the status field only.
create policy "transit_passes_update_status_depot_staff" on public.transit_passes
  for update
  using (
    public.current_user_role() = 'depot_staff'
    and depot_id = public.current_user_depot()
  )
  with check (
    public.current_user_role() = 'depot_staff'
    and depot_id = public.current_user_depot()
  );

create policy "transit_passes_update_status_dfo" on public.transit_passes
  for update
  using (
    public.current_user_role() = 'dfo'
    and depot_id in (
      select id from public.depots
      where division_id = public.current_user_division()
    )
  )
  with check (
    public.current_user_role() = 'dfo'
    and depot_id in (
      select id from public.depots
      where division_id = public.current_user_division()
    )
  );

-- ── Checkpost verifications ─────────────────────────────────────────────────
-- Append-only (no UPDATE/DELETE policy) — a verification event is a
-- timestamped audit record, not an editable document.
create table public.checkpost_verifications (
  id                    uuid    primary key default gen_random_uuid(),
  transit_pass_id       uuid    not null references public.transit_passes(id),
  checkpost_id          uuid    not null references public.checkposts(id),
  vehicle_id            uuid    references public.vehicles(id),
  vehicle_reg_observed  text,           -- actual reg seen (may differ from pass)
  verified_quantity     numeric(12, 3), -- actual quantity sighted
  quantity_match        boolean,        -- does it match transit_pass.quantity?
  discrepancy_notes     text,
  verified_by           uuid    not null references public.profiles(id) default auth.uid(),
  verified_at           timestamptz not null default now()
);

create index chk_verif_transit_pass_idx on public.checkpost_verifications (transit_pass_id);
create index chk_verif_checkpost_idx    on public.checkpost_verifications (checkpost_id);
create index chk_verif_verified_at_idx  on public.checkpost_verifications (verified_at desc);

alter table public.checkpost_verifications enable row level security;

-- Checkpost staff see verifications made at their checkpost only
create policy "chk_verif_select_checkpost" on public.checkpost_verifications
  for select using (
    public.current_user_role() = 'checkpost_staff'
    and checkpost_id = (
      select checkpost_id from public.profiles where id = auth.uid()
    )
  );

create policy "chk_verif_select_dfo" on public.checkpost_verifications
  for select using (public.current_user_role() = 'dfo');

create policy "chk_verif_select_hq" on public.checkpost_verifications
  for select using (public.current_user_role() = 'hq_analytics');

-- Only checkpost staff can insert; no UPDATE or DELETE policy
create policy "chk_verif_insert_checkpost" on public.checkpost_verifications
  for insert with check (
    public.current_user_role() = 'checkpost_staff'
    and checkpost_id = (
      select checkpost_id from public.profiles where id = auth.uid()
    )
    and verified_by = auth.uid()
  );

-- ── helper: current_user_checkpost (mirrors current_user_depot pattern) ────
create or replace function public.current_user_checkpost() returns uuid
language sql security definer stable set search_path = public as $$
  select checkpost_id from public.profiles where id = auth.uid();
$$;