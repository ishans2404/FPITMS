import type { ReactNode } from "react";

type Accent = "default" | "success" | "warning" | "error" | "info";

// Maps semantic accent names → DESIGN.md token classes only.
// "warning" uses {colors.brand} (coral) — closest token for "needs attention."
// "info"    uses {colors.link-blue} / {colors.surface-blue-bg}.
// No invented hex values.
const accentMap: Record<Accent, { border: string; iconBg: string; iconColor: string }> = {
  default: { border: "border-l-forest-sage",     iconBg: "bg-forest-sage/15",  iconColor: "text-forest-mid" },
  success: { border: "border-l-success",         iconBg: "bg-success/10",      iconColor: "text-success"   },
  warning: { border: "border-l-brand",           iconBg: "bg-brand/10",        iconColor: "text-brand"     },
  error:   { border: "border-l-error",           iconBg: "bg-error/10",        iconColor: "text-error"     },
  info:    { border: "border-l-link-blue",       iconBg: "bg-surface-blue-bg", iconColor: "text-link-blue" },
};

interface StatCardProps {
  label: string;
  value: ReactNode;
  sub?: string;
  icon?: ReactNode;
  accent?: Accent;
}

export function StatCard({ label, value, sub, icon, accent = "default" }: StatCardProps) {
  const { border, iconBg, iconColor } = accentMap[accent];

  return (
    <div
      className={`
        relative rounded-marketing border border-hairline bg-canvas-light
        border-l-[3px] ${border}
        px-xl py-lg
      `}
    >
      {/* Icon badge — top-right, optional */}
      {icon && (
        <div
          className={`
            absolute right-lg top-lg
            flex h-8 w-8 items-center justify-center
            rounded-app-md ${iconBg} ${iconColor}
          `}
        >
          {icon}
        </div>
      )}

      {/* Value — leads visually */}
      <p className="pr-10 text-heading-sm font-semibold leading-none text-ink">
        {value}
      </p>

      {/* Label — mono-caps, below value */}
      <p className="mt-xs font-mono text-mono-caps uppercase tracking-wider text-mute">
        {label}
      </p>

      {/* Sub — tertiary context */}
      {sub && (
        <p className="mt-xxs text-meta text-ash">{sub}</p>
      )}
    </div>
  );
}