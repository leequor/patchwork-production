import type { Config } from "tailwindcss";

/**
 * Patchwork design tokens — the violet bench.
 *
 * The product is a repair bench at night, lit by a violet lamp: a cool ground
 * with a violet cast, near-white ink, and one indigo accent that fades toward
 * cyan. Three rules govern this file:
 *
 *   1. Surfaces separate by a step in tone, never by a heavier border.
 *   2. Colour is a signal, not a decoration. The indigo marks the one primary
 *      action and live state; moss and vermilion mark the only two states the
 *      shop has to act on. Everything else is ink on violet-black.
 *   3. Geometry is tight and physical: controls 6px, panels 10px, no pills.
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
        /* Ground — a violet-black, the colour of a bench under a cool lamp. */
        canvas: "#09080F",
        sunken: "#06050B",
        panel: "#110F1C",
        raised: "#18162A",
        overlay: "#201D38",

        /* Lines — a lit top edge, not a border. */
        hairline: "#E7E3FF0F",
        "hairline-strong": "#E7E3FF1F",

        /* Type — near-white with a violet cast, and its steps down to quiet. */
        ink: {
          DEFAULT: "#F1EFFA",
          secondary: "#B5B1CA",
          tertiary: "#928DA9",
          faint: "#8C87A3",
        },

        /* Indigo: the bench lamp. Primary action and live state only. */
        accent: {
          DEFAULT: "#6E5CF7",
          bright: "#9C8BFF",
          deep: "#4E3DE0",
          cyan: "#45D3E8",
          "cyan-deep": "#12707E",
          soft: "#6E5CF71F",
        },

        /* Signals. Two alarms and a caution lamp; nothing else earns a hue. */
        positive: { DEFAULT: "#4FD3A1", soft: "#4FD3A11A", ink: "#7FE8C2" },
        warn: { DEFAULT: "#EDB24A", soft: "#EDB24A1A", ink: "#F7CB80" },
        negative: { DEFAULT: "#F4685F", soft: "#F4685F1A", ink: "#F9938C" },
        info: { DEFAULT: "#7FB6F0", soft: "#7FB6F01A", ink: "#A6CDF7" },
      },

      fontFamily: {
        sans: [
          "var(--font-sans)",
          "Instrument Sans",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
        mono: [
          "var(--font-mono)",
          "IBM Plex Mono",
          "ui-monospace",
          "SFMono-Regular",
          "monospace",
        ],
      },

      fontSize: {
        "2xs": ["11px", { lineHeight: "14px", letterSpacing: "0.04em" }],
        xs: ["12px", { lineHeight: "16px" }],
        sm: ["13px", { lineHeight: "19px" }],
        base: ["15px", { lineHeight: "24px" }],
        lg: ["17px", { lineHeight: "26px" }],
        xl: ["20px", { lineHeight: "28px" }],
        "2xl": ["24px", { lineHeight: "30px", letterSpacing: "-0.015em" }],
        "3xl": ["30px", { lineHeight: "34px", letterSpacing: "-0.02em" }],
        "4xl": ["38px", { lineHeight: "40px", letterSpacing: "-0.025em" }],
        "5xl": ["48px", { lineHeight: "48px", letterSpacing: "-0.03em" }],
        "6xl": ["60px", { lineHeight: "59px", letterSpacing: "-0.032em" }],
        "7xl": ["76px", { lineHeight: "72px", letterSpacing: "-0.034em" }],
      },

      letterSpacing: {
        tighter: "-0.034em",
        tight: "-0.022em",
        mono: "0.04em",
      },

      borderRadius: {
        none: "0px",
        sm: "4px",
        DEFAULT: "6px",
        md: "8px",
        lg: "10px",
        xl: "12px",
        "2xl": "14px",
        "3xl": "18px",
        full: "9999px",
      },

      boxShadow: {
        /* Depth is a real offset plus a soft falloff, never a coloured halo. */
        panel:
          "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 18px 40px -28px rgba(0,0,0,0.95)",
        lift: "0 14px 34px -22px rgba(0,0,0,0.95), 0 1px 0 0 rgba(255,255,255,0.05) inset",
        float: "0 32px 70px -30px rgba(0,0,0,0.98), 0 1px 0 0 rgba(255,255,255,0.05) inset",
        glow: "0 0 0 1px rgba(217,164,65,0.35), 0 10px 30px -16px rgba(217,164,65,0.35)",
        "inset-line": "inset 0 1px 0 0 rgba(255,255,255,0.05)",
        focus:
          "0 0 0 1px rgba(239,188,99,0.8), 0 0 0 4px rgba(217,164,65,0.16)",
      },

      backgroundImage: {
        /* Brass hardware: a metal face, not a decorative gradient. */
        "accent-fill": "linear-gradient(180deg, #E5B055 0%, #CF9832 100%)",
        "accent-lit": "linear-gradient(180deg, #EFBC63 0%, #C88F2B 100%)",
        "accent-wash":
          "linear-gradient(180deg, rgba(217,164,65,0.14) 0%, rgba(217,164,65,0.03) 100%)",
        "panel-sheen":
          "linear-gradient(180deg, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0) 100%)",
        "hairline-fade":
          "linear-gradient(90deg, transparent 0%, rgba(237,237,230,0.14) 50%, transparent 100%)",
      },

      spacing: {
        "4.5": "18px",
        18: "72px",
        sidebar: "72px",
        header: "56px",
        gutter: "24px",
      },

      maxWidth: {
        canvas: "1320px",
        reading: "64ch",
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
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "lamp-breathe": {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "0.72" },
        },
        "trace-run": {
          from: { strokeDashoffset: "220" },
          to: { strokeDashoffset: "0" },
        },
      },

      animation: {
        "fade-up": "fade-up 520ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "lamp-breathe": "lamp-breathe 11s ease-in-out infinite",
        "trace-run": "trace-run 6s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
