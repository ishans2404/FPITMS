import { type ReactNode } from "react";
import { NavLink, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";

// Nav groups — Phase 3 (reports) is registered when that module ships.
const NAV_GROUPS = [
  {
    label: "Inventory",
    items: [
      { to: "/",                   label: "Dashboard",      end: true },
      { to: "/inventory/ledger",   label: "Stock ledger",   end: false },
      { to: "/inventory/products", label: "Product master", end: false },
    ],
  },
  {
    label: "Transit",
    items: [
      { to: "/transit/passes",   label: "Transit passes",    end: false },
      { to: "/transit/vehicles", label: "Vehicle registry",  end: false },
    ],
  },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { session, profile, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-body-sm text-mute">
        Loading…
      </div>
    );
  }
  if (!session) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-canvas-paper">
      <header className="flex h-16 items-center justify-between border-b border-hairline bg-canvas-light px-lg">
        {/* Left: wordmark + grouped nav */}
        <div className="flex items-center gap-xl">
          {/* Brand mark */}
          <div className="flex items-center gap-xs">
            <span className="h-3 w-3 rounded-full bg-brand" aria-hidden />
            <span className="text-heading-sm text-ink">FPITMS</span>
          </div>

          {/* Flat nav with group eyebrows on hover — stays in one line */}
          <nav className="flex items-center gap-xs">
            {NAV_GROUPS.map((group, gi) => (
              <span key={group.label} className="flex items-center gap-xs">
                {/* Subtle separator between groups */}
                {gi > 0 && (
                  <span className="mx-xs h-4 w-px bg-hairline" aria-hidden />
                )}

                {/* Group eyebrow (hidden on small screens, visible on md+) */}
                <span className="hidden md:inline font-mono text-mono-caps uppercase tracking-wide text-ash select-none">
                  {group.label}
                </span>

                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `rounded-app-sm px-sm py-xxs text-body-sm transition-colors ${
                        isActive
                          ? "bg-canvas-paper text-ink font-medium"
                          : "text-mute hover:text-ink"
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </span>
            ))}
          </nav>
        </div>

        {/* Right: user identity + sign-out */}
        <div className="flex items-center gap-md">
          <span className="text-meta text-mute">
            {profile?.full_name ?? "—"}{" "}
            <span className="font-mono text-mono-caps uppercase">
              · {profile?.role?.replace(/_/g, " ") ?? "no role"}
            </span>
          </span>
          <Button variant="ghost" onClick={signOut}>
            Sign out
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-lg py-xl">{children}</main>
    </div>
  );
}