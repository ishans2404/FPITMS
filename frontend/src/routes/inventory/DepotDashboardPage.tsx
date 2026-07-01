import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/StatCard";
import { DepotInfoBanner } from "@/components/inventory/DepotInfoBanner";
import { StockBalanceTable } from "@/components/inventory/StockBalanceTable";
import { useProducts } from "@/lib/queries/useProducts";
import { useLedgerStats } from "@/lib/queries/useDepotInfo";

export function DepotDashboardPage() {
  const { profile } = useAuth();
  const { data: products } = useProducts();
  const { data: stats } = useLedgerStats(profile?.depot_id);

  const timberCount = products?.filter((p) => p.category === "timber").length ?? 0;
  const mfpCount = products?.filter((p) => p.category === "ntfp_mfp").length ?? 0;

  return (
    <div className="flex flex-col gap-lg">
      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-sm">
        <div>
          <p className="font-mono text-mono-eyebrow uppercase tracking-wide text-forest-mid">
            {profile?.role === "dfo" ? "Division overview" : "Depot overview"}
          </p>
          <h1 className="text-heading-md text-ink">Stock dashboard</h1>
        </div>
        {profile?.role === "depot_staff" && (
          <Link to="/inventory/ledger">
            <Button>Log entry</Button>
          </Link>
        )}
      </div>

      {!profile?.depot_id && profile?.role === "depot_staff" && (
        <Alert tone="error">
          Your account isn't assigned to a depot yet. Ask an administrator to set this.
        </Alert>
      )}

      {/* Depot context banner */}
      {profile?.depot_id && (
        <DepotInfoBanner depotId={profile.depot_id} />
      )}

      {/* Stats strip — 4-across on sm+, 2-across on mobile */}
      <div className="grid grid-cols-2 gap-md sm:grid-cols-4">
        <StatCard
          label="Products in catalog"
          value={products?.length ?? "—"}
          sub={`${timberCount} timber · ${mfpCount} NTFP/MFP`}
        />
        <StatCard
          label="Total entries"
          value={stats?.totalEntries ?? "—"}
          sub="All inward & outward"
        />
        <StatCard
          label="Today"
          value={stats?.todayEntries ?? 0}
          sub="Entries logged today"
        />
        <StatCard
          label="Ledger type"
          value="Append-only"
          sub="Corrections via reversal rows"
        />
      </div>

      {/* Current stock table */}
      <div>
        <div className="mb-sm flex items-center justify-between">
          <h2 className="text-heading-sm text-ink">Current stock</h2>
          <Link
            to="/inventory/ledger"
            className="text-caption text-link-blue hover:underline"
          >
            View full ledger →
          </Link>
        </div>
        <StockBalanceTable depotId={profile?.depot_id} />
      </div>
    </div>
  );
}