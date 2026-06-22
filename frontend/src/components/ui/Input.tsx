import { type InputHTMLAttributes, type SelectHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

// Maps to DESIGN.md's text-input / text-input-focused components, reused
// as-is per docs/dashboard-design-tokens.md.
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className = "", ...props }, ref) => {
    return (
      <div className="flex flex-col gap-xxs">
        {label && (
          <label htmlFor={id} className="text-caption-tight text-graphite">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={`h-11 rounded-app-xs border bg-canvas-light px-md text-body text-ink placeholder:text-ash
            ${error ? "border-error" : "border-hairline"}
            focus:outline-none focus:ring-2 focus:ring-link-blue
            ${className}`}
          {...props}
        />
        {error && <span className="text-meta text-error">{error}</span>}
      </div>
    );
  }
);
Input.displayName = "Input";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, id, className = "", children, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-xxs">
        {label && (
          <label htmlFor={id} className="text-caption-tight text-graphite">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={id}
          className={`h-11 rounded-app-xs border bg-canvas-light px-md text-body text-ink
            ${error ? "border-error" : "border-hairline"}
            focus:outline-none focus:ring-2 focus:ring-link-blue
            ${className}`}
          {...props}
        >
          {children}
        </select>
        {error && <span className="text-meta text-error">{error}</span>}
      </div>
    );
  }
);
Select.displayName = "Select";
