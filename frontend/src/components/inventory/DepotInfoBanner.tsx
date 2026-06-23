import { useDepotInfo, useDivisionInfo } from "@/lib/queries/useDepotInfo";

// DepotInfoBanner resolves depotId → depot row → division row and renders a
// horizontal info strip consistent with the light card language. Intentionally
// shows the operator which physical depot and division they are scoped to —
// important in a multi-depot government system where a user must never mistake
// which depot's data they are seeing.
export function DepotInfoBanner({ depotId }: { depotId: string }) {
  const { data: depot } = useDepotInfo(depotId);
  const { data: division } = useDivisionInfo(depot?.division_id ?? null);

  if (!depot) return null;

  return (
    <div className="rounded-app-lg border border-hairline bg-canvas-light px-lg py-md">
      <div className="flex flex-wrap items-center gap-xl">
        {/* Depot name */}
        <div>
          <p className="font-mono text-mono-caps uppercase tracking-wide text-mute">Depot</p>
          <p className="mt-xxs text-subtitle text-ink">{depot.name}</p>
        </div>

        <div className="hidden h-8 w-px bg-hairline sm:block" />

        {/* Depot code (mono — reference ID convention) */}
        <div>
          <p className="font-mono text-mono-caps uppercase tracking-wide text-mute">Code</p>
          <p className="mt-xxs font-mono text-mono-eyebrow text-graphite">{depot.code}</p>
        </div>

        {division && (
          <>
            <div className="hidden h-8 w-px bg-hairline sm:block" />
            <div>
              <p className="font-mono text-mono-caps uppercase tracking-wide text-mute">Division</p>
              <p className="mt-xxs text-body-sm text-ink">{division.name}</p>
            </div>
          </>
        )}

        {depot.location && (
          <>
            <div className="hidden h-8 w-px bg-hairline sm:block" />
            <div>
              <p className="font-mono text-mono-caps uppercase tracking-wide text-mute">Location</p>
              <p className="mt-xxs text-body-sm text-ink">{depot.location}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}