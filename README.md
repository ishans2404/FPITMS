# FPITMS — Forest Produce Inventory & Transit Management System

Chhattisgarh Forest Department. Built per `FPITMS_Proposal.docx` and the
project brief (entities, roles, phases, design tokens). This README covers
Phase 1: **Centralized Inventory Management**.

## ⚠️ Security — read before anything else

Never put the Supabase **service role key** in `frontend/.env` or anywhere
prefixed `VITE_`. Vite inlines `VITE_*` variables into the browser bundle —
that's equivalent to publishing root database access. This frontend only ever
needs `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` (see
`frontend/.env.example`). If a service role key has ever been pasted into a
chat, doc, or committed file, treat it as compromised and regenerate it from
Supabase → Project Settings → API.

## What's built (Phase 1)

- **Schema + RLS**: `supabase/migrations/0001-0003` — divisions, depots,
  profiles, product master, and an append-only stock ledger with a derived
  `stock_balance` view. See `docs/schema.md` for the full design rationale
  and `docs/decisions/` for the two key ADRs (no NTPS integration, ledger
  immutability via RLS).
- **Frontend**: React + Vite + TS + Tailwind (DESIGN.md tokens, light/app
  surface per the brief's Section 6), TanStack Query + supabase-js,
  react-hook-form + zod. Three screens: Stock Dashboard, Stock Ledger
  (inward/outward entry + correction), Product Master.
- **Auth**: email/password via Supabase Auth. Accounts are provisioned
  manually by an administrator — see docs/schema.md for why.

## Getting started

```bash
cd frontend
cp .env.example .env   # fill in VITE_SUPABASE_URL + VITE_SUPABASE_PUBLISHABLE_KEY only
npm install
npm run dev
```

### Apply the database schema

Your Supabase project is already linked to this GitHub repo with
deploy-on-merge to `main` enabled, so merging `supabase/migrations/*.sql`
into `main` will apply them automatically. To apply them locally/manually
first (recommended before merging to production):

```bash
npx supabase login
npx supabase link --project-ref iqeadxvtmxwxevvhcmvu
npx supabase db push
```

Then seed reference data (divisions/depots/products — does **not** create
user accounts, see above):

```bash
npx supabase db execute -f supabase/seed.sql
```

### Create your first account

1. In the Supabase dashboard → Authentication → Users, create a user
   (email + password).
2. In the SQL editor, insert a matching `profiles` row, e.g.:
   ```sql
   insert into public.profiles (id, full_name, role, depot_id)
   values (
     '<auth-user-uuid>',
     'Your Name',
     'depot_staff',
     (select id from public.depots where code = 'RPR-D1')
   );
   ```
3. Sign in at `http://localhost:5173/login`.

## A real bug we hit and fixed while building this

`@supabase/supabase-js`'s current `latest` npm release (2.108.2) has a
generic-typing regression: any custom `Database` type causes every
`.select()` query result to silently infer as `never`, with no error at the
call site, and breaks `.insert()`/`.from()` table-name checking too. This is
reproducible with a two-field minimal schema, independent of anything
specific to FPITMS. `frontend/package.json` pins the exact version `2.45.4`
(not a `^` range) as a result — see the long comment at the top of
`frontend/src/types/database.ts`. Don't bump this dependency without
re-testing `npm run build` first.

## Project status / what's NOT here yet

- Phase 2 (transit module) and Phase 3 (reporting/analytics) — folders exist
  (`frontend/src/routes/transit`, `frontend/src/routes/reports`) but are
  empty; no routes are registered for them.
- `backend/` (FastAPI) is not scaffolded — Phase 1 doesn't need it (Section 5).
- No admin UI for account provisioning (manual for now, see above).
- DFO accounts can manage Product Master and will see the dashboard, but the
  Stock Ledger screen is currently single-depot-scoped (built for
  `depot_staff`); a division-wide ledger view is Phase 3 reporting territory.

## Folder structure

See Section 8 of the project brief — this repo follows it exactly. Key paths:

- `supabase/migrations/` — one file per schema change, applied in order.
- `docs/schema.md`, `docs/decisions/` — data model rationale and ADRs.
- `docs/dashboard-design-tokens.md` — how DESIGN.md maps onto this app.
- `frontend/src/routes/inventory/` — the three Phase 1 screens.
- `frontend/src/lib/queries/` — one TanStack Query hook file per entity.
