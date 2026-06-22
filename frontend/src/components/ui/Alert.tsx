import type { ReactNode } from "react";

// Maps to DESIGN.md's alert-banner component, reused as-is.
export function Alert({ children, tone = "info" }: { children: ReactNode; tone?: "info" | "error" }) {
  if (tone === "error") {
    return (
      <div className="rounded-app-lg border border-error/30 bg-error/5 p-md text-body-sm text-error">
        {children}
      </div>
    );
  }
  return (
    <div className="rounded-app-lg bg-surface-blue-bg p-md text-body-sm text-ink">{children}</div>
  );
}
