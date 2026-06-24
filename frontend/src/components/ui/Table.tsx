import type { ReactNode } from "react";

// Models DESIGN.md's comparison-table-row pattern: 16px cell padding,
// hairline row dividers, body-sm type — the densest reading surface in the
// design system, and exactly the density a stock ledger / transit log needs
// (Section 6 calls this out explicitly).

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-marketing border border-hairline shadow-soft-drop">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-body-sm">{children}</table>
      </div>
    </div>
  );
}

export function TableHead({ children }: { children: ReactNode }) {
  return (
    <thead className="border-b border-hairline bg-canvas-paper text-caption-tight text-graphite">
      {children}
    </thead>
  );
}

export function TableBody({ children }: { children: ReactNode }) {
  return <tbody>{children}</tbody>;
}

export function TableRow({ children }: { children: ReactNode }) {
  return (
    <tr className="border-t border-hairline transition-colors hover:bg-canvas-paper/70">
      {children}
    </tr>
  );
}

export function TableHeaderCell({ children }: { children: ReactNode }) {
  return (
    <th className="px-md py-sm text-left font-mono text-mono-caps uppercase tracking-wider text-graphite whitespace-nowrap">
      {children}
    </th>
  );
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
  return (
    <div className="flex flex-col items-center gap-md py-xxl text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-canvas-paper">
        {/* Inbox icon — inline to avoid circular dep with Icons.tsx */}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-ash">
          <polyline points="22,12 16,12 14,15 10,15 8,12 2,12" />
          <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
        </svg>
      </div>
      <p className="max-w-xs text-body-sm text-mute">{children}</p>
    </div>
  );
}
