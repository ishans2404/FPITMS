-- 0003_stock_ledger.sql
-- Phase 1: the append-only inward/outward ledger. This table is the source of
-- truth for stock; balances are always derived, never stored or hand-edited
-- (Section 7 — Domain Glossary, "Inward / Outward").
--
-- Immutability is enforced structurally, not by convention: only SELECT and
-- INSERT policies exist below. There is no UPDATE or DELETE policy, so RLS
-- denies both by default once enabled. Corrections must be new rows that
-- reference the original via reversal_of.

create table public.stock_ledger (
  id uuid primary key default gen_random_uuid(),
  depot_id uuid not null references public.depots(id),
  product_id uuid not null references public.product_master(id),
  transaction_type public.ledger_transaction_type not null,
  quantity numeric(12, 3) not null check (quantity > 0),
  unit public.measurement_unit not null,
  batch_lot_no text not null,
  quality_grade text,
  source_or_destination text not null,
  -- Phase 2 hooks: nullable now, populated once the transit module ships.
  vehicle_reg_no text,
  driver_name text,
  transit_pass_ref text,
  remarks text,
  -- Correction lineage: a reversal entry points back at the row it corrects.
  reversal_of uuid references public.stock_ledger(id),
  recorded_by uuid not null references public.profiles(id) default auth.uid(),
  recorded_at timestamptz not null default now()
);

create index stock_ledger_depot_product_idx on public.stock_ledger (depot_id, product_id);
create index stock_ledger_recorded_at_idx on public.stock_ledger (recorded_at desc);
create index stock_ledger_reversal_of_idx on public.stock_ledger (reversal_of);

-- Guard the reversal mechanism itself: a reversal must match the original
-- entry's depot + product and use the opposite transaction_type, so it can
-- never silently corrupt a different depot/product's balance.
create or replace function public.validate_stock_reversal() returns trigger
language plpgsql set search_path = public as $$
declare
  orig record;
begin
  if new.reversal_of is not null then
    select depot_id, product_id, transaction_type into orig
    from public.stock_ledger where id = new.reversal_of;

    if orig is null then
      raise exception 'reversal_of references a non-existent ledger entry';
    end if;

    if orig.depot_id <> new.depot_id or orig.product_id <> new.product_id then
      raise exception 'a reversal entry must match the depot and product of the original entry';
    end if;

    if orig.transaction_type = new.transaction_type then
      raise exception 'a reversal entry must use the opposite transaction_type of the original entry';
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_validate_stock_reversal
  before insert on public.stock_ledger
  for each row execute function public.validate_stock_reversal();

-- ── RLS ──────────────────────────────────────────────────────────────────
alter table public.stock_ledger enable row level security;

create policy "stock_ledger_select_depot_staff" on public.stock_ledger
  for select using (
    public.current_user_role() = 'depot_staff'
    and depot_id = public.current_user_depot()
  );

create policy "stock_ledger_select_dfo" on public.stock_ledger
  for select using (
    public.current_user_role() = 'dfo'
    and depot_id in (select id from public.depots where division_id = public.current_user_division())
  );

-- Phase 3 hook: HQ/PCCF gets statewide read access. Policy added now since it's
-- additive and harmless with no hq_analytics accounts provisioned yet.
create policy "stock_ledger_select_hq" on public.stock_ledger
  for select using (public.current_user_role() = 'hq_analytics');

create policy "stock_ledger_insert_depot_staff" on public.stock_ledger
  for insert with check (
    public.current_user_role() = 'depot_staff'
    and depot_id = public.current_user_depot()
    and recorded_by = auth.uid()
  );

-- Intentionally no UPDATE or DELETE policy — see header comment.

-- ── Derived balance (never a stored/editable total) ─────────────────────────
-- security_invoker means this view runs with the *querying user's* RLS, not the
-- view owner's — a depot_staff querying stock_balance only ever sums rows they
-- could already see in stock_ledger directly.
create view public.stock_balance
  with (security_invoker = true) as
select
  depot_id,
  product_id,
  sum(case when transaction_type = 'inward' then quantity else -quantity end) as current_quantity
from public.stock_ledger
group by depot_id, product_id;
