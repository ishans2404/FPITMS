import { type ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "app-primary" | "brand" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

// button-app-primary is a new dashboard-only component — see
// docs/dashboard-design-tokens.md for why DESIGN.md's 44px pill
// button-primary doesn't fit here.
const variantClasses: Record<Variant, string> = {
  "app-primary":
    "bg-ink text-on-primary hover:bg-ink-soft h-[38px] rounded-app-md font-medium",
  // Reserved for the single highest-priority/critical action on a screen
  // (Section 6 CTA-scarcity rule) — unused by any Phase 1 screen so far.
  brand: "bg-brand text-ink hover:opacity-90 h-[38px] rounded-app-md font-medium",
  secondary:
    "bg-canvas-light text-ink border border-hairline hover:bg-canvas-paper h-[38px] rounded-app-md font-medium",
  ghost: "bg-transparent text-mute hover:text-ink h-[38px] rounded-app-md font-medium",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "app-primary", className = "", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center gap-xs px-md text-button-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
