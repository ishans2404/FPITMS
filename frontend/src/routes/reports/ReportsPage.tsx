import { Link } from "react-router-dom";
import { IconLedger, IconTransitPass, IconVehicle, IconDashboard, IconCheckpost } from "@/components/ui/Icons";
import type { ComponentType, SVGProps } from "react";

type IconComponent = ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;

interface ReportLink {
  to: string;
  label: string;
  description: string;
  icon: IconComponent;
  accent: string;
}

const REPORTS: ReportLink[] = [
  {
    to: "/reports/stock-register",
    label: "Stock register",
    description:
      "Full inward & outward ledger with product, depot, and division context. Filterable by date range. Required under CG Forest Rules for stock audit.",
    icon: IconLedger,
    accent: "border-l-link-blue",
  },
  {
    to: "/reports/transit",
    label: "Transit pass report",
    description:
      "All transit passes issued under CG Transit (Forest Produce) Rules, 2001 — with vehicle, driver, product, and status detail.",
    icon: IconTransitPass,
    accent: "border-l-brand",
  },
  {
    to: "/reports/vehicle-movement",
    label: "Vehicle movement",
    description:
      "Checkpost verification log — vehicles sighted, quantities physically counted, and discrepancy notes against issued transit passes.",
    icon: IconCheckpost,
    accent: "border-l-success",
  },
  {
    to: "/reports/analytics",
    label: "Analytics dashboard",
    description:
      "Visual trend charts for daily inward & outward activity and current stock levels by product across your accessible depots.",
    icon: IconDashboard,
    accent: "border-l-hairline",
  },
];

export function ReportsPage() {
  return (
    <div className="flex flex-col gap-lg">
      {/* Page header */}
      <div>
        <p className="font-mono text-mono-eyebrow uppercase tracking-wide text-forest-mid">
          Phase 3 · Reporting
        </p>
        <h1 className="text-heading-md text-ink">Reports</h1>
        <p className="mt-xs text-body-sm text-mute">
          All reports respect your role scope — depot staff see their depot, DFO sees their
          division, HQ sees statewide data.
        </p>
      </div>

      {/* Report cards */}
      <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
        {REPORTS.map(({ to, label, description, icon: Icon, accent }) => (
          <Link
            key={to}
            to={to}
            className={`
              group relative rounded-marketing border border-hairline bg-canvas-light
              border-l-[3px] ${accent}
              px-xl py-lg transition-shadow hover:shadow-soft-drop
            `}
          >
            <div className="flex items-start gap-md">
              <div className="mt-[2px] flex h-8 w-8 shrink-0 items-center justify-center rounded-app-md bg-canvas-paper text-graphite group-hover:bg-hairline">
                <Icon size={15} />
              </div>
              <div>
                <p className="text-heading-sm text-ink">{label}</p>
                <p className="mt-xs text-body-sm text-mute leading-relaxed">{description}</p>
                <p className="mt-md text-caption text-link-blue group-hover:underline">
                  View report →
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}