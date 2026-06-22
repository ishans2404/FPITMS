import type { ReactNode } from "react";

// Models DESIGN.md's comparison-table-row pattern: 16px cell padding,
// hairline row dividers, body-sm type — the densest reading surface in the
// design system, and exactly the density a stock ledger / transit log needs
// (Section 6 calls this out explicitly).

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-app-lg border border-hairline">
      <table className="w-full border-collapse text-body-sm">{children}</table>
    </div>
  );
}

export function TableHead({ children }: { children: ReactNode }) {
  return <thead className="bg-canvas-paper text-caption-tight text-graphite">{children}</thead>;
}

export function TableBody({ children }: { children: ReactNode }) {
  return <tbody>{children}</tbody>;
}

export function TableRow({ children }: { children: ReactNode }) {
  return <tr className="border-t border-hairline">{children}</tr>;
}

export function TableHeaderCell({ children }: { children: ReactNode }) {
  return <th className="px-md py-sm text-left font-medium">{children}</th>;
}

export function TableCell({ children, mono = false }: { children: ReactNode; mono?: boolean }) {
  // mono=true is for system-generated reference IDs (batch/lot no., recorded
  // timestamps) per Section 6 — visually distinct from human-entered text.
  return (
    <td className={`px-md py-sm align-top ${mono ? "font-mono text-mono-eyebrow text-graphite" : "text-ink"}`}>
      {children}
    </td>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="p-xl text-center text-body-sm text-mute">{children}</div>;
}
