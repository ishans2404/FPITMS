# FPITMS — Phase 1 Data Model

## Entities

| Table | Purpose | Phase |
|---|---|---|
| `divisions` | Top of the org hierarchy (Section 7). | 1 |
| `depots` | Belongs to a division. Where stock physically lives. | 1 |
| `checkposts` | Schema hook only — no UI yet. Belongs to a division; used by `checkpost_staff` from Phase 2. | hook |
| `profiles` | One row per `auth.users.id`. Carries `role` + scope (`depot_id` / `division_id` / `checkpost_id`). Drives every RLS policy. | 1 |
| `product_master` | Reference data for timber / NTFP-MFP products. | 1 |
| `stock_ledger` | Append-only inward/outward transactions. The single source of truth for stock. | 1 |
| `stock_balance` | A *view*, not a table — `SUM(inward) - SUM(outward)` grouped by depot + product. Never stored, never hand-edited. | 1 |

## Why no `stock_total` column anywhere

Section 7 is explicit: "the ledger is the source of truth, the balance is a derived view." Storing a running balance on `depots` or `product_master` would create a second source of truth that can drift from the ledger. `stock_balance` recomputes from `stock_ledger` on every query instead.

## Immutability of `stock_ledger`

Posted entries are never `UPDATE`d or `DELETE`d (Section 9: "non-negotiable, not a nice-to-have"). This is enforced at the RLS layer, not just in application code:
- `stock_ledger` has RLS enabled with **only** `SELECT` and `INSERT` policies defined.
- Postgres RLS denies any operation with no matching policy by default — so `UPDATE`/`DELETE` are structurally impossible for every role, including `depot_staff`, without writing a policy that doesn't exist.
- Corrections are new rows with `reversal_of` pointing at the original. A `BEFORE INSERT` trigger (`validate_stock_reversal`) checks that the reversal matches the original's depot + product and uses the opposite `transaction_type`, so a reversal can't accidentally (or maliciously) net out a different depot/product's stock.

See `docs/decisions/0002-ledger-immutability-via-rls.md`.

## RLS scoping summary

| Role | `stock_ledger` SELECT | `stock_ledger` INSERT | `product_master` write |
|---|---|---|---|
| `depot_staff` | own depot only | own depot only | no |
| `dfo` | all depots in own division | no | **yes** (assumption — see below) |
| `checkpost_staff` | — (no policy yet, Phase 2) | — | no |
| `hq_analytics` | statewide (policy exists now, no accounts yet) | no | no |

All scoping is keyed off `profiles.depot_id` / `profiles.division_id` via three `security definer` helper functions (`current_user_role/depot/division`) — never off anything sent from the client. "A hidden button is not access control" (Section 4) is enforced literally: there is no code path, client or server, that can read or write outside a user's scope.

## Two assumptions flagged for Department sign-off

1. **`product_master` write access → `dfo`.** The proposal's four roles don't include a generic "admin." DFO was the closest fit for owning reference data. If the Department wants a separate role for managing the product catalogue, this needs a small migration before Phase 2.
2. **Account provisioning is manual.** `profiles` rows are not self-service (`enable_signup = false` in `supabase/config.toml`). An administrator creates the `auth.users` row and the matching `profiles` row (with role + depot/division) directly. An admin UI for this is a candidate for a later phase, not built now.

## Phase 2/3 hooks already in the schema (per Section 3 — make the hook, not the feature)

- `checkposts` table exists, unrelated to any Phase 1 screen.
- `stock_ledger.vehicle_reg_no`, `driver_name`, `transit_pass_ref` are nullable columns, unused by Phase 1 forms, ready for the Phase 2 transit module to populate.
- `profiles.checkpost_id` exists for the future `checkpost_staff` scope.
- `stock_ledger_select_hq` RLS policy exists for `hq_analytics`, even though no such accounts are provisioned yet.
