import { type ReactNode } from "react";
import { NavLink, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  IconDashboard, IconLedger, IconProduct,
  IconTransitPass, IconVehicle, IconReports,
  IconLogOut, IconLeaf,
} from "@/components/ui/Icons";

// ── Nav config ────────────────────────────────────────────────────────────
type NavIcon = (props: { size?: number; className?: string }) => JSX.Element;

interface NavItem   { to: string; label: string; icon: NavIcon; end?: boolean; disabled?: boolean }
interface NavSection { label: string; badge?: string; items: NavItem[] }

const NAV: NavSection[] = [
  {
    label: "Inventory",
    items: [
      { to: "/",                   label: "Dashboard",     icon: IconDashboard, end: true },
      { to: "/inventory/ledger",   label: "Stock ledger",  icon: IconLedger },
      { to: "/inventory/products", label: "Product master",icon: IconProduct },
    ],
  },
  {
    label: "Transit",
    items: [
      { to: "/transit/passes",   label: "Transit passes",    icon: IconTransitPass },
      { to: "/transit/vehicles", label: "Vehicle registry",  icon: IconVehicle },
    ],
  },
  {
    label: "Reports",
    badge: "Phase 3",
    items: [
      { to: "/reports", label: "Analytics", icon: IconReports, disabled: true },
    ],
  },
];

function roleLabel(r: string | undefined) {
  const m: Record<string, string> = {
    depot_staff: "Depot Staff", dfo: "DFO",
    checkpost_staff: "Checkpost", hq_analytics: "HQ Analytics",
  };
  return r ? (m[r] ?? r) : "No role";
}

// ── Sidebar ───────────────────────────────────────────────────────────────
function Sidebar() {
  const { profile, signOut } = useAuth();

  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex w-60 flex-col bg-forest-deep">
      {/* Brand */}
      <div className="flex h-16 shrink-0 items-center gap-sm border-b border-forest-mid/40 px-lg">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-app-md bg-forest-sage/20">
          <IconLeaf size={14} className="text-forest-pale" />
        </span>
        <div className="min-w-0">
          <p className="text-[15px] font-semibold leading-tight text-on-primary tracking-tight">
            FPITMS
          </p>
          <p className="mt-[2px] font-mono text-mono-micro leading-tight text-mute">
            CG Forest Dept.
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-xs py-md">
        {NAV.map((section) => (
          <div key={section.label} className="mb-md">
            {/* Section label row */}
            <div className="mb-[3px] flex items-center gap-xs px-sm py-[2px]">
              <p className="font-mono text-mono-micro uppercase tracking-widest text-mute">
                {section.label}
              </p>
              {section.badge && (
                <span className="rounded-app-xs bg-graphite/40 px-[5px] py-[1px] font-mono text-mono-micro text-graphite">
                  {section.badge}
                </span>
              )}
            </div>

            {/* Items */}
            <div className="space-y-[1px]">
              {section.items.map((item) => {
                const Icon = item.icon;

                if (item.disabled) {
                  return (
                    <div
                      key={item.to}
                      className="flex cursor-not-allowed items-center gap-sm rounded-app-md px-sm py-[7px] text-button-sm text-graphite"
                    >
                      <Icon size={14} />
                      <span>{item.label}</span>
                    </div>
                  );
                }

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `flex items-center gap-sm rounded-app-md px-sm py-[7px] text-button-sm transition-colors ${
                        isActive
                          ? "bg-forest-mid text-on-primary"
                          : "text-ash hover:bg-forest-mid/40 hover:text-on-primary"
                      }`
                    }
                  >
                    <Icon size={14} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="shrink-0 border-t border-forest-mid/40 px-lg py-md">
        <div className="flex items-center justify-between gap-sm">
          <div className="min-w-0">
            <p className="truncate text-caption-tight text-on-primary">
              {profile?.full_name ?? "—"}
            </p>
            <p className="mt-[2px] font-mono text-mono-micro uppercase tracking-wide text-mute">
              {roleLabel(profile?.role)}
            </p>
          </div>
          <button
            onClick={signOut}
            title="Sign out"
            className="shrink-0 text-ash transition-colors hover:text-error"
          >
            <IconLogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}

// ── Shell ─────────────────────────────────────────────────────────────────
export function AppShell({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas-paper">
        <div className="flex flex-col items-center gap-md">
          <span className="h-8 w-8 animate-pulse rounded-full bg-brand/20" />
          <p className="text-body-sm text-mute">Loading…</p>
        </div>
      </div>
    );
  }
  if (!session) return <Navigate to="/login" replace />;

  return (
    <div className="flex min-h-screen bg-canvas-paper">
      <Sidebar />
      {/* Offset by sidebar width on all viewports — ops tool, desktop-first */}
      <div className="ml-60 flex flex-1 flex-col">
        <main className="flex-1 px-xl py-lg">{children}</main>
      </div>
    </div>
  );
}