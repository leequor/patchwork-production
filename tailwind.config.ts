import type { Config } from "tailwindcss";

/**
 * Patchwork design tokens — "Modern Premium Tech".
 *
 * Two rules govern this file:
 *   1. Surfaces separate by a step in tone, never by a heavier border.
 *   2. The accent gradient is reserved for primary actions and the hero glow.
 *      Everything else is ink on obsidian.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Ground */
        canvas: "#0A0A0A",
        sunken: "#070708",
        panel: "#0E0E10",
        raised: "#151519",
        overlay: "#1B1B21",

        /* Lines */
        hairline: "#FFFFFF14",
        "hairline-strong": "#FFFFFF26",

        /* Type */
        ink: {
          DEFAULT: "#F5F5F7",
          secondary: "#A3A3AC",
          tertiary: "#73737D",
          faint: "#4F4F58",
        },

        /* Accent: electric indigo → cyan. */
        accent: {
          DEFAULT: "#6366F1",
          bright: "#818CF8",
          deep: "#4F46E5",
          cyan: "#22D3EE",
          "cyan-deep": "#0E7490",
          soft: "#6366F11F",
        },

        positive: { DEFAULT: "#34D399", soft: "#34D3991A", ink: "#6EE7B7" },
        warn: { DEFAULT: "#FBBF24", soft: "#FBBF241A", ink: "#FCD34D" },
        negative: { DEFAULT: "#F87171", soft: "#F871711A", ink: "#FCA5A5" },
        info: { DEFAULT: "#60A5FA", soft: "#60A5FA1A", ink: "#93C5FD" },
      },

      fontFamily: {
        sans: [
          "var(--font-sans)",
          "Geist",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
        mono: [
          "var(--font-mono)",
          "Geist Mono",
          "ui-monospace",
          "SFMono-Regular",
          "monospace",
        ],
      },

      fontSize: {
        "2xs": ["11px", { lineHeight: "14px", letterSpacing: "0.02em" }],
        xs: ["12px", { lineHeight: "16px" }],
        sm: ["13px", { lineHeight: "18px" }],
        base: ["15px", { lineHeight: "23px" }],
        lg: ["17px", { lineHeight: "26px" }],
        xl: ["20px", { lineHeight: "28px" }],
        "2xl": ["24px", { lineHeight: "31px", letterSpacing: "-0.01em" }],
        "3xl": ["30px", { lineHeight: "36px", letterSpacing: "-0.02em" }],
        "4xl": ["38px", { lineHeight: "42px", letterSpacing: "-0.03em" }],
        "5xl": ["48px", { lineHeight: "50px", letterSpacing: "-0.035em" }],
        "6xl": ["60px", { lineHeight: "60px", letterSpacing: "-0.04em" }],
        "7xl": ["76px", { lineHeight: "72px", letterSpacing: "-0.045em" }],
      },

      letterSpacing: {
        tighter: "-0.045em",
        tight: "-0.025em",
        mono: "0.02em",
      },

      borderRadius: {
        none: "0px",
        sm: "6px",
        DEFAULT: "10px",
        md: "12px",
        lg: "14px",
        xl: "16px",
        "2xl": "20px",
        "3xl": "28px",
        full: "9999px",
      },

      boxShadow: {
        panel: "0 1px 0 0 rgba(255,255,255,0.05) inset, 0 24px 48px -24px rgba(0,0,0,0.9)",
        lift: "0 18px 40px -22px rgba(0,0,0,0.9), 0 1px 0 0 rgba(255,255,255,0.06) inset",
        float:
          "0 40px 80px -32px rgba(0,0,0,0.95), 0 2px 0 0 rgba(255,255,255,0.05) inset",
        glow: "0 0 56px -12px rgba(99,102,241,0.5)",
        "inset-line": "inset 0 1px 0 0 rgba(255,255,255,0.06)",
        focus:
          "0 0 0 1px rgba(129,140,248,0.7), 0 0 0 4px rgba(99,102,241,0.18)",
      },

      backgroundImage: {
        "accent-fill": "linear-gradient(100deg, #4F46E5 0%, #4338CA 52%, #0E7490 100%)",
        "accent-lit": "linear-gradient(100deg, #6366F1 0%, #22D3EE 100%)",
        "accent-wash":
          "linear-gradient(100deg, rgba(99,102,241,0.18) 0%, rgba(34,211,238,0.10) 100%)",
        "panel-sheen":
          "linear-gradient(180deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0) 100%)",
        "hairline-fade":
          "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.14) 50%, transparent 100%)",
        "dot-grid":
          "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.07) 1px, transparent 0)",
      },

      backgroundSize: {
        "dot-grid": "22px 22px",
      },

      spacing: {
        "4.5": "18px",
        18: "72px",
        sidebar: "264px",
        header: "64px",
        gutter: "24px",
      },

      maxWidth: {
        canvas: "1320px",
        reading: "62ch",
        form: "400px",
      },

      transitionTimingFunction: {
        spring: "cubic-bezier(0.22, 1, 0.36, 1)",
        snap: "cubic-bezier(0.4, 0, 0.2, 1)",
      },

      transitionDuration: {
        140: "140ms",
        220: "220ms",
        420: "420ms",
      },

      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "halo-breathe": {
          "0%, 100%": { opacity: "0.55", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.04)" },
        },
      },

      animation: {
        "fade-up": "fade-up 520ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "halo-breathe": "halo-breathe 9s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
