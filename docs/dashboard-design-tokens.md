# FPITMS Dashboard — DESIGN.md Application Notes

DESIGN.md is the marketing site's token reference (see project root). This file
records the dashboard-specific decisions Section 6 of the brief calls for, so
`tailwind.config.ts` and `src/components/ui/*` have one source of truth instead
of improvised inline styles.

## Reused as-is from DESIGN.md
`text-input`, `text-input-focused`, `badge-neutral`, `badge-filled`,
`alert-banner`, `feature-card-light`, `comparison-table-row` (the model for
every dense table in this app), and the light-surface color tokens
(`canvas-light`, `ink`, `hairline`, `ash`, `mute`, `link-blue`, `success`,
`error`, `brand`).

## Deliberately skipped
`hero-display`, every `display-*` typography size (mega/xl/lg), and the 44px
pill `button-primary` / `button-brand`. There is no marketing hero or pill CTA
anywhere in this product — see Section 6.

## New component: `button-app-primary`

DESIGN.md doesn't define a compact, application-style primary button (its
`button-primary` is a 44px marketing pill). Per DESIGN.md's own iteration
guide ("Add new variants as separate `components:` entries... never bury them
inside prose"), this is added as a new entry rather than improvised inline:

```yaml
button-app-primary:
  backgroundColor: "{colors.ink}"
  textColor: "{colors.on-primary}"
  typography: "{typography.button-sm}"
  rounded: "{rounded.app-md}"
  padding: 12px
  height: 38px
```

Used for the single highest-priority action per screen ("Log Entry", "Save
Product") per Section 6's CTA scarcity rule. `{colors.brand}` is reserved for
genuinely irreversible/critical actions (e.g. a future "Approve Transit Pass"
in Phase 2) — Phase 1 has no action that rises to that level, so `brand` is
defined in the Tailwind theme but not yet used by any Phase 1 screen.

## Status/badge color mapping
- `{colors.success}` → reconciled / confirmed stock states.
- `{colors.error}` → discrepancy / validation states.
- `{typography.mono-eyebrow}` / `{typography.mono-caps}` → system-generated
  reference IDs only (batch/lot no., recorded-by timestamps) — never
  human-entered free text, per Section 6's "meaningful affordance" note.
