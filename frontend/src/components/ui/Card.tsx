import type { ReactNode } from "react";

// Maps to DESIGN.md's feature-card-light / pricing-card pattern (32px
// padding, marketing radius, hairline border) reused for dashboard summary
// cards per docs/dashboard-design-tokens.md.
export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-marketing border border-hairline bg-canvas-light p-xl ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children }: { children: ReactNode }) {
  return <h3 className="text-heading-sm text-ink">{children}</h3>;
}

export function CardEyebrow({ children }: { children: ReactNode }) {
  // IBM Plex Mono, reserved for technical/system labels only (Section 6).
  return <p className="font-mono text-mono-eyebrow uppercase tracking-wide text-mute">{children}</p>;
}
