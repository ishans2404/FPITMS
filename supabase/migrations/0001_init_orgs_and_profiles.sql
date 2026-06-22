-- 0001_init_orgs_and_profiles.sql
-- Phase 1: organizational hierarchy + role-scoped profiles.
-- checkposts is created now as a schema hook for Phase 2 (Section 3 / Section 4)
-- even though no checkpost screens ship until then.

create extension if not exists "pgcrypto";

-- ── Enums ──────────────────────────────────────────────────────────────────
create type public.user_role as enum ('depot_staff', 'dfo', 'checkpost_staff', 'hq_analytics');
create type public.produce_category as enum ('timber', 'ntfp_mfp');
create type public.measurement_unit as enum ('cum', 'quintal', 'kg', 'nos', 'mt');
create type public.ledger_transaction_type as enum ('inward', 'outward');

-- ── Organizational hierarchy ────────────────────────────────────────────────
create table public.divisions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  created_at timestamptz not null default now()
);

create table public.depots (
  id uuid primary key default gen_random_uuid(),
  division_id uuid not null references public.divisions(id),
  name text not null,
  code text not null unique,
  location text,
  created_at timestamptz not null default now()
);

-- Phase 2 hook: checkpost verification staff are scoped to a checkpost, not a depot.
-- Table exists now so profiles/RLS don't need a breaking migration later.
create table public.checkposts (
  id uuid primary key default gen_random_uuid(),
  division_id uuid not null references public.divisions(id),
  name text not null,
  code text not null unique,
  location text,
  created_at timestamptz not null default now()
);

-- ── Profiles ─────────────────────────────────────────────────────────────
-- One row per auth.users id. Role + scope (depot/division/checkpost) drive every
-- RLS policy in this system. Profiles are NOT self-provisioned on signup —
-- role assignment is sensitive in a government system, so rows are created
-- manually by an administrator for Phase 1 (see docs/schema.md).
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role public.user_role not null,
  depot_id uuid references public.depots(id),
  division_id uuid references public.divisions(id),
  checkpost_id uuid references public.checkposts(id),
  created_at timestamptz not null default now()
);

-- ── Helper functions (security definer to avoid RLS self-recursion on profiles) ──
create or replace function public.current_user_role() returns public.user_role
language sql security definer stable set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.current_user_depot() returns uuid
language sql security definer stable set search_path = public as $$
  select depot_id from public.profiles where id = auth.uid();
$$;

create or replace function public.current_user_division() returns uuid
language sql security definer stable set search_path = public as $$
  select division_id from public.profiles where id = auth.uid();
$$;

-- ── RLS ──────────────────────────────────────────────────────────────────
alter table public.divisions enable row level security;
alter table public.depots enable row level security;
alter table public.checkposts enable row level security;
alter table public.profiles enable row level security;

-- Reference/org data: readable by any authenticated user, written only via migrations/admin for now.
create policy "divisions_select_authenticated" on public.divisions
  for select using (auth.role() = 'authenticated');

create policy "depots_select_authenticated" on public.depots
  for select using (auth.role() = 'authenticated');

create policy "checkposts_select_authenticated" on public.checkposts
  for select using (auth.role() = 'authenticated');

-- Profiles: a user always sees their own row; a DFO can see staff profiles in their division
-- (needed to show "recorded by" names in the dashboard). No client-side insert/update policy —
-- provisioning is manual/admin for Phase 1.
create policy "profiles_select_own" on public.profiles
  for select using (id = auth.uid());

create policy "profiles_select_dfo_division" on public.profiles
  for select using (
    public.current_user_role() = 'dfo'
    and division_id = public.current_user_division()
  );
