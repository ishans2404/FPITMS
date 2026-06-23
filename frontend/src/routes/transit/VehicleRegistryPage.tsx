import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useVehicles } from "@/lib/queries/useVehicles";
import { VehicleForm, VehicleTable } from "@/components/transit/VehicleComponents";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";

export function VehicleRegistryPage() {
  const { profile } = useAuth();
  const { data: vehicles } = useVehicles();
  const [showForm, setShowForm] = useState(false);

  const canEdit =
    profile?.role === "depot_staff" || profile?.role === "dfo";

  const truckCount  = vehicles?.filter((v) => v.vehicle_type === "truck").length  ?? 0;
  const otherCount  = (vehicles?.length ?? 0) - truckCount;

  return (
    <div className="flex flex-col gap-lg">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-mono-eyebrow uppercase tracking-wide text-mute">
            Transit module
          </p>
          <h1 className="text-heading-md text-ink">Vehicle registry</h1>
        </div>
        {canEdit && (
          <Button onClick={() => setShowForm((s) => !s)}>
            {showForm ? "Cancel" : "Register vehicle"}
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-md sm:grid-cols-3">
        <StatCard
          label="Registered vehicles"
          value={vehicles?.length ?? "—"}
          sub="Active in registry"
        />
        <StatCard
          label="Trucks"
          value={truckCount}
          sub="Most common type"
        />
        <StatCard
          label="Other types"
          value={otherCount}
          sub="Tractor, pickup, tempo, other"
        />
      </div>

      {/* Register form */}
      {showForm && canEdit && (
        <div className="rounded-marketing border border-hairline bg-canvas-light p-xl">
          <h2 className="mb-md text-heading-sm text-ink">Register vehicle</h2>
          <VehicleForm onDone={() => setShowForm(false)} />
        </div>
      )}

      <VehicleTable canEdit={canEdit} />
    </div>
  );
}