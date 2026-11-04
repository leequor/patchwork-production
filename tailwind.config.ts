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
        paper: "#0D1413",
        surface: "#141D1B",
        raised: "#1B2623",
        ink: "#E7E8E3",
        muted: "#8C9A95",
        line: "#26332F",
        wash: "#1F2A27",
        accent: "#D9A441",
        gold: "#E0C079",
        steel: "#7C8794",
        info: "#7EA6D9",
        positive: {
          DEFAULT: "#5BE0A0",
          soft: "#10281E",
          ink: "#B9F7D9",
        },
        negative: {
          DEFAULT: "#FF7A6B",
          soft: "#2B1517",
          ink: "#FFD0D0",
        },
        warn: {
          DEFAULT: "#CBA85E",
          soft: "#2B2113",
        },
      },
      fontFamily: {
        sans: ["var(--font-plex-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-plex-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      borderRadius: {
        none: "0px",
        sm: "3px",
        DEFAULT: "4px",
        md: "4px",
        lg: "6px",
        xl: "8px",
        "2xl": "10px",
        full: "9999px",
      },
      maxWidth: {
        canvas: "1120px",
        form: "400px",
      },
    },
  },
  plugins: [],
};

export default config;
