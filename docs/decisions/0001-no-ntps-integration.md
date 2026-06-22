# ADR 0001: Transit module is standalone CG-specific, no NTPS integration

**Status:** Confirmed (Department contact, not an oversight — see proposal Section 2)

## Context
The National Transit Pass System (ntps.nic.in) already issues pan-India transit
permits for timber/bamboo/MFP, including in Chhattisgarh. FPITMS's Phase 2
transit module covers conceptually similar ground: permits under the
Chhattisgarh Transit (Forest Produce) Rules, 2001.

## Decision
FPITMS's transit module does **not** call or integrate with NTPS. It issues and
tracks CG-specific transit pass records as its own standalone module.

## Consequences
- `stock_ledger.transit_pass_ref` is a free-text reference, not a foreign key
  into any external system.
- No NTPS API client, credentials, or sync job exists anywhere in this codebase.
- Don't propose NTPS integration in a future phase without explicitly revisiting
  this decision with the Department.
