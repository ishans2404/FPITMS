import type { ReactNode } from "react";

type Variant = "neutral" | "filled" | "success" | "error" | "brand";

const variantClasses: Record<Variant, string> = {
  // DESIGN.md badge-neutral / badge-filled, reused as-is.
  neutral: "bg-canvas-light text-ink border border-hairline",
  filled: "bg-ink text-on-primary",
  success: "bg-success/10 text-success border border-success/30",
  error: "bg-error/10 text-error border border-error/30",
  brand: "bg-brand/10 text-brand-deep border border-brand/30",
};

export function Badge({ variant = "neutral", children }: { variant?: Variant; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-xs py-xxs text-caption ${variantClasses[variant]}`}
    >
      {children}
    </span>
  );
}
