-- 0005_reporting_views.sql
-- Phase 3: Reporting & Analytics views.
-- All views use security_invoker = true — each view runs under the querying
-- user's RLS, so depot/division/statewide scoping from Phase 1/2 policies
-- carries through automatically. No extra WHERE filters needed in query hooks.

-- ── Stock Register (full ledger with human-readable joins) ─────────────────
create view public.v_stock_register
  with (security_invoker = true) as
select
  sl.id,
  sl.depot_id,
  sl.product_id,
  sl.recorded_at,
  sl.transaction_type,
  sl.quantity,
  sl.unit,
  sl.batch_lot_no,
  sl.quality_grade,
  sl.source_or_destination,
  sl.transit_pass_ref,
  sl.vehicle_reg_no,
  sl.driver_name,
  sl.remarks,
  sl.reversal_of,
  p.name        as product_name,
  p.code        as product_code,
  p.category    as product_category,
  d.name        as depot_name,
  d.code        as depot_code,
  dv.name       as division_name,
  dv.code       as division_code,
  pr.full_name  as recorded_by_name
from  public.stock_ledger    sl
join  public.product_master  p  on p.id  = sl.product_id
join  public.depots          d  on d.id  = sl.depot_id
join  public.divisions       dv on dv.id = d.division_id
left join public.profiles    pr on pr.id = sl.recorded_by;

-- ── Transit Pass Report (passes with human-readable joins) ─────────────────
create view public.v_transit_pass_report
  with (security_invoker = true) as
select
  tp.id,
  tp.depot_id,
  tp.product_id,
  tp.pass_no,
  tp.issued_at,
  tp.valid_until,
  tp.status,
  tp.quantity,
  tp.unit,
  tp.source_description,
  tp.destination,
  tp.driver_name,
  tp.driver_license_no,
  tp.batch_lot_ref,
  tp.remarks,
  p.name           as product_name,
  p.code           as product_code,
  p.category       as product_category,
  v.registration_no as vehicle_reg_no,
  v.vehicle_type,
  d.name           as depot_name,
  d.code           as depot_code,
  dv.name          as division_name,
  dv.code          as division_code,
  pr.full_name     as issued_by_name
from  public.transit_passes  tp
join  public.product_master  p  on p.id  = tp.product_id
join  public.depots          d  on d.id  = tp.depot_id
join  public.divisions       dv on dv.id = d.division_id
left join public.vehicles    v  on v.id  = tp.vehicle_id
left join public.profiles    pr on pr.id = tp.issued_by;

-- ── Checkpost Verification Report ─────────────────────────────────────────
-- security_invoker applies RLS from both checkpost_verifications AND
-- transit_passes simultaneously — DFO sees only verifications for passes
-- issued from their division's depots; HQ sees all.
create view public.v_checkpost_verification_report
  with (security_invoker = true) as
select
  cv.id,
  cv.transit_pass_id,
  cv.checkpost_id,
  cv.verified_at,
  cv.vehicle_reg_observed,
  cv.verified_quantity,
  cv.quantity_match,
  cv.discrepancy_notes,
  tp.pass_no,
  tp.quantity    as pass_quantity,
  tp.unit,
  tp.destination,
  tp.status      as pass_status,
  p.name         as product_name,
  p.code         as product_code,
  cp.name        as checkpost_name,
  cp.code        as checkpost_code,
  d.name         as depot_name,
  d.code         as depot_code,
  dv.name        as division_name,
  v.registration_no as vehicle_reg_no,
  pr.full_name   as verified_by_name
from  public.checkpost_verifications cv
join  public.transit_passes    tp on tp.id = cv.transit_pass_id
join  public.product_master    p  on p.id  = tp.product_id
join  public.checkposts        cp on cp.id = cv.checkpost_id
join  public.depots            d  on d.id  = tp.depot_id
join  public.divisions         dv on dv.id = d.division_id
left join public.vehicles      v  on v.id  = cv.vehicle_id
left join public.profiles      pr on pr.id = cv.verified_by;

-- ── Daily Transaction Summary (analytics charts) ──────────────────────────
-- Excludes reversal/correction rows so headline numbers aren't inflated.
-- Grouped by day + depot so DFO can see per-depot breakdown and HQ sees all.
create view public.v_daily_summary
  with (security_invoker = true) as
select
  date_trunc('day', sl.recorded_at)::date as day,
  sl.depot_id,
  d.name     as depot_name,
  d.code     as depot_code,
  dv.id      as division_id,
  dv.name    as division_name,
  sl.transaction_type,
  count(*)::int              as entry_count,
  sum(sl.quantity)::numeric  as total_quantity
from  public.stock_ledger  sl
join  public.depots        d  on d.id  = sl.depot_id
join  public.divisions     dv on dv.id = d.division_id
where sl.reversal_of is null
group by 1, 2, 3, 4, 5, 6, 7;