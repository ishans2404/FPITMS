import type { Config } from "tailwindcss";

// Tailwind theme extension built directly from DESIGN.md's token list.
// Per the brief (Section 6 + docs/dashboard-design-tokens.md):
//  - Only the light surface family + semantic colors are wired up for use;
//    dark `canvas`/`canvas-soft` tokens are still defined (so they exist
//    verbatim, matching DESIGN.md) but the app shell never defaults to them.
//  - display-* font sizes (mega/xl/lg) are intentionally NOT included —
//    there is no marketing hero in this product.
//  - No colors or spacing values outside DESIGN.md's token list are added.
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0b0b0b",
        "on-primary": "#ffffff",
        brand: "#f36458",
        "brand-deep": "#dd0000",
        ink: "#0b0b0b",
        "ink-soft": "#212121",
        graphite: "#353535",
        slate: "#3c4758",
        "slate-soft": "#505b6c",
        mute: "#797979",
        ash: "#b9b9b9",
        hairline: "#ededed",
        "hairline-soft": "#353535",
        canvas: "#0b0b0b",
        "canvas-soft": "#212121",
        "canvas-light": "#ffffff",
        "canvas-paper": "#ededed",
        "on-canvas-light": "#0b0b0b",
        "link-blue": "#0052ef",
        "link-blue-soft": "#55beff",
        "surface-blue-bg": "#afe3ff",
        success: "#37cd84",
        error: "#dd0000",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "monospace"],
      },
      // DESIGN.md typography tokens, capped at heading-md and below per
      // Section 6 ("Cap typography at heading-md/heading-sm... never use
      // display-mega/xl").
      fontSize: {
        "heading-md": ["32px", { lineHeight: "1.13", letterSpacing: "-0.32px" }],
        "heading-sm": ["24px", { lineHeight: "1.10", letterSpacing: "-0.24px" }],
        subtitle: ["18px", { lineHeight: "1.5", letterSpacing: "-0.18px" }],
        body: ["16px", { lineHeight: "1.5" }],
        "body-sm": ["15px", { lineHeight: "1.5", letterSpacing: "-0.15px" }],
        caption: ["13px", { lineHeight: "1.5" }],
        "caption-tight": ["13px", { lineHeight: "1.3", letterSpacing: "-0.13px" }],
        meta: ["12px", { lineHeight: "1.5", letterSpacing: "-0.12px" }],
        "mono-eyebrow": ["13px", { lineHeight: "1.5" }],
        "mono-caps": ["11px", { lineHeight: "1.5" }],
        "mono-micro": ["10px", { lineHeight: "1.3" }],
        "button-lg": ["16px", { lineHeight: "1.5" }],
        "button-sm": ["13px", { lineHeight: "1.3", letterSpacing: "-0.13px" }],
        "button-uppercase": ["11px", { lineHeight: "1.5" }],
      },
      borderRadius: {
        none: "0px",
        "app-xs": "3px",
        "app-sm": "4px",
        "app-md": "5px",
        "app-lg": "6px",
        marketing: "12px",
        full: "9999px",
      },
      spacing: {
        xxs: "4px",
        xs: "8px",
        sm: "12px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        xxl: "48px",
        section: "64px",
        "section-lg": "96px",
      },
      boxShadow: {
        // DESIGN.md's one documented lift cue — reserved for light cards only.
        "soft-drop": "0 4px 24px rgba(0,0,0,0.08)",
      },
    },
  },
  plugins: [],
} satisfies Config;
