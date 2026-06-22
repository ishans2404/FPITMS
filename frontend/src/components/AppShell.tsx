import { type ReactNode } from "react";
import { NavLink, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";

const navItems = [
  { to: "/", label: "Dashboard" },
  { to: "/inventory/ledger", label: "Stock ledger" },
  { to: "/inventory/products", label: "Product master" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { session, profile, loading, signOut } = useAuth();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-body-sm text-mute">Loading…</div>;
  }
  if (!session) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-canvas-paper">
      <header className="flex h-16 items-center justify-between border-b border-hairline bg-canvas-light px-lg">
        <div className="flex items-center gap-xl">
          <div className="flex items-center gap-xs">
            <span className="h-3 w-3 rounded-full bg-brand" aria-hidden />
            <span className="text-heading-sm text-ink">FPITMS</span>
          </div>
          <nav className="flex gap-md">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `text-body-sm ${isActive ? "text-ink font-medium" : "text-mute hover:text-ink"}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-md">
          <span className="text-meta text-mute">
            {profile?.full_name ?? "—"} · {profile?.role?.replace("_", " ") ?? "no role assigned"}
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
