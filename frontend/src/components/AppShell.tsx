import { type ReactNode, useState } from "react";
import { NavLink, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  IconDashboard, IconLedger, IconProduct,
  IconTransitPass, IconVehicle, IconReports,
  IconLogOut, IconLeaf, IconCheckpost,
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
      { to: "/transit/passes",    label: "Transit passes",   icon: IconTransitPass },
      { to: "/transit/vehicles",  label: "Vehicle registry", icon: IconVehicle },
      { to: "/transit/checkpost", label: "Checkpost",        icon: IconCheckpost },
    ],
  },
  {
    label: "Reports",
    items: [
      { to: "/reports",                  label: "Overview",         icon: IconReports,    end: true },
      { to: "/reports/stock-register",   label: "Stock register",   icon: IconLedger },
      { to: "/reports/transit",          label: "Transit passes",   icon: IconTransitPass },
      { to: "/reports/vehicle-movement", label: "Vehicle movement", icon: IconVehicle },
      { to: "/reports/analytics",        label: "Analytics",        icon: IconDashboard },
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

// ── Inline icons for hamburger — avoids a new import dependency ───────────
function IconMenu() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────
function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { profile, signOut } = useAuth();

  return (
    <>
      {/* Scrim — tapping closes the drawer; hidden on lg+ */}
      <div
        className={`fixed inset-0 z-20 bg-canvas/60 backdrop-blur-sm transition-opacity duration-200 lg:hidden ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`
          fixed inset-y-0 left-0 z-30 flex w-60 flex-col bg-forest-deep
          transition-transform duration-200 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
        aria-label="Main navigation"
      >
        {/* Brand */}
        <div className="flex h-14 shrink-0 items-center gap-sm border-b border-forest-mid/40 px-lg lg:h-16">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-app-md bg-forest-sage/30">
            <IconLeaf size={14} className="text-forest-pale" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-semibold leading-tight text-on-primary tracking-tight">
              FPITMS
            </p>
            <p className="mt-[2px] font-mono text-mono-micro leading-tight text-forest-sage">
              CG Forest Dept.
            </p>
          </div>
          {/* Close button — mobile only */}
          <button
            onClick={onClose}
            className="shrink-0 rounded-app-md p-xs text-ash transition-colors hover:bg-forest-mid/40 hover:text-on-primary lg:hidden"
            aria-label="Close navigation"
          >
            <IconClose />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-xs py-md" aria-label="Site sections">
          {NAV.map((section) => (
            <div key={section.label} className="mb-md">
              {/* Section label row */}
              <div className="mb-[3px] flex items-center gap-xs px-sm py-[2px]">
                <p className="font-mono text-mono-micro uppercase tracking-widest text-forest-sage">
                  {section.label}
                </p>
                {section.badge && (
                  <span className="rounded-app-xs bg-forest-mid/40 px-[5px] py-[1px] font-mono text-mono-micro text-forest-sage">
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
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-sm rounded-app-md px-sm py-[7px] text-button-sm transition-colors ${
                          isActive
                            ? "bg-forest-mid text-on-primary shadow-[inset_2px_0_0_#D4DE95]"
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
              <p className="mt-[2px] font-mono text-mono-micro uppercase tracking-wide text-forest-sage">
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
    </>
  );
}

// ── Mobile top bar (hidden on lg+) ────────────────────────────────────────
function MobileTopBar({ onMenuOpen }: { onMenuOpen: () => void }) {
  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-sm border-b border-forest-mid/40 bg-forest-deep px-md lg:hidden">
      <button
        onClick={onMenuOpen}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-app-md text-ash transition-colors hover:bg-forest-mid/40 hover:text-on-primary"
        aria-label="Open navigation menu"
      >
        <IconMenu />
      </button>
      <span className="flex h-7 w-7 items-center justify-center rounded-app-md bg-forest-sage/30">
        <IconLeaf size={12} className="text-forest-pale" />
      </span>
      <p className="text-[15px] font-semibold text-on-primary tracking-tight">FPITMS</p>
    </header>
  );
}

// ── Shell ─────────────────────────────────────────────────────────────────
export function AppShell({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    <div className="flex min-h-screen bg-forest-pale/15">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {/* Mobile: full width. lg+: offset 240 px for the fixed sidebar. */}
      <div className="flex min-w-0 flex-1 flex-col lg:ml-60">
        <MobileTopBar onMenuOpen={() => setSidebarOpen(true)} />
        <main className="flex-1 px-md py-md lg:px-xl lg:py-lg">{children}</main>
      </div>
    </div>
  );
}