-- seed.sql — demo organizational + reference data only.
-- Deliberately does NOT seed `profiles`: a profile row requires a real
-- auth.users row (created via Supabase Auth), and role assignment is a
-- manual/admin step for Phase 1 (see docs/schema.md).

insert into public.divisions (id, name, code) values
  ('11111111-1111-1111-1111-111111111111', 'Raipur Division', 'RPR'),
  ('22222222-2222-2222-2222-222222222222', 'Bilaspur Division', 'BSP')
on conflict (code) do nothing;

insert into public.depots (division_id, name, code, location) values
  ('11111111-1111-1111-1111-111111111111', 'Raipur Central Depot', 'RPR-D1', 'Raipur'),
  ('11111111-1111-1111-1111-111111111111', 'Dhamtari Depot', 'RPR-D2', 'Dhamtari'),
  ('22222222-2222-2222-2222-222222222222', 'Bilaspur Central Depot', 'BSP-D1', 'Bilaspur')
on conflict (code) do nothing;

insert into public.checkposts (division_id, name, code, location) values
  ('11111111-1111-1111-1111-111111111111', 'Raipur NH-30 Checkpost', 'RPR-CP1', 'NH-30, Raipur')
on conflict (code) do nothing;

insert into public.product_master (code, name, category, species, default_unit, description) values
  ('TBR-SAL', 'Sal Timber', 'timber', 'Shorea robusta', 'cum', 'Sawn and round sal timber'),
  ('TBR-TEAK', 'Teak Timber', 'timber', 'Tectona grandis', 'cum', 'Sawn and round teak timber'),
  ('MFP-TENDU', 'Tendu Leaves', 'ntfp_mfp', 'Diospyros melanoxylon', 'quintal', 'Bundled tendu leaves'),
  ('MFP-SALSEED', 'Sal Seed', 'ntfp_mfp', 'Shorea robusta', 'quintal', 'Collected sal seed'),
  ('MFP-GUM', 'Gum Karaya', 'ntfp_mfp', 'Sterculia urens', 'kg', 'Raw gum karaya')
on conflict (code) do nothing;
