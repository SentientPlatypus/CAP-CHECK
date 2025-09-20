import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
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
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "pixel-in": {
          "0%": {
            opacity: "0",
            transform: "scale(0) rotate(45deg)"
          },
          "50%": {
            opacity: "0.7",
            transform: "scale(1.2) rotate(0deg)"
          },
          "100%": {
            opacity: "1",
            transform: "scale(1) rotate(0deg)"
          }
        },
        "pixel-blink": {
          "0%, 50%": { 
            opacity: "1"
          },
          "51%, 100%": { 
            opacity: "0" 
          }
        },
        "pixel-bounce": {
          "0%, 100%": { 
            transform: "translateY(0px)" 
          },
          "25%": { 
            transform: "translateY(-8px)" 
          },
          "50%": { 
            transform: "translateY(-16px)" 
          },
          "75%": { 
            transform: "translateY(-8px)" 
          }
        },
        "retro-glow": {
          "0%, 100%": { 
            boxShadow: "0 0 10px hsl(0, 100%, 50%), 0 0 20px hsl(0, 100%, 50%)",
            filter: "brightness(1)"
          },
          "50%": { 
            boxShadow: "0 0 20px hsl(0, 100%, 50%), 0 0 40px hsl(0, 100%, 50%), 0 0 60px hsl(0, 100%, 50%)",
            filter: "brightness(1.3)"
          }
        },
        "scan-line": {
          "0%": {
            transform: "translateY(-100%)"
          },
          "100%": {
            transform: "translateY(100vh)"
          }
        },
        "power-up": {
          "0%": {
            transform: "scale(1)",
            filter: "brightness(1)"
          },
          "50%": {
            transform: "scale(1.1)",
            filter: "brightness(1.5) saturate(1.5)"
          },
          "100%": {
            transform: "scale(1)",
            filter: "brightness(1)"
          }
        },
        "glitch": {
          "0%, 100%": {
            transform: "translate(0)"
          },
          "20%": {
            transform: "translate(-2px, 2px)"
          },
          "40%": {
            transform: "translate(-2px, -2px)"
          },
          "60%": {
            transform: "translate(2px, 2px)"
          },
          "80%": {
            transform: "translate(2px, -2px)"
          }
        },
        "slide-from-left": {
          "0%": {
            transform: "translateX(-100%)",
            opacity: "0"
          },
          "100%": {
            transform: "translateX(0)",
            opacity: "1"
          }
        },
        "slide-from-right": {
          "0%": {
            transform: "translateX(100%)",
            opacity: "0"
          },
          "100%": {
            transform: "translateX(0)",
            opacity: "1"
          }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pixel-in": "pixel-in 0.4s steps(4, end)",
        "pixel-blink": "pixel-blink 0.8s infinite steps(2, end)",
        "pixel-bounce": "pixel-bounce 1s infinite steps(4, end)",
        "retro-glow": "retro-glow 2s ease-in-out infinite",
        "scan-line": "scan-line 3s linear infinite",
        "power-up": "power-up 0.6s ease-out",
        "glitch": "glitch 0.3s infinite",
        "slide-from-left": "slide-from-left 0.5s steps(8, end)",
        "slide-from-right": "slide-from-right 0.5s steps(8, end) 0.2s both"
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
