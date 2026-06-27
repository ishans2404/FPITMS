import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTransitPasses } from "@/lib/queries/useTransitPasses";
import { TransitPassTable } from "@/components/transit/TransitPassTable";
import { TransitPassForm } from "@/components/transit/TransitPassForm";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import type { TransitPassStatus } from "@/types/database";

const STATUS_ORDER: TransitPassStatus[] = [
  "issued", "in_transit", "verified", "completed", "cancelled",
];

export function TransitPassListPage() {
  const { profile } = useAuth();
  const { data: passes, isLoading } = useTransitPasses(profile?.depot_id);
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<TransitPassStatus | "all">("all");

  const canIssue = profile?.role === "depot_staff" || profile?.role === "dfo";
  const canEdit  = profile?.role === "depot_staff" || profile?.role === "dfo";

  const filtered = passes?.filter(
    (p) => statusFilter === "all" || p.status === statusFilter
  ) ?? [];

  // Stats from full list (not filtered)
  const countByStatus = (s: TransitPassStatus) =>
    passes?.filter((p) => p.status === s).length ?? 0;

  return (
    <div className="flex flex-col gap-lg">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-mono-eyebrow uppercase tracking-wide text-forest-mid">
            CG Transit (Forest Produce) Rules, 2001
          </p>
          <h1 className="text-heading-md text-ink">Transit passes</h1>
        </div>
        {canIssue && (
          <Button onClick={() => setShowForm((s) => !s)}>
            {showForm ? "Cancel" : "Issue pass"}
          </Button>
        )}
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 gap-md sm:grid-cols-4">
        <StatCard label="Total passes"   value={passes?.length ?? "—"} sub="All time" />
        <StatCard label="Issued"         value={countByStatus("issued")}     sub="Awaiting dispatch" />
        <StatCard label="In transit"     value={countByStatus("in_transit")} sub="On the road" />
        <StatCard label="Verified"       value={countByStatus("verified")}   sub="Checkpost cleared" />
      </div>

      {/* Issue form */}
      {showForm && canIssue && (
        <div className="rounded-marketing border border-hairline bg-canvas-light p-xl">
          <h2 className="mb-md text-heading-sm text-ink">Issue transit pass</h2>
          <TransitPassForm onDone={() => setShowForm(false)} />
        </div>
      )}

      {/* DFO message */}
      {profile?.role === "dfo" && !profile?.depot_id && (
        <Alert>
          Showing passes for your division's depots.
        </Alert>
      )}

      {/* Status filter pills */}
      <div className="flex flex-wrap items-center gap-xs">
        {(["all", ...STATUS_ORDER] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-full px-sm py-xxs text-caption transition-colors ${
              statusFilter === s
                ? "bg-forest-deep text-on-primary"
                : "bg-canvas-paper text-mute hover:text-ink"
            }`}
          >
            {s === "all"
              ? `All (${passes?.length ?? 0})`
              : `${s.replace("_", " ")} (${countByStatus(s)})`}
          </button>
        ))}
      </div>

      {/* Table */}
      {isLoading ? (
        <p className="text-body-sm text-mute">Loading passes…</p>
      ) : (
        <TransitPassTable
          passes={filtered}
          depotId={profile?.depot_id ?? ""}
          canEdit={canEdit}
        />
      )}
    </div>
  );
}