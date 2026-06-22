import { useState } from "react";
import { StockLedgerTable } from "@/components/inventory/StockLedgerTable";
import { InwardOutwardForm } from "@/components/inventory/InwardOutwardForm";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { useAuth } from "@/contexts/AuthContext";

// Known Phase 1 scope limit: this page (and StockLedgerTable/useStockLedger)
// is written against a single profile.depot_id. depot_staff is the only role
// with one, so this is correct for them. A DFO has division_id, not
// depot_id, and won't see entries here yet — a cross-depot division ledger
// view is a Phase 3 reporting concern (Section 6: dense table → Reporting
// module), not something to build into this Phase 1 screen.
export function StockLedgerPage() {
  const { profile } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const canLogEntries = profile?.role === "depot_staff";

  return (
    <div className="flex flex-col gap-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-mono-eyebrow uppercase tracking-wide text-mute">Inward / outward</p>
          <h1 className="text-heading-md text-ink">Stock ledger</h1>
        </div>
        {canLogEntries && (
          <Button onClick={() => setShowForm((s) => !s)}>{showForm ? "Cancel" : "Log entry"}</Button>
        )}
      </div>

      {showForm && canLogEntries && (
        <div className="rounded-marketing border border-hairline bg-canvas-light p-xl">
          <InwardOutwardForm onDone={() => setShowForm(false)} />
        </div>
      )}

      {profile?.role === "dfo" ? (
        <Alert>
          Division-wide ledger viewing is part of the Phase 3 reporting module. This screen
          currently shows single-depot ledgers for depot staff accounts.
        </Alert>
      ) : (
        <StockLedgerTable />
      )}
    </div>
  );
}
