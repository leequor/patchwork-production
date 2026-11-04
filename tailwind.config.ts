import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Poster surface — the shop's window at night.
        night: "#0B171C",
        nightPanel: "#12242A",
        nightRaised: "#1A3037",
        nightLine: "#254049",
        cream: "#F1EBDD",
        creamMuted: "#9CAFAF",
        accentLit: "#F07344",
        onAccent: "#FFFAF0",

        // Paper surface — newsprint stock, cool rather than cream.
        paper: "#E2E5DD",
        surface: "#EEF1E9",
        raised: "#F7F9F2",
        ink: "#131A1D",
        muted: "#58615C",
        line: "#C7CCC1",
        wash: "#D6DAD0",
        accent: "#CE3F1B",
        gold: "#A93213",
        steel: "#4C5F66",
        info: "#2F5567",
        positive: {
          DEFAULT: "#1E6B4C",
          soft: "#DCEAE1",
          ink: "#14442F",
        },
        negative: {
          DEFAULT: "#A82B21",
          soft: "#F3DEDA",
          ink: "#6E1A13",
        },
        warn: {
          DEFAULT: "#8A520B",
          soft: "#F1E5D1",
          lit: "#E7B778",
        },
      },
      fontFamily: {
        sans: ["var(--font-display)", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["var(--font-text)", "Georgia", "Times New Roman", "serif"],
        mono: ["ui-monospace", "SFMono-Regular", "monospace"],
      },
      borderRadius: {
        none: "0px",
        sm: "2px",
        DEFAULT: "2px",
        md: "2px",
        lg: "3px",
        xl: "3px",
        "2xl": "3px",
        full: "9999px",
      },
      maxWidth: {
        canvas: "1240px",
        form: "420px",
        prose: "62ch",
      },
      letterSpacing: {
        display: "-0.035em",
      },
    },
  },
  plugins: [],
};

export default config;
