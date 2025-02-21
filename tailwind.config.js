/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  darkMode: ["class"],
  content: [
    './src/pages/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    fontFamily: {
      "plus-jakarta": ["Plus Jakarta Sans", "sans-serif"],
    },
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      spacing: {
        '7.5': '1.875rem', // 30px
        '12.5': '3.125rem', // 50px
        '17.5': '4.375rem', // 70px
        '25': '6.25rem',   // 100px
        '27.5': '6.875rem', // 110px
        '30': '7.5rem',    // 120px
        '35': '8.75rem',   // 140px
      },
      screens: {
        xsm: "375px",
        lsm: "425px",
        "3xl": "2000px",
        ...defaultTheme.screens,
      },
      zIndex: {
        99999: "99999",
        9999: "9999",
        999: "999",
        1: "1",
      },
      colors: {
        dark: {
          DEFAULT: "#030014",
          2: "#495270",
          3: "#918EA0",
          4: "#8D93A5",
          5: "#BBBEC9",
          6: "#191625",
          7: "#0F0C1F",
          8: "#100D20",
        },
        purple: {
          DEFAULT: "#3B82F6",
          dark: "#2563EB",
          "dark-2": "#1D4ED8",
          light: "#60A5FA",
          "light-2": "#93C5FD",
          "light-3": "#BFDBFE",
          "light-4": "#DBEAFE",
          "light-5": "#EFF6FF",
        },
        pink: {
          DEFAULT: "#3B82F6",
          dark: "#2563EB",
          light: "#60A5FA",
          "light-2": "#93C5FD",
          "light-3": "#BFDBFE",
          "light-4": "#DBEAFE",
        },
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
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      boxShadow: {
        button: "inset 0px -6px 15px rgba(96, 165, 250, 0.15), inset 0px 6px 15px rgba(37, 99, 235, 0.15)",
        dark: "0px 2px 4px rgba(11, 20, 51, 0.05), 0px 6px 24px rgba(11, 20, 51, 0.4)",
        video: "0px -3px 10px 0px rgba(0, 0, 0, 0.25) inset, 0px 26px 50px 0px rgba(18, 9, 36, 0.10)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
