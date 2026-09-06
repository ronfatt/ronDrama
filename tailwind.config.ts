import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#09090b",
        foreground: "#f4f4f5",
        studio: {
          950: "#060608",
          900: "#0a0a0d",
          850: "#101014",
          800: "#16161c",
          700: "#22222b",
          600: "#32323e",
        },
        gold: {
          300: "#f5e6a3",
          400: "#e6cc70",
          500: "#d4af37",
          600: "#b89324",
          700: "#8e6f14",
        },
        accent: {
          cyan: "#38bdf8",
          emerald: "#10b981",
          rose: "#f43f5e",
          amber: "#f59e0b",
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        cinematic: ["Trajan Pro", "Cinzel", "Georgia", "serif"],
        mono: ["JetBrains Mono", "Menlo", "Courier New", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
