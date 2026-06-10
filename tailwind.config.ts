import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        flux: {
          bg: "rgb(var(--flux-bg) / <alpha-value>)",
          sidebar: "rgb(var(--flux-sidebar) / <alpha-value>)",
          surface: "rgb(var(--flux-surface) / <alpha-value>)",
          surfaceAlt: "rgb(var(--flux-surface-alt) / <alpha-value>)",
          border: "rgb(var(--flux-border) / <alpha-value>)",
          primary: "rgb(var(--flux-primary) / <alpha-value>)",
          text: "rgb(var(--flux-text) / <alpha-value>)",
          muted: "rgb(var(--flux-muted) / <alpha-value>)",
          danger: "rgb(var(--flux-danger) / <alpha-value>)",
          success: "rgb(var(--flux-success) / <alpha-value>)"
        }
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(212,168,67,0.25), 0 14px 30px rgba(0,0,0,0.45)",
        card: "0 20px 40px rgba(0,0,0,0.35)"
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        pulseBorder: {
          "0%,100%": { borderColor: "rgba(212,168,67,0.25)" },
          "50%": { borderColor: "rgba(212,168,67,0.6)" }
        }
      },
      animation: {
        "fade-up": "fade-up 0.35s ease-out",
        pulseBorder: "pulseBorder 2.3s ease-in-out infinite"
      }
    }
  },
  plugins: []
};

export default config;