import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        heading: ["Inter", "sans-serif"],
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        border: "rgba(255, 255, 255, 0.08)",
        input: "rgba(255, 255, 255, 0.08)",
        ring: "rgba(255, 255, 255, 0.2)",
        background: "#050505", // Obsidian Black
        foreground: "#FFFFFF",
        primary: {
          DEFAULT: "#FFFFFF",
          foreground: "#000000",
        },
        secondary: {
          DEFAULT: "rgba(255, 255, 255, 0.1)",
          foreground: "#FFFFFF",
        },
        destructive: {
          DEFAULT: "#991B1B",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "rgba(255, 255, 255, 0.05)",
          foreground: "#A1A1AA", // Zinc-400
        },
        accent: {
          DEFAULT: "#4C8CFF", // Premium Blue
          foreground: "#FFFFFF",
        },
        popover: {
          DEFAULT: "#0D0D11",
          foreground: "#FFFFFF",
        },
        card: {
          DEFAULT: "#121218",
          foreground: "#FFFFFF",
        },
        glass: {
          DEFAULT: "rgba(255, 255, 255, 0.03)",
          border: "rgba(255, 255, 255, 0.08)",
          highlight: "rgba(255, 255, 255, 0.12)",
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "14px",
        "2xl": "20px",
        "3xl": "24px",
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(0, 0, 0, 0.5)",
        glow: "0 0 20px -5px rgba(76, 140, 255, 0.3)",
        premium: "0 14px 40px rgba(0,0,0,0.45)",
        "glass-inset": "inset 0 0 0 1px rgba(255,255,255,0.08)",
        "glass-hover": "0 0 0 1px rgba(255,255,255,0.15), 0 8px 32px rgba(0,0,0,0.4)",
        "neon-glow": "0 0 10px rgba(76, 140, 255, 0.5), 0 0 20px rgba(76, 140, 255, 0.3)",
      },
      backgroundImage: {
        "premium-gradient": "linear-gradient(to bottom, #070709, #0D0D11, #121218)",
        "blue-lavender": "linear-gradient(90deg, #4C8CFF, #8EA6FF)",
        "glass-gradient": "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
        "depth-light": "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 60%)",
        "void-black": "#020005",
        "orbital-glow": "radial-gradient(circle at 50% 50%, rgba(88, 28, 135, 0.2) 0%, rgba(22, 78, 99, 0.2) 100%)",
        "noise-pattern": "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E\")",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        tilt: {
          "0%, 100%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(0.5deg)" },
          "75%": { transform: "rotate(-0.5deg)" },
        },
        spotlight: {
          "0%": { opacity: "0", transform: "translate(-50%, -50%) scale(0.8)" },
          "100%": { opacity: "1", transform: "translate(-50%, -50%) scale(1)" },
        },
        "light-sweep": {
          "0%": { transform: "translateX(-100%) skewX(-20deg)" },
          "100%": { transform: "translateX(200%) skewX(-20deg)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.5", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.05)" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "0.7", transform: "scale(1.1)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" },
        },
        twinkle: {
          "0%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.2)" },
          "100%": { opacity: "0.4", transform: "scale(1)" },
        },
        move: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "100% 50%" },
        },
        "text-shimmer": {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "100% 50%" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.6s cubic-bezier(0.22, 0.61, 0.36, 1) forwards",
        float: "float 6s ease-in-out infinite",
        tilt: "tilt 10s infinite linear",
        spotlight: "spotlight 2s ease .75s 1 forwards",
        "light-sweep": "light-sweep 3s ease-in-out infinite",
        "pulse-glow": "pulse-glow 4s ease-in-out infinite",
        "pulse-slow": "pulse-slow 8s ease-in-out infinite",
        "float-slow": "float-slow 6s ease-in-out infinite",
        twinkle: "twinkle 3s ease-in-out infinite",
        move: "move 12s ease-in-out infinite alternate",
        "text-shimmer": "text-shimmer 2.5s ease-out infinite alternate",
      },
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
