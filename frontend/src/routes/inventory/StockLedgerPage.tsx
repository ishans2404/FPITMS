import { useState } from "react";
import { StockLedgerTable } from "@/components/inventory/StockLedgerTable";
import { InwardOutwardForm } from "@/components/inventory/InwardOutwardForm";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { StatCard } from "@/components/ui/StatCard";
import { useAuth } from "@/contexts/AuthContext";
import { useLedgerStats } from "@/lib/queries/useDepotInfo";

export function StockLedgerPage() {
  const { profile } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const { data: stats } = useLedgerStats(profile?.depot_id);
  const canLogEntries = profile?.role === "depot_staff";

  return (
    <div className="flex flex-col gap-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-mono-eyebrow uppercase tracking-wide text-mute">
            Inward / outward
          </p>
          <h1 className="text-heading-md text-ink">Stock ledger</h1>
        </div>
        {canLogEntries && (
          <Button onClick={() => setShowForm((s) => !s)}>
            {showForm ? "Cancel" : "Log entry"}
          </Button>
        )}
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 gap-md sm:grid-cols-3">
        <StatCard
          label="Total entries"
          value={stats?.totalEntries ?? "—"}
          sub="All time (excl. corrections)"
        />
        <StatCard
          label="Today"
          value={stats?.todayEntries ?? 0}
          sub="Entries logged today"
        />
        <StatCard
          label="Audit model"
          value="Immutable"
          sub="No edits — corrections via reversal"
        />
      </div>

      {showForm && canLogEntries && (
        <div className="rounded-marketing border border-hairline bg-canvas-light p-xl">
          <h2 className="mb-md text-heading-sm text-ink">Log new entry</h2>
          <InwardOutwardForm onDone={() => setShowForm(false)} />
        </div>
      )}

      {profile?.role === "dfo" ? (
        <Alert>
          Division-wide ledger viewing is part of the Phase 3 reporting module. This
          screen currently shows single-depot ledgers for depot staff accounts.
        </Alert>
      ) : (
        <StockLedgerTable />
      )}
    </div>
  );
}