import { useAuth } from "@/contexts/AuthContext";
import { StockSummaryCards } from "@/components/inventory/StockSummaryCards";
import { Alert } from "@/components/ui/Alert";

export function DepotDashboardPage() {
  const { profile } = useAuth();

  return (
    <div className="flex flex-col gap-lg">
      <div>
        <p className="font-mono text-mono-eyebrow uppercase tracking-wide text-mute">
          {profile?.role === "dfo" ? "Division overview" : "Depot overview"}
        </p>
        <h1 className="text-heading-md text-ink">Stock dashboard</h1>
      </div>

      {!profile?.depot_id && profile?.role === "depot_staff" && (
        <Alert tone="error">
          Your account isn't assigned to a depot yet. Ask an administrator to set this.
        </Alert>
      )}

      <StockSummaryCards />
    </div>
  );
}
