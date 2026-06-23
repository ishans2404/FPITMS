// StatCard — a compact stat-display surface for the dashboard strips.
// Maps to DESIGN.md's feature-card-light pattern but at a reduced height
// (no xl padding, just md) appropriate for a 4-across metrics row.
// Per docs/dashboard-design-tokens.md: heading-sm (24px) is the largest
// size used anywhere in this product — stat values use that ceiling.

interface StatCardProps {
  label: string;          // mono-caps label above the value
  value: string | number; // the headline number or string
  sub?: string;           // optional supporting note below
}

export function StatCard({ label, value, sub }: StatCardProps) {
  return (
    <div className="rounded-app-lg border border-hairline bg-canvas-light px-lg py-md">
      <p className="font-mono text-mono-caps uppercase tracking-wide text-mute">{label}</p>
      <p className="mt-xxs text-heading-sm text-ink">{value}</p>
      {sub && <p className="mt-xxs text-meta text-mute">{sub}</p>}
    </div>
  );
}