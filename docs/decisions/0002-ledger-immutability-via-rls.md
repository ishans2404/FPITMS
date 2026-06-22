# ADR 0002: Ledger immutability enforced via RLS, not application logic

**Status:** Active

## Context
Section 9 treats posted inward/outward entries as immutable — "non-negotiable,
not a nice-to-have" — because the ledger is the audit-trail source of truth for
a government compliance system.

## Decision
`stock_ledger` has Row Level Security enabled with only `SELECT` and `INSERT`
policies defined. No `UPDATE` or `DELETE` policy exists for any role. Postgres
RLS denies any operation that has no matching policy, so this isn't an
application-layer rule that a bug or a future engineer could bypass — it's
structurally impossible to mutate a posted row, including from the Supabase
dashboard SQL editor under a non-service-role connection, and including for
`depot_staff` correcting their own entry.

Corrections are new rows referencing the original via `reversal_of`, validated
by a `BEFORE INSERT` trigger (`validate_stock_reversal`) that requires the
reversal to match the original row's depot + product and use the opposite
`transaction_type`.

## Consequences
- There is no "edit" UI anywhere in the Stock Ledger screen — only "Log new
  entry" and (for corrections) "Reverse this entry."
- `stock_balance` does not need a `status` column or a `WHERE` filter to
  exclude reversed entries — a reversal's opposite-direction quantity already
  nets out in the `SUM(...)` in the view.
- Bypassing this requires the service role key (server-side only, never in the
  frontend — see README security note) and a deliberate, audit-visible
  decision to do so outside the normal application path.
